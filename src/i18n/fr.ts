/**
 * Textes en français (langue de référence). Les clés de `html` correspondent aux
 * attributs data-i18n / data-i18n-attr de index.html ; les valeurs peuvent contenir du HTML.
 */
export const fr = {
  meta: {
    title: 'Cédric Bagot, ingénieur DevOps et développeur',
    description: "Cédric Bagot, ingénieur DevOps en alternance chez Formasup Méditerranée et étudiant en M1 MIAGE à l'Université Côte d'Azur.",
  },

  /** Phrases de la machine à écrire, dans l'ordre. */
  typewriter: [
    "curieux d'IA.",
    'rigoureux.',
    'autonome.',
    'accro au CI/CD.',
    'cloud & AWS.',
    'full-stack.',
  ],

  html: {
    'skip': 'Aller au contenu',
    'nav.label': 'Navigation principale',
    'nav.parcours': 'Parcours',
    'nav.formation': 'Formation',
    'nav.stack': 'Stack',
    'nav.labo': 'Labo IA',
    'nav.contact': 'Contact',
    'lang.label': 'Langue',

    'hero.title': 'Ingénieur DevOps,<br>développeur,',
    'hero.lead': "Alternant chez Formasup Méditerranée et étudiant en M1 MIAGE à l'Université Côte d'Azur. Je fais tourner Cactus, un ERP Symfony hébergé sur AWS, du pipeline jusqu'à la fonctionnalité.",
    'hero.cta': 'Lire le parcours',
    'hero.caption': 'Fig. 1 · Infrastructure, vue en rotation',

    'parcours.title': 'Parcours',
    'job1.date': '2024 · auj.',
    'job1.title': 'Ingénieur DevOps en alternance',
    'job1.desc': "Maintenance et évolution de Cactus, ERP sur AWS en Symfony 6 : pipelines de déploiement, administration serveurs, monitoring et nouvelles fonctionnalités avec l'équipe produit.",
    'job2.title': "Ingénieur systèmes d'information",
    'job2.desc': "Responsable du SI d'un centre de formation : infrastructure, outillage interne, bases de données et projets transverses. Interlocuteur unique pour le numérique de tous les services.",
    'job3.title': 'Développeur web',
    'job3.desc': 'Applications web internes en Django pour les opérations quotidiennes, pendant une phase de forte croissance.',
    'job4.title': 'Développeur full-stack en alternance',
    'job4.desc': "Interface web d'accès aux documents qualité, en appui du renouvellement ISO 9001.",
    'job5.title': 'Stagiaire développeur web',
    'job5.desc': 'Première immersion professionnelle en développement web.',

    'formation.title': 'Formation',
    'deg1.date': '2025 · en cours',
    'deg1.title': 'M1 MIAGE, IA appliquée',
    'deg2.title': 'Licence MIASHS, MIAGE',
    'deg2.school': "Université Côte d'Azur · mention Bien",
    'deg3.title': 'LP Web &amp; Big Data',
    'deg3.school': "IUT d'Aix-Marseille · mention Assez bien",
    'deg4.title': 'DUT Informatique',
    'deg4.school': 'IUT de Valence, Université Grenoble Alpes',
    'certif': '<strong>Certification SkyReal.</strong> Développement VR sur Unreal Engine : scénarios immersifs pour la maintenance aéronautique, en 3D temps réel.',

    'stack.list': 'AWS / Docker / CI/CD / Linux / Bash / <em class="accent">Symfony 6</em> / Django / PHP / Python / API REST / SQL / MySQL / PostgreSQL / Twig / JavaScript / <em class="accent">Machine learning</em> / Unreal Engine',
    'stack.languages': 'Français natif · Anglais professionnel · Créole mauricien courant',

    'labo.eyebrow': 'Expérience interactive',
    'labo.title': 'Labo IA',
    'labo.intro': "Dessinez un chiffre de 0 à 9. Un petit réseau de neurones que j'ai entraîné sur MNIST le reconnaît en direct, entièrement dans votre navigateur.",
    'labo.pad': 'Zone de dessin : dessinez un chiffre à la souris ou au doigt',
    'labo.model': 'MLP 196 → 64 → 10<br>~94 % en validation',
    'labo.clear': 'Effacer',
    'labo.prediction': 'Prédiction',

    'contact.title': 'Écrivez-moi.',
  },

  lab: {
    loading: 'Chargement du modèle…',
    error: 'Modèle indisponible',
    empty: 'Dessinez dans le cadre',
    cleared: 'Zone de dessin effacée',
    pct: (p: number) => `${p} %`,
    confidence: (p: number) => `Confiance : ${p} %`,
    announce: (d: number, p: number) => `Prédiction : ${d}, confiance ${p} %`,
  },
};

export type Messages = typeof fr;
