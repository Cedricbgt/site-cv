// Les phrases sont définies par langue dans src/i18n/*.ts (clé `typewriter`).

const TICK_MS = 65;
/** Pause (en ticks) une fois la phrase entièrement tapée. */
const HOLD_TICKS = 28;
/** Pause (en ticks) avant de taper la phrase suivante. */
const GAP_TICKS = 6;

interface Options {
  reducedMotion?: boolean;
}

export interface Typewriter {
  /** Remplace les phrases (changement de langue) et repart de la première. */
  setPhrases(phrases: string[]): void;
  stop(): void;
}

/**
 * Anime `target` façon machine à écrire. Le texte animé est masqué aux lecteurs
 * d'écran ; `srTarget` reçoit la liste complète des phrases, lue une seule fois.
 */
export function initTypewriter(target: HTMLElement, srTarget: HTMLElement | null, phrases: string[], opts: Options = {}): Typewriter {
  let list: string[] = [];
  const state = { i: 0, n: 0, del: false, wait: 0 };

  // On part de la première phrase entière pour éviter un flash à vide.
  const setPhrases = (next: string[]) => {
    list = next.map((s) => s.trim()).filter(Boolean);
    if (!list.length) list = [''];
    if (srTarget) srTarget.textContent = ' ' + list.join(' ');
    Object.assign(state, { i: 0, n: list[0].length, del: false, wait: HOLD_TICKS });
    target.textContent = list[0];
  };
  setPhrases(phrases);

  // Mouvement réduit : la première phrase reste affichée, sans animation.
  if (opts.reducedMotion) return { setPhrases, stop: () => {} };

  const step = () => {
    const p = list[state.i % list.length];
    if (state.wait > 0) { state.wait--; return; }
    if (!state.del) {
      if (state.n < p.length) state.n++;
      else { state.del = true; state.wait = HOLD_TICKS; }
    } else {
      if (state.n > 0) state.n--;
      else { state.del = false; state.i++; state.wait = GAP_TICKS; }
    }
    target.textContent = list[state.i % list.length].slice(0, state.n);
  };

  const timer = window.setInterval(step, TICK_MS);
  return { setPhrases, stop: () => window.clearInterval(timer) };
}
