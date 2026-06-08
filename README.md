# Lexora CRM

A modern, fast, ultra-clean CRM — inspired by [Twenty](https://github.com/twentyhq/twenty), rebuilt from scratch as a lightweight **Next.js** app that deploys to Vercel in one click.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Stack](https://img.shields.io/badge/TypeScript-5-blue) ![Stack](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## ✨ Fonctionnalités

100 % branché sur la base **Supabase** Lexora (`crm_contacts`, `crm_companies`,
`crm_activities`) — aucune donnée de démo embarquée.

- **Tableau de bord** — base en direct : prospects, contactés, rappels dus,
  activité (appels/emails) sur 14 jours, pipeline par statut et répartition par flux.
- **Prospects** — base consolidée Maurice, recherche + filtres, emails et scripts
  d'appel personnalisés en un clic.
- **Appels** — planification **par flux** (PME / Cabinet / DAF / Finance), capture
  de l'issue (Joint · intéressé / à rappeler / pas intéressé · Pas joint…),
  écriture dans `crm_activities`, mise à jour du statut et **rappels planifiés**.
- **Emails** — envoi **en lot semi-automatique** via **Resend**, personnalisé par
  contact, journalisé, et respectant les opt-out.
- **Pipeline** — board glisser-déposer par statut ; déplacer un contact met à jour
  Supabase en direct.
- **Contacts / Sociétés / Activités** — vues live de la base.

## ⚙️ Configuration

Copiez [`.env.example`](./.env.example) et renseignez :

| Variable | Rôle |
| --- | --- |
| `SUPABASE_URL` | URL du projet Lexora |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service-role (serveur uniquement, hors navigateur) |
| `RESEND_API_KEY` | Clé Resend pour l'envoi d'emails |
| `RESEND_FROM` | Expéditeur (domaine vérifié dans Resend) |

Sans `SUPABASE_SERVICE_ROLE_KEY`, l'app démarre mais affiche des listes vides
(badge « Supabase non connecté »). Sans clés Resend, la composition des emails
fonctionne mais l'envoi est désactivé (badge « Resend à configurer »).

## 🧱 Tech stack

| Layer    | Choice                          |
| -------- | ------------------------------- |
| Framework| Next.js 14 (App Router)         |
| Language | TypeScript                      |
| Styling  | Tailwind CSS + custom glass UI  |
| Charts   | Recharts                        |
| Motion   | Framer Motion                   |
| Icons    | Lucide                          |

La couche données vit dans [`lib/crm.ts`](./lib/crm.ts) (lecture Supabase,
server-only) et [`app/actions.ts`](./app/actions.ts) (écriture : issues d'appel,
changement de statut, envoi d'emails). Toute l'UI est écrite contre ces fonctions.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## ☁️ Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com) — no env vars
required for the demo. The build command is `next build` and the framework is
auto-detected.

## 🗺️ Roadmap

- [x] Brancher Supabase (lecture + écriture)
- [x] Planification d'appels par flux + rappels
- [x] Envoi d'emails en lot (Resend) avec opt-out
- [ ] Séquences d'emails multi-étapes automatiques (relances programmées)
- [ ] Auth + multi-workspace
- [ ] Tracking d'ouverture/clic (webhooks Resend)
- [ ] Synthèses & rédaction assistées par IA

---

Built with care for **Lexora**.
