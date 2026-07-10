from .auth_service import login_with_google, login_as_guest
from .profile_service import get_profile, update_profile
from .learning_service import (
    list_languages,
    get_language_by_slug,
    list_progress,
    upsert_progress,
    list_bookmarks,
    add_bookmark,
    remove_bookmark,
    list_planner,
    add_xp,
    get_xp_summary,
    get_streak,
    list_achievements,
    list_user_achievements,
)
from .dashboard_service import build_dashboard
from .seed_service import seed_reference_data, run_seed
from .notes_service import (
    list_notes,
    search_notes,
    get_note,
    create_note,
    update_note,
    delete_note,
    toggle_pin,
    toggle_favorite,
)
from .problems_service import (
    list_problems,
    get_problem,
    create_problem,
    update_problem,
    delete_problem,
    tags_as_list,
)
from .planner_service import (
    list_planner as list_planner_items,
    create_planner_item,
    update_planner_item,
    delete_planner_item,
    planner_overview,
)
from .topics_service import (
    get_roadmap,
    list_topics,
    get_topic,
    topic_progress_for_user,
    mark_topic_complete,
    toggle_topic_bookmark,
    is_topic_bookmarked,
    serialize_topic,
)
from .search_service import global_search
from .progress_service import progress_overview

# Engine services
from .engine_service import process_event
from .gamification_service import award_xp, get_xp_summary as engine_xp_summary, check_achievements, get_gamification_overview
from .revision_service import schedule_revision, complete_revision, get_revision_schedule, list_revisions
from .notification_service import (
    create_notification,
    list_notifications,
    mark_read,
    mark_all_read,
    delete_notification,
)
from .weak_area_service import detect_weak_areas, list_weak_areas, dismiss_weak_area
from .recommendation_service import (
    generate_recommendations,
    list_recommendations,
    accept_recommendation,
    dismiss_recommendation,
)
from .thinking_history_service import (
    start_thinking_session,
    finish_thinking_session,
    list_thinking_history,
    get_thinking_stats,
)
from .hint_engine_service import get_hint_progress, reveal_hint, HINT_STAGES
from .flashcard_service import (
    list_flashcards,
    create_flashcard,
    auto_generate_from_topic,
    review_flashcard,
    delete_flashcard,
    get_flashcard_stats,
)
from .quiz_service import list_quizzes, get_or_create_quiz, submit_quiz, list_attempts
from .mock_interview_service import start_interview, submit_answer, list_interviews, get_interview
from .analytics_service import get_analytics
from .learning_memory_service import get_learning_memory

__all__ = [
    "login_with_google",
    "login_as_guest",
    "get_profile",
    "update_profile",
    "list_languages",
    "get_language_by_slug",
    "list_progress",
    "upsert_progress",
    "list_bookmarks",
    "add_bookmark",
    "remove_bookmark",
    "list_planner",
    "add_xp",
    "get_xp_summary",
    "get_streak",
    "list_achievements",
    "list_user_achievements",
    "build_dashboard",
    "seed_reference_data",
    "run_seed",
    "list_notes",
    "search_notes",
    "get_note",
    "create_note",
    "update_note",
    "delete_note",
    "toggle_pin",
    "toggle_favorite",
    "list_problems",
    "get_problem",
    "create_problem",
    "update_problem",
    "delete_problem",
    "tags_as_list",
    "list_planner_items",
    "create_planner_item",
    "update_planner_item",
    "delete_planner_item",
    "planner_overview",
    "get_roadmap",
    "list_topics",
    "get_topic",
    "topic_progress_for_user",
    "mark_topic_complete",
    "toggle_topic_bookmark",
    "is_topic_bookmarked",
    "serialize_topic",
    "global_search",
    "progress_overview",
    # Engine
    "process_event",
    "award_xp",
    "engine_xp_summary",
    "check_achievements",
    "get_gamification_overview",
    "schedule_revision",
    "complete_revision",
    "get_revision_schedule",
    "list_revisions",
    "create_notification",
    "list_notifications",
    "mark_read",
    "mark_all_read",
    "delete_notification",
    "detect_weak_areas",
    "list_weak_areas",
    "dismiss_weak_area",
    "generate_recommendations",
    "list_recommendations",
    "accept_recommendation",
    "dismiss_recommendation",
    "start_thinking_session",
    "finish_thinking_session",
    "list_thinking_history",
    "get_thinking_stats",
    "get_hint_progress",
    "reveal_hint",
    "HINT_STAGES",
    "list_flashcards",
    "create_flashcard",
    "auto_generate_from_topic",
    "review_flashcard",
    "delete_flashcard",
    "get_flashcard_stats",
    "list_quizzes",
    "get_or_create_quiz",
    "submit_quiz",
    "list_attempts",
    "start_interview",
    "submit_answer",
    "list_interviews",
    "get_interview",
    "get_analytics",
    "get_learning_memory",
]
