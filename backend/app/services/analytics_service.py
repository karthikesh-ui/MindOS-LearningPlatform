"""Analytics Engine — tracks learning metrics across all modules."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import (
    Flashcard,
    HintLog,
    LearningSessionRecord,
    Progress,
    QuizAttempt,
    Revision,
    ThinkingHistory,
)


def get_analytics(db: Session, user_id: UUID) -> dict:
    """Compute comprehensive analytics across all learning modules."""
    sessions = db.query(LearningSessionRecord).filter(LearningSessionRecord.user_id == user_id).all()
    learning_hours = sum(s.duration_minutes for s in sessions) // 60

    thinking_rows = db.query(ThinkingHistory).filter(ThinkingHistory.user_id == user_id).all()
    thinking_time = sum(r.thinking_seconds for r in thinking_rows)
    hint_usage = sum(r.hints_opened for r in thinking_rows)
    problems_solved = sum(1 for r in thinking_rows if r.solution_completed)

    progress_rows = db.query(Progress).filter(Progress.user_id == user_id).all()
    topic_completion = sum(p.completed_modules for p in progress_rows)

    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    quiz_avg = sum(a.score for a in quiz_attempts) // max(len(quiz_attempts), 1) if quiz_attempts else 0

    revisions = db.query(Revision).filter(Revision.user_id == user_id).all()
    completed_revisions = [r for r in revisions if r.completed and r.accuracy is not None]
    revision_accuracy = sum(r.accuracy for r in completed_revisions) // max(len(completed_revisions), 1) if completed_revisions else 0

    flashcards = db.query(Flashcard).filter(Flashcard.user_id == user_id).all()
    mastered = sum(1 for f in flashcards if f.status == "mastered")

    # Improvement rate: average of improvement scores in thinking history
    improvements = [r.improvement_score for r in thinking_rows if r.improvement_score != 0]
    improvement_rate = sum(improvements) // max(len(improvements), 1) if improvements else 0

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    weekly = _weekly_progress(sessions, now)
    monthly = _monthly_progress(sessions, now)
    per_language = _per_language(progress_rows, sessions)

    return {
        "learning_hours": learning_hours,
        "topic_completion": topic_completion,
        "language_progress": per_language,
        "weekly_progress": weekly,
        "monthly_progress": monthly,
        "thinking_time_seconds": thinking_time,
        "hint_usage": hint_usage,
        "revision_accuracy": revision_accuracy,
        "improvement_rate": improvement_rate,
        "quiz_avg_score": quiz_avg,
        "problems_solved": problems_solved,
        "flashcards_mastered": mastered,
    }


def _weekly_progress(sessions, now) -> list[dict]:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today = now.date()
    start = today - timedelta(days=today.weekday())
    buckets = {start + timedelta(days=i): 0 for i in range(7)}
    for s in sessions:
        if s.started_at and s.started_at.date() in buckets:
            buckets[s.started_at.date()] += s.duration_minutes
    return [{"day": days[i], "minutes": buckets[start + timedelta(days=i)]} for i in range(7)]


def _monthly_progress(sessions, now) -> list[dict]:
    weeks = []
    for w in range(4):
        week_start = now - timedelta(weeks=3 - w)
        minutes = sum(
            s.duration_minutes for s in sessions
            if s.started_at and (now - s.started_at).days <= (3 - w) * 7 + 7 and (now - s.started_at).days > (3 - w) * 7
        )
        weeks.append({"week": f"W{w + 1}", "minutes": minutes})
    return weeks


def _per_language(progress_rows, sessions) -> list[dict]:
    return [
        {"language_slug": str(p.language_id), "language_name": "", "percent": p.percent, "hours": 0}
        for p in progress_rows
    ]
