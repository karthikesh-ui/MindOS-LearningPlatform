from .auth_router import router as auth_router
from .profile_router import router as profile_router
from .dashboard_router import router as dashboard_router
from .learning_router import router as learning_router
from .bookmarks_router import router as bookmarks_router
from .settings_router import router as settings_router
from .meta_router import router as meta_router
from .notes_router import router as notes_router
from .problems_router import router as problems_router
from .planner_router import router as planner_router
from .topics_router import router as topics_router
from .search_router import router as search_router
from .progress_router import router as progress_router
from .engine_router import router as engine_router
from .thinking_router import router as thinking_router
from .flashcards_router import router as flashcards_router
from .quiz_router import router as quiz_router
from .revisions_router import router as revisions_router
from .intelligence_router import router as intelligence_router

__all__ = [
    "auth_router",
    "profile_router",
    "dashboard_router",
    "learning_router",
    "bookmarks_router",
    "settings_router",
    "meta_router",
    "notes_router",
    "problems_router",
    "planner_router",
    "topics_router",
    "search_router",
    "progress_router",
    "engine_router",
    "thinking_router",
    "flashcards_router",
    "quiz_router",
    "revisions_router",
    "intelligence_router",
]
