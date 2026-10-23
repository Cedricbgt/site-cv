import './style.css';
import { initSphere } from './sphere';
import { initTypewriter } from './typewriter';
import { initDigitLab } from './digit-lab';
import { initI18n, onLangChange, t } from './i18n';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1F4FD8';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// Langue appliquée en premier pour que les modules démarrent avec les bons textes.
initI18n();

initSphere($<HTMLCanvasElement>('sphere'), { speed: 1, reducedMotion, accent });

const typewriter = initTypewriter($('typed'), $('typed-sr'), t().typewriter, { reducedMotion });

const renderLab = initDigitLab(
  {
    pad: $<HTMLCanvasElement>('pad'),
    clear: $<HTMLButtonElement>('pad-clear'),
    guess: $('guess'),
    conf: $('conf'),
    bars: $('bars'),
    status: $('lab-status'),
  },
  // BASE_URL gère le sous-chemin de GitHub Pages (/<repo>/).
  import.meta.env.BASE_URL + 'model.json',
  () => t().lab,
);

onLangChange(() => {
  typewriter.setPhrases(t().typewriter);
  renderLab();
});
