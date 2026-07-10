# MindOS — Learning Operating System

> A calm, focused learning OS for students preparing for careers in
> **Software Engineering, AI, ML, and GenAI**.
>
> Designed to feel like **Notion + Linear + Apple + GitHub** — minimal, clean,
> premium, and productivity-focused.

MindOS is a monorepo with a separated frontend and backend.

```
minds/
├── frontend/   # React + TypeScript + Vite + Tailwind CSS
├── backend/    # FastAPI + SQLAlchemy + PostgreSQL
└── README.md   # you are here
```

This is **Part 1 of a 4-part build** — the complete, production-quality
foundation. Future parts will add the AI tutor, quiz engine, planner, and
revision system onto the extension points reserved here.

---

## What's in this release

### Pages (all fully built)

- **Landing** — hero, social proof, features, benefits, learning journey, CTA, footer
- **Login** — Google OAuth + Guest mode (with extension point for Google Identity Services)
- **Dashboard** — welcome card, today's plan, tomorrow preview, continue learning,
  progress overview, recent activity, weekly goal, bookmarks, quick actions,
  learning streak, XP counter, AI assistant placeholder
- **Learning Hub** — 9 language tracks (Python, SQL, Java, C++, JavaScript,
  TypeScript, Prompt Engineering, Bash, System Design) with progress, difficulty,
  estimated time, and continue/start actions + difficulty filtering
- **Profile** — avatar, Google account info, learning statistics, achievements
- **Settings** — theme, notifications, account, security (tabbed)
- **404** — branded not-found page

### Backend

- JWT authentication (Google OAuth + guest), Google ID-token verification
- Protected routes via `get_current_user` dependency
- PostgreSQL models: users, profiles, languages, progress, bookmarks, planner,
  achievements, XP ledger, streaks, settings — **plus reserved `ai_sessions` /
  `ai_events` extension tables** for future AI modules
- Routers: auth, profile, dashboard, learning, bookmarks, settings, meta
- Auto table creation + idempotent seed of reference languages & achievements
- CORS configured for the frontend dev server

### Frontend architecture

```
frontend/src/
├── components/
│   ├── ui/              # Button, Card, Badge, ProgressBar, Avatar, NavLink, Feedback
│   ├── dashboard/       # Dashboard section cards (welcome, plan, streak, XP, …)
│   ├── marketing/       # Header + footer for the landing page
│   ├── Logo.tsx
│   └── ProtectedRoute.tsx
├── layouts/             # AppLayout (sidebar+topbar), MarketingLayout
├── hooks/               # useAuth, useAsync, useMediaQuery
├── services/            # api client (with mock fallback) + seed data
├── pages/               # Landing, Login, Dashboard, LearningHub, Profile, Settings, 404
├── types/               # shared TypeScript types
├── utils/               # helpers (cx, formatters, etc.)
└── App.tsx              # router with lazy-loaded routes
```

---

## Quick start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+ (running locally or remotely)

### 1) Database

Create a PostgreSQL database:

```sh
createdb minds
```

### 2) Backend

```sh
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql+psycopg2://<user>:<pass>@localhost:5432/minds
#   JWT_SECRET=<generate: python -c "import secrets; print(secrets.token_urlsafe(48))">
#   GOOGLE_CLIENT_ID=<from Google Cloud Console>

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now at `http://localhost:8000` with interactive docs at
`http://localhost:8000/docs`. Tables are created and reference data seeded on
startup.

### 3) Frontend

```sh
cd frontend
npm install

cp .env.example .env
# Edit .env if needed (defaults target the backend above)

npm run dev
```

Open `http://localhost:5173`.

> The frontend ships with a **mock-data mode** (`VITE_USE_MOCK` defaults on) so
> you can explore the full UI without a running backend. Set
> `VITE_USE_MOCK=false` in `frontend/.env` to hit the real FastAPI API — Vite
> proxies `/api/*` to the backend automatically.

---

## Environment variables

### `backend/.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLAlchemy PostgreSQL URL |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_ALGORITHM` | `HS256` by default |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Google-user token lifetime (default 7 days) |
| `GUEST_TOKEN_EXPIRE_MINUTES` | Guest token lifetime (default 24h) |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (used by the dev proxy) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (for the GIS button) |
| `VITE_USE_MOCK` | `true` (default) uses built-in mock data; `false` calls the API |

---

## Scripts

### Frontend
- `npm run dev` — start Vite dev server (port 5173)
- `npm run build` — type-check + production build
- `npm run typecheck` — TypeScript only
- `npm run preview` — preview the production build

### Backend
- `uvicorn app.main:app --reload` — start the API (port 8000)
- Docs: `/docs` (Swagger) and `/redoc`

---

## Design system

- **Light theme** — white surfaces, soft gray cards, rounded `2xl` corners
- **Typography** — Inter (body) + Lexend (display) from Google Fonts
- **Color ramps** — `ink` (neutral), `brand` (blue), `accent` (green),
  `success`, `warning`, `error`, each with full shade scales
- **8px spacing system**, soft shadows, subtle hover lifts, fade/scale
  entrance animations
- **Responsive** — desktop sidebar collapses to a mobile drawer; grids reflow
  at `sm` / `lg` breakpoints

---

## Extension points (reserved, not built)

These are scaffolded for future parts and intentionally not implemented yet:

- AI Tutor · Quiz Engine · Mock Interview · Revision Engine · Code Editor
- Notes · Flashcards · Planner (full) · Analytics · Admin Dashboard

Reserved database tables: `ai_sessions`, `ai_events`.
Reserved UI slots: AI Assistant card on the dashboard, "More tracks coming" tile
in the Learning Hub, Theme dark option in Settings.

---

## Project status

**Part 1 of 4 — Foundation complete.**

Production-quality frontend (7 pages, full component library, lazy-loaded
routes, loading/empty/error states) and a clean FastAPI backend (auth, CRUD,
dashboard composition, seeded reference data) are in place and ready for the
next layer of features.
