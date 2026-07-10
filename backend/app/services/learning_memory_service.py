"""Learning Memory service — stores and retrieves the user's complete learning history.

This is the persistent memory layer: sessions, completed topics, time spent,
problems solved, hints opened, bookmarks, revisions, achievements, and
daily/weekly/monthly study history.
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import (
    Bookmark,
    HintLog,
    LearningSessionRecord,
    Problem,
    QuizAttempt,
    Revision,
    ThinkingHistory,
    UserAchievement,
    XpEvent,
)


def get_learning_memory(db: Session, user_id: UUID) -> dict:
    """Retrieve the complete learning memory for a user."""
    sessions = db.query(LearningSessionRecord).filter(LearningSessionRecord.user_id == user_id).all()
    thinking = db.query(ThinkingHistory).filter(ThinkingHistory.user_id == user_id).all()
    problems = db.query(Problem).filter(Problem.user_id == user_id).all()
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user_id).all()
    revisions = db.query(Revision).filter(Revision.user_id == user_id).all()
    xp_events = db.query(XpEvent).filter(XpEvent.user_id == user_id).all()
    achievements = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    hint_logs = db.query(HintLog).filter(HintLog.user_id == user_id).all()

    return {
        "sessions": len(sessions),
        "total_minutes": sum(s.duration_minutes for s in sessions),
        "completed_topics": sum(1 for t in thinking if t.solution_completed),
        "problems_solved": sum(1 for p in problems if p.status == "solved"),
        "hints_opened": sum(t.hints_opened for t in thinking) + len(hint_logs),
        "bookmarks": len(bookmarks),
        "revisions": len(revisions),
        "completed_revisions": sum(1 for r in revisions if r.completed),
        "achievements": len(achievements),
        "xp_events": len(xp_events),
        "quiz_attempts": len(quiz_attempts),
        "daily_history": _daily_history(sessions),
        "weekly_history": _weekly_history(sessions),
        "monthly_history": _monthly_history(sessions),
    }


def _daily_history(sessions) -> list[dict]:
    """Last 7 days of study activity."""
    now = datetime.now(timezone.utc)
    days = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        minutes = sum(s.duration_minutes for s in sessions if s.started_at and s.started_at.date() == day)
        days.append({"date": day.isoformat(), "minutes": minutes})
    return days


def _weekly_history(sessions) -> list[dict]:
    """Last 4 weeks of study activity."""
    now = datetime.now(timezone.utc)
    weeks = []
    for i in range(3, -1, -1):
        week_start = now - timedelta(weeks=i)
        week_end = week_start - timedelta(days=7)
        minutes = sum(
            s.duration_minutes for s in sessions
            if s.started_at and week_end <= s.started_at <= week_start
        )
        weeks.append({"week": f"W{4 - i}", "minutes": minutes})
    return weeks


def _monthly_history(sessions) -> list[dict]:
    """Last 6 months of study activity."""
    now = datetime.now(timezone.utc)
    months = []
    for i in range(5, -1, -1):
        month_start = now - timedelta(days=i * 30)
        month_end = month_start - timedelta(days=30)
        minutes = sum(
            s.duration_minutes for s in sessions
            if s.started_at and month_end <= s.started_at <= month_start
        )
        months.append({"month": month_start.strftime("%b"), "minutes": minutes})
    return months
