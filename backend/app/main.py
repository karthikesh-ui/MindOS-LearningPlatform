from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.core.config import settings
from app.database.session import Base, engine
from app.routers import (
    auth_router,
    bookmarks_router,
    dashboard_router,
    learning_router,
    meta_router,
    profile_router,
    settings_router,
    notes_router,
    problems_router,
    planner_router,
    topics_router,
    search_router,
    progress_router,
    engine_router,
    thinking_router,
    flashcards_router,
    quiz_router,
    revisions_router,
    intelligence_router,
)
from app.services import run_seed
from app.schemas import HealthOut


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (idempotent). For production use Alembic migrations.
    Base.metadata.create_all(bind=engine)
    run_seed()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=__version__,
    description="MindOS — Learning Operating System backend API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthOut, tags=["system"])
def health() -> HealthOut:
    return HealthOut(status="ok", version=__version__, database="connected")


@app.get("/", tags=["system"])
def root():
    return {"name": settings.APP_NAME, "version": __version__, "docs": "/docs"}


# Routers are mounted under /api/*
prefix = "/api"
app.include_router(auth_router, prefix=prefix)
app.include_router(profile_router, prefix=prefix)
app.include_router(dashboard_router, prefix=prefix)
app.include_router(learning_router, prefix=prefix)
app.include_router(bookmarks_router, prefix=prefix)
app.include_router(settings_router, prefix=prefix)
app.include_router(meta_router, prefix=prefix)
app.include_router(notes_router, prefix=prefix)
app.include_router(problems_router, prefix=prefix)
app.include_router(planner_router, prefix=prefix)
app.include_router(topics_router, prefix=prefix)
app.include_router(search_router, prefix=prefix)
app.include_router(progress_router, prefix=prefix)
app.include_router(engine_router, prefix=prefix)
app.include_router(thinking_router, prefix=prefix)
app.include_router(flashcards_router, prefix=prefix)
app.include_router(quiz_router, prefix=prefix)
app.include_router(revisions_router, prefix=prefix)
app.include_router(intelligence_router, prefix=prefix)
