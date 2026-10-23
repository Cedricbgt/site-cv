type Vec3 = [number, number, number];

interface Options {
  /** Multiplicateur de vitesse de rotation (1 = vitesse de la maquette). */
  speed?: number;
  reducedMotion?: boolean;
  accent?: string;
}

const INK = '#16181D';

const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * Icosaèdre subdivisé une fois : les 12 sommets d'origine (dessinés en accent)
 * puis les milieux d'arêtes reprojetés sur la sphère. Les arêtes relient les
 * points voisins les plus proches.
 */
function buildGeodesic() {
  const t = (1 + Math.sqrt(5)) / 2;
  const base = ([
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ] as Vec3[]).map(norm);

  const verts = base.slice();
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (dist(base[i], base[j]) < 1.1) {
      verts.push(norm([base[i][0] + base[j][0], base[i][1] + base[j][1], base[i][2] + base[j][2]]));
    }
  }

  let min = Infinity;
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) min = Math.min(min, dist(verts[i], verts[j]));

  const edges: [number, number][] = [];
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) {
    if (dist(verts[i], verts[j]) < min * 1.25) edges.push([i, j]);
  }
  return { verts, edges };
}

/**
 * Sphère géodésique en rotation qui s'incline vers la souris.
 * L'animation se met en pause quand le canvas sort de l'écran.
 * Renvoie une fonction d'arrêt.
 */
export function initSphere(canvas: HTMLCanvasElement, opts: Options = {}): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const { verts, edges } = buildGeodesic();
  const accent = opts.accent ?? '#1F4FD8';
  const speed = (opts.speed ?? 1) * (opts.reducedMotion ? 0.2 : 1);

  const mouse = { x: 0, y: 0 };
  let rx = 0.3, ry = 0, spin = 0;
  let raf = 0;

  const onMove = (e: PointerEvent) => {
    mouse.x = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
    mouse.y = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    spin += 0.003 * speed;
    rx += ((0.3 + mouse.y * 0.3) - rx) * 0.04;
    ry += (mouse.x * 0.5 - ry) * 0.04;

    const ay = spin + ry, ax = rx;
    const cY = Math.cos(ay), sY = Math.sin(ay), cX = Math.cos(ax), sX = Math.sin(ax);
    const ox = w / 2, oy = h / 2 - 10, R = Math.min(w, h) * 0.36;

    // Rotation Y puis X, puis perspective légère ; r = rayon relatif.
    const project = (v: Vec3, r: number) => {
      const x1 = v[0] * cY + v[2] * sY;
      const z1 = -v[0] * sY + v[2] * cY;
      const y2 = v[1] * cX - z1 * sX;
      const z2 = v[1] * sX + z1 * cX;
      const s = 3 / (3 - z2 * r);
      return { X: ox + x1 * R * r * s, Y: oy + y2 * R * r * s, z: z2 };
    };

    // Deux orbites autour de la sphère.
    ctx.strokeStyle = 'rgba(22,24,29,0.18)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      for (let a = 0; a <= 64; a++) {
        const th = (a / 64) * Math.PI * 2;
        const v: Vec3 = k === 0 ? [Math.cos(th), 0, Math.sin(th)] : [Math.cos(th), Math.sin(th) * 0.25, Math.sin(th)];
        const p = project(v, 1.35 + k * 0.15);
        if (a === 0) ctx.moveTo(p.X, p.Y); else ctx.lineTo(p.X, p.Y);
      }
      ctx.stroke();
    }

    const pr = verts.map((v) => project(v, 1));
    for (const [i, j] of edges) {
      const a = pr[i], b = pr[j], d = ((a.z + b.z) / 2 + 1) / 2;
      ctx.strokeStyle = 'rgba(22,24,29,' + (0.12 + d * 0.7).toFixed(3) + ')';
      ctx.lineWidth = 0.6 + d;
      ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    }

    pr.forEach((p, i) => {
      const d = (p.z + 1) / 2;
      ctx.fillStyle = i < 12 ? accent : INK;
      ctx.globalAlpha = 0.2 + d * 0.8;
      ctx.beginPath(); ctx.arc(p.X, p.Y, (i < 12 ? 4 : 2.4) * (0.7 + d * 0.5), 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Satellite sur l'orbite équatoriale.
    const orb = project([Math.cos(spin * 3), 0, Math.sin(spin * 3)], 1.35);
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(orb.X, orb.Y, 5, 0, Math.PI * 2); ctx.fill();
  };

  const tick = () => {
    raf = requestAnimationFrame(tick);
    draw();
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start(); else stop();
  });
  io.observe(canvas);
  start();

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
  };
}
