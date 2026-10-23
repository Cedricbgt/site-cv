import { fr, type Messages } from './fr';
import { en } from './en';

export type Lang = 'fr' | 'en';
export type HtmlKey = keyof Messages['html'];

const MESSAGES: Record<Lang, Messages> = { fr, en };
const STORAGE_KEY = 'lang';

let current: Lang = 'fr';
const listeners: ((lang: Lang) => void)[] = [];

const isLang = (v: unknown): v is Lang => v === 'fr' || v === 'en';

/** Ordre de priorité : ?lang= dans l'URL, choix mémorisé, langue du navigateur (fr sinon en). */
export function detectLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch { /* stockage indisponible */ }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return prefs.some((l) => l?.toLowerCase().startsWith('fr')) ? 'fr' : 'en';
}

export const getLang = () => current;
export const t = (): Messages => MESSAGES[current];

export function onLangChange(cb: (lang: Lang) => void) {
  listeners.push(cb);
}

/** Remplace les textes marqués data-i18n et les attributs data-i18n-attr="attr:clé;attr:clé". */
function applyToDom(m: Messages) {
  document.documentElement.lang = current;
  document.title = m.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', m.meta.description);

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as HtmlKey;
    if (key in m.html) el.innerHTML = m.html[key];
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    for (const pair of el.dataset.i18nAttr!.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (key in m.html) el.setAttribute(attr, m.html[key as HtmlKey]);
    }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.setLang === current));
  });
}

export function setLang(lang: Lang, persist = true) {
  current = lang;
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* stockage indisponible */ }
  }
  applyToDom(MESSAGES[lang]);
  listeners.forEach((cb) => cb(lang));
}

/** Branche les boutons [data-set-lang] et applique la langue détectée. */
export function initI18n() {
  document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.setLang;
      if (isLang(lang) && lang !== current) setLang(lang);
    });
  });
  setLang(detectLang(), false);
}
