import type { Messages } from './i18n/fr';

/** Tenseur int8 quantifié : valeur réelle = int8 × s. */
interface QuantTensor {
  s: number;
  d: string;
  shape: number[];
}

interface ModelFile {
  w1: QuantTensor;
  w2: QuantTensor;
  b1: number[];
  b2: number[];
}

interface Model {
  w1: Float32Array;
  w2: Float32Array;
  b1: number[];
  b2: number[];
  nin: number;
  nh: number;
}

interface Elements {
  pad: HTMLCanvasElement;
  clear: HTMLButtonElement;
  guess: HTMLElement;
  conf: HTMLElement;
  bars: HTMLElement;
  /** Région aria-live annoncée à la fin de chaque tracé. */
  status: HTMLElement;
}

const PAD = 280;
const INK = '#16181D';
const PAPER = '#FFFFFF';

function dequantize(o: QuantTensor): Float32Array {
  const bin = atob(o.d);
  const out = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    let v = bin.charCodeAt(i);
    if (v > 127) v -= 256;
    out[i] = v * o.s;
  }
  return out;
}

async function loadModel(url: string): Promise<Model> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const m = (await res.json()) as ModelFile;
  return { w1: dequantize(m.w1), w2: dequantize(m.w2), b1: m.b1, b2: m.b2, nin: m.w1.shape[0], nh: m.w1.shape[1] };
}

/**
 * Prétraitement façon MNIST : recadrage sur la boîte englobante, mise à l'échelle
 * dans 20×20 au centre d'une image 28×28, recentrage sur le centre de masse,
 * puis sous-échantillonnage 2×2 vers 14×14 (196 entrées).
 * Renvoie null si le cadre est vide.
 */
function preprocess(pad: HTMLCanvasElement, off: HTMLCanvasElement): Float32Array | null {
  const d = pad.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, PAD, PAD).data;
  let minX = PAD, minY = PAD, maxX = -1, maxY = -1;
  for (let y = 0; y < PAD; y++) for (let x = 0; x < PAD; x++) {
    if (d[(y * PAD + x) * 4] < 200) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;

  const o = off.getContext('2d', { willReadFrequently: true })!;
  const bw = maxX - minX + 1, bh = maxY - minY + 1, s = 20 / Math.max(bw, bh), dw = bw * s, dh = bh * s;
  o.fillStyle = PAPER;
  o.fillRect(0, 0, 28, 28);
  o.imageSmoothingEnabled = true;
  o.imageSmoothingQuality = 'high';
  o.drawImage(pad, minX, minY, bw, bh, (28 - dw) / 2, (28 - dh) / 2, dw, dh);
  const px = o.getImageData(0, 0, 28, 28).data;

  const a = new Float32Array(784);
  let m = 0, cx = 0, cy = 0;
  for (let i = 0; i < 784; i++) {
    const v = Math.min(1, (1 - px[i * 4] / 255) * 1.3);
    a[i] = v; m += v; cx += v * (i % 28); cy += v * Math.floor(i / 28);
  }
  const sx = m ? Math.round(13.5 - cx / m) : 0, sy = m ? Math.round(13.5 - cy / m) : 0;
  const b = new Float32Array(784);
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
    const X = x - sx, Y = y - sy;
    if (X >= 0 && X < 28 && Y >= 0 && Y < 28) b[y * 28 + x] = a[Y * 28 + X];
  }

  const inp = new Float32Array(196);
  for (let r = 0; r < 14; r++) for (let c = 0; c < 14; c++) {
    inp[r * 14 + c] = (b[2 * r * 28 + 2 * c] + b[2 * r * 28 + 2 * c + 1] + b[(2 * r + 1) * 28 + 2 * c] + b[(2 * r + 1) * 28 + 2 * c + 1]) / 4;
  }
  return inp;
}

/** Passe avant du MLP (ReLU puis softmax). */
function forward(M: Model, inp: Float32Array): number[] {
  const H = M.nh, hid = new Float32Array(H);
  for (let j = 0; j < H; j++) {
    let sum = M.b1[j];
    for (let i = 0; i < M.nin; i++) sum += inp[i] * M.w1[i * H + j];
    hid[j] = sum > 0 ? sum : 0;
  }
  const out: number[] = [];
  for (let k = 0; k < 10; k++) {
    let sum = M.b2[k];
    for (let j = 0; j < H; j++) sum += hid[j] * M.w2[j * 10 + k];
    out.push(sum);
  }
  const mx = Math.max(...out), ex = out.map((v) => Math.exp(v - mx)), tot = ex.reduce((p, q) => p + q, 0);
  return ex.map((v) => v / tot);
}

/**
 * Branche le Labo IA. `messages` est relu à chaque rendu pour suivre la langue ;
 * la fonction renvoyée redessine les textes (à appeler au changement de langue).
 */
export function initDigitLab(el: Elements, modelUrl: string, messages: () => Messages['lab']): () => void {
  const { pad } = el;
  pad.width = PAD;
  pad.height = PAD;
  const ctx = pad.getContext('2d', { willReadFrequently: true })!;
  const off = document.createElement('canvas');
  off.width = 28;
  off.height = 28;

  let model: Model | null = null;
  let loadErr = false;
  let probs: number[] | null = null;
  let drawing = false;
  let pending = false;
  let last: [number, number] = [0, 0];

  // Barres de probabilité 0 à 9.
  const fills: HTMLElement[] = [];
  const pcts: HTMLElement[] = [];
  for (let d = 0; d < 10; d++) {
    const row = document.createElement('div');
    row.className = 'bar';
    row.innerHTML = `<span class="bar-digit">${d}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill"></div></div><span class="bar-pct">0 %</span>`;
    fills.push(row.querySelector('.bar-fill')!);
    pcts.push(row.querySelector('.bar-pct')!);
    el.bars.append(row);
  }

  const best = () => {
    let i = -1, p = 0;
    probs?.forEach((v, k) => { if (v > p) { p = v; i = k; } });
    return { i, p };
  };

  const render = () => {
    const L = messages();
    const { i, p } = best();
    for (let d = 0; d < 10; d++) {
      const v = probs ? probs[d] : 0;
      fills[d].style.width = (v * 100).toFixed(1) + '%';
      fills[d].classList.toggle('best', d === i);
      pcts[d].textContent = L.pct(Math.round(v * 100));
    }
    el.guess.textContent = i >= 0 ? String(i) : '?';
    el.conf.textContent = loadErr ? L.error
      : !model ? L.loading
      : probs ? L.confidence(Math.round(p * 100))
      : L.empty;
  };

  const announce = () => {
    const { i, p } = best();
    el.status.textContent = i >= 0 ? messages().announce(i, Math.round(p * 100)) : '';
  };

  const predict = () => {
    if (!model) return;
    const inp = preprocess(pad, off);
    probs = inp ? forward(model, inp) : null;
    render();
  };

  const wipe = () => {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, PAD, PAD);
  };

  const pos = (e: PointerEvent): [number, number] => {
    const r = pad.getBoundingClientRect();
    return [((e.clientX - r.left) * PAD) / r.width, ((e.clientY - r.top) * PAD) / r.height];
  };

  const line = (a: [number, number], b: [number, number]) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  };

  // Une prédiction au plus par frame pendant le tracé.
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; predict(); });
  };

  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { pad.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
    drawing = true;
    last = pos(e);
    line(last, [last[0] + 0.1, last[1]]);
    schedule();
  });
  pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    line(last, p);
    last = p;
    schedule();
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    predict();
    announce();
  };
  pad.addEventListener('pointerup', end);
  pad.addEventListener('pointercancel', end);
  pad.addEventListener('pointerleave', end);

  el.clear.addEventListener('click', () => {
    wipe();
    probs = null;
    render();
    el.status.textContent = messages().cleared;
  });

  wipe();
  render();

  loadModel(modelUrl)
    .then((m) => { model = m; predict(); render(); })
    .catch(() => { loadErr = true; render(); });

  return render;
}
