# MindOS Backend — FastAPI + SQLAlchemy + PostgreSQL

The backend for **MindOS**, a learning operating system for students preparing
for careers in Software Engineering, AI, ML, and GenAI.

## Stack

- **FastAPI** — async REST API with automatic OpenAPI docs
- **SQLAlchemy 2.0** — ORM with a declarative `Base`
- **PostgreSQL** — primary database (via `psycopg2`)
- **Pydantic v2** — request/response validation
- **JWT (python-jose)** — stateless authentication
- **Google OAuth** — verified server-side with `google-auth`

## Layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry, router wiring, CORS, lifespan
│   ├── core/config.py       # Pydantic settings (reads .env)
│   ├── database/session.py  # engine, SessionLocal, Base, get_db dependency
│   ├── models/models.py     # SQLAlchemy models (users, profiles, languages, …)
│   ├── schemas/schemas.py   # Pydantic request/response models
│   ├── auth/                # JWT creation/decode + Google ID-token verification
│   ├── middleware/auth.py   # get_current_user / get_optional_user dependencies
│   ├── services/            # business logic (auth, profile, dashboard, learning, seed)
│   ├── routers/             # FastAPI routers (auth, profile, dashboard, …)
│   └── utils/
├── requirements.txt
├── .env.example
└── README.md
```

## API surface

| Method | Path                       | Auth | Description                       |
|--------|----------------------------|------|-----------------------------------|
| POST   | `/api/auth/google`         | —    | Login / signup with Google ID token |
| POST   | `/api/auth/guest`          | —    | Create a guest session            |
| GET    | `/api/profile`             | JWT  | Current user profile              |
| PATCH  | `/api/profile`             | JWT  | Update profile fields             |
| GET    | `/api/dashboard`           | JWT  | Composed dashboard payload        |
| GET    | `/api/learning/hub`        | JWT  | Languages with per-user progress  |
| GET    | `/api/learning/progress`   | JWT  | User progress rows                |
| GET    | `/api/bookmarks`           | JWT  | List bookmarks                    |
| POST   | `/api/bookmarks`           | JWT  | Create a bookmark                 |
| DELETE | `/api/bookmarks/{id}`      | JWT  | Delete a bookmark                 |
| GET    | `/api/settings`            | JWT  | Notification/theme settings       |
| PATCH  | `/api/settings`            | JWT  | Update settings                   |
| GET    | `/api/meta/achievements`   | JWT  | Available achievements            |
| GET    | `/api/meta/xp`             | JWT  | XP summary                        |
| GET    | `/api/meta/streak`         | JWT  | Streak summary                    |
| GET    | `/api/health`              | —    | Health check                      |

Interactive docs are served at `http://localhost:8000/docs` once running.

## Setup

1. **Create a PostgreSQL database**
   ```sh
   createdb minds
   ```
   (or use any PostgreSQL instance — set `DATABASE_URL` accordingly)

2. **Create a virtual environment and install deps**
   ```sh
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```sh
   cp .env.example .env
   # edit .env: set DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID
   ```

4. **Run the server**
   ```sh
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   On startup the app auto-creates tables and seeds reference languages &
   achievements (idempotent). For production, use Alembic migrations instead.

## Notes

- Guest sessions use a shorter token lifetime (see `GUEST_TOKEN_EXPIRE_MINUTES`).
- `AiSession` / `AiEvent` tables are reserved as **extension points** for the
  future AI tutor, quiz engine, and revision modules — not implemented yet.
- All protected routes require `Authorization: Bearer <jwt>`.
