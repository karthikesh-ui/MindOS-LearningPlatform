"""The MindOS Learning Engine — the central brain that cascades updates.

When any learning activity happens (topic completed, problem solved, quiz taken,
hint revealed, session ended), the engine fires and automatically updates every
connected module:

    event → XP + streak + progress + revision schedule + achievements
          → weak area detection + recommendations + notifications
          → dashboard flagged dirty

This is the single entry point. Domain services handle their own CRUD;
the engine orchestrates them.
"""
from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import (
    AchievementLog,
    Bookmark,
    HintLog,
    LearningSessionRecord,
    Notification,
    Problem,
    Progress,
    Recommendation,
    Revision,
    Streak,
    ThinkingHistory,
    UserAchievement,
    WeakArea,
    XpEvent,
)
from app.services.gamification_service import award_xp, check_achievements
from app.services.revision_service import schedule_revision
from app.services.notification_service import create_notification
from app.services.weak_area_service import detect_weak_areas
from app.services.recommendation_service import generate_recommendations

SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30]
XP_REWARDS = {
    "topic_completed": 50,
    "problem_solved": 75,
    "problem_attempted": 15,
    "quiz_taken": 40,
    "hint_revealed": 5,
    "session_ended": 20,
    "revision_done": 30,
    "note_created": 10,
    "bookmark_added": 5,
}


def process_event(db: Session, user_id: UUID, event: dict) -> dict:
    """Process a learning event and cascade updates across all modules.

    Returns an EngineResult dict describing what was updated.
    """
    event_type = event.get("event_type", "")
    language_slug = event.get("language_slug")
    topic_ref = event.get("topic_ref")
    topic_title = event.get("topic_title")
    problem_title = event.get("problem_title")
    duration_minutes = event.get("duration_minutes", 0)
    score = event.get("score")
    hints_used = event.get("hints_used", 0)

    result = {
        "xp_gained": 0,
        "achievements_unlocked": [],
        "notifications_created": [],
        "revisions_scheduled": [],
        "weak_areas_detected": [],
        "recommendations_generated": [],
        "streak_updated": False,
        "dashboard_dirty": True,
    }

    # 1. Award XP
    xp_amount = XP_REWARDS.get(event_type, 10)
    if event_type == "quiz_taken" and score is not None:
        xp_amount = max(10, score * 5)
    xp_event = award_xp(db, user_id, xp_amount, event_type.replace("_", " "))
    result["xp_gained"] = xp_amount

    # 2. Update streak
    streak = _update_streak(db, user_id)
    if streak:
        result["streak_updated"] = True

    # 3. Record learning session
    if duration_minutes > 0 or event_type in ("topic_completed", "problem_solved", "session_ended"):
        session_rec = LearningSessionRecord(
            user_id=user_id,
            language_slug=language_slug,
            started_at=datetime.now(timezone.utc) - timedelta(minutes=duration_minutes),
            ended_at=datetime.now(timezone.utc),
            duration_minutes=duration_minutes,
            xp_gained=xp_amount,
        )
        db.add(session_rec)

    # 4. Schedule revision for completed topics
    if event_type == "topic_completed" and topic_ref:
        rev = schedule_revision(db, user_id, topic_ref, language_slug or "", topic_title or topic_ref)
        result["revisions_scheduled"].append({
            "topic_ref": topic_ref,
            "scheduled_date": rev.scheduled_date.isoformat() if hasattr(rev, "scheduled_date") else None,
        })

    # 5. Check achievements
    unlocked = check_achievements(db, user_id)
    for ach in unlocked:
        result["achievements_unlocked"].append(ach)
        create_notification(
            db, user_id, "achievement",
            f"Achievement unlocked: {ach.get('title', '')}",
            ach.get("description", ""),
        )

    # 6. Detect weak areas (on problem attempts, quiz, hint usage)
    if event_type in ("problem_attempted", "quiz_taken", "hint_revealed"):
        weak = detect_weak_areas(db, user_id, language_slug, hints_used, score)
        for w in weak:
            result["weak_areas_detected"].append(w)

    # 7. Generate recommendations
    if event_type in ("topic_completed", "problem_solved", "quiz_taken", "revision_done"):
        recs = generate_recommendations(db, user_id, event_type, language_slug)
        for r in recs:
            result["recommendations_generated"].append(r)

    # 8. Create contextual notifications
    if event_type == "topic_completed":
        create_notification(
            db, user_id, "goal",
            f"Topic completed: {topic_title or topic_ref}",
            "Great progress! Your revision has been scheduled.",
        )
    if event_type == "problem_solved":
        create_notification(
            db, user_id, "goal",
            f"Problem solved: {problem_title}",
            f"+{xp_amount} XP earned. Keep the momentum going!",
        )

    db.commit()
    return result


def _update_streak(db: Session, user_id: UUID) -> Streak | None:
    """Update the user's study streak based on today's activity."""
    streak = db.get(Streak, user_id)
    if not streak:
        streak = Streak(user_id=user_id, current=0, longest=0, week_mask="0000000")
        db.add(streak)
    today = datetime.now(timezone.utc).date()
    if streak.last_study_date:
        last = streak.last_study_date.date() if hasattr(streak.last_study_date, "date") else streak.last_study_date
        if last == today:
            return streak
        gap = (today - last).days
        if gap == 1:
            streak.current += 1
        else:
            streak.current = 1
    else:
        streak.current = 1
    streak.last_study_date = datetime.now(timezone.utc)
    if streak.current > streak.longest:
        streak.longest = streak.current
    # Update week mask
    weekday = today.weekday()
    mask = list(streak.week_mask or "0000000")
    if len(mask) == 7:
        mask[weekday] = "1"
        streak.week_mask = "".join(mask)
    return streak
