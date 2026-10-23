import type { Messages } from './fr';

export const en: Messages = {
  meta: {
    title: 'Cédric Bagot, DevOps engineer and developer',
    description: "Cédric Bagot, work-study DevOps engineer at Formasup Méditerranée and first-year MIAGE master's student at Université Côte d'Azur.",
  },

  typewriter: [
    'curious about AI.',
    'rigorous.',
    'self-driven.',
    'hooked on CI/CD.',
    'cloud & AWS.',
    'full-stack.',
  ],

  html: {
    'skip': 'Skip to content',
    'nav.label': 'Main navigation',
    'nav.parcours': 'Experience',
    'nav.formation': 'Education',
    'nav.stack': 'Stack',
    'nav.labo': 'AI Lab',
    'nav.contact': 'Contact',
    'lang.label': 'Language',

    'hero.title': 'DevOps engineer,<br>developer,',
    'hero.lead': "Work-study student at Formasup Méditerranée and first-year MIAGE master's student at Université Côte d'Azur. I run Cactus, a Symfony ERP hosted on AWS, from the pipeline to the feature.",
    'hero.cta': 'Read my experience',
    'hero.caption': 'Fig. 1 · Infrastructure, rotating view',

    'parcours.title': 'Experience',
    'job1.date': '2024 · now',
    'job1.title': 'DevOps engineer, work-study',
    'job1.desc': 'Maintaining and evolving Cactus, an AWS-hosted ERP built on Symfony 6: deployment pipelines, server administration, monitoring and new features alongside the product team.',
    'job2.title': 'Information systems engineer',
    'job2.desc': "In charge of a training centre's information system: infrastructure, internal tooling, databases and cross-team projects. Single point of contact for every department's digital needs.",
    'job3.title': 'Web developer',
    'job3.desc': 'Internal Django web applications for day-to-day operations, during a period of rapid growth.',
    'job4.title': 'Full-stack developer, work-study',
    'job4.desc': 'Web interface giving access to quality documents, supporting the ISO 9001 recertification.',
    'job5.title': 'Web developer intern',
    'job5.desc': 'First professional experience in web development.',

    'formation.title': 'Education',
    'deg1.date': '2025 · ongoing',
    'deg1.title': "Master's year 1, MIAGE, applied AI",
    'deg2.title': "Bachelor's in MIASHS, MIAGE track",
    'deg2.school': "Université Côte d'Azur · with honours",
    'deg3.title': "Professional bachelor's, Web &amp; Big Data",
    'deg3.school': "IUT d'Aix-Marseille · with merit",
    'deg4.title': 'DUT in Computer Science',
    'deg4.school': 'IUT de Valence, Université Grenoble Alpes',
    'certif': '<strong>SkyReal certification.</strong> VR development on Unreal Engine: immersive scenarios for aircraft maintenance, in real-time 3D.',

    'stack.list': 'AWS / Docker / CI/CD / Linux / Bash / <em class="accent">Symfony 6</em> / Django / PHP / Python / REST APIs / SQL / MySQL / PostgreSQL / Twig / JavaScript / <em class="accent">Machine learning</em> / Unreal Engine',
    'stack.languages': 'French (native) · English (professional) · Mauritian Creole (fluent)',

    'labo.eyebrow': 'Interactive experience',
    'labo.title': 'AI Lab',
    'labo.intro': 'Draw a digit from 0 to 9. A small neural network I trained on MNIST recognises it live, entirely in your browser.',
    'labo.pad': 'Drawing area: draw a digit with your mouse or finger',
    'labo.model': 'MLP 196 → 64 → 10<br>~94% validation accuracy',
    'labo.clear': 'Clear',
    'labo.prediction': 'Prediction',

    'contact.title': 'Get in touch.',
  },

  lab: {
    loading: 'Loading model…',
    error: 'Model unavailable',
    empty: 'Draw inside the frame',
    cleared: 'Drawing area cleared',
    pct: (p: number) => `${p}%`,
    confidence: (p: number) => `Confidence: ${p}%`,
    announce: (d: number, p: number) => `Prediction: ${d}, confidence ${p}%`,
  },
};
