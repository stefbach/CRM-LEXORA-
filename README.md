# Lexora CRM

A modern, fast, ultra-clean CRM — inspired by [Twenty](https://github.com/twentyhq/twenty), rebuilt from scratch as a lightweight **Next.js** app that deploys to Vercel in one click.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Stack](https://img.shields.io/badge/TypeScript-5-blue) ![Stack](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## ✨ Features

- **Dashboard** — KPIs (open pipeline, weighted forecast, won, win rate), revenue trend & pipeline charts, top deals and an "up next" feed.
- **Opportunities** — a drag-and-drop Kanban board; move deals across stages and watch probabilities update live.
- **People** — searchable contacts table with company, role and quick email/call actions.
- **Companies** — account cards with ARR, headcount, contacts and open-deal counts.
- **Activities** — a single timeline of calls, emails, meetings, notes and tasks.

## 🧱 Tech stack

| Layer    | Choice                          |
| -------- | ------------------------------- |
| Framework| Next.js 14 (App Router)         |
| Language | TypeScript                      |
| Styling  | Tailwind CSS + custom glass UI  |
| Charts   | Recharts                        |
| Motion   | Framer Motion                   |
| Icons    | Lucide                          |

The data layer lives in [`lib/data.ts`](./lib/data.ts) as typed mock data, so the
app runs with zero configuration. Swapping it for a real backend (Supabase,
Postgres, the Twenty API…) means replacing those exported functions — the UI
stays untouched.

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

- [ ] Wire a real backend (Supabase) behind `lib/data.ts`
- [ ] Auth + multi-workspace
- [ ] Record detail pages & inline editing
- [ ] Command palette (⌘K) search
- [ ] AI summaries & follow-up drafting

---

Built with care for **Lexora**.
