"""Thinking History service — tracks every problem-solving attempt."""
from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import ThinkingHistory, HintLog


def start_thinking_session(db: Session, user_id: UUID, data: dict) -> ThinkingHistory:
    th = ThinkingHistory(
        user_id=user_id,
        problem_title=data["problem_title"],
        language_slug=data.get("language_slug"),
        started_at=datetime.now(timezone.utc),
        difficulty=data.get("difficulty", "Medium"),
    )
    db.add(th)
    db.commit()
    db.refresh(th)
    return th


def finish_thinking_session(db: Session, user_id: UUID, th_id: UUID, data: dict) -> ThinkingHistory | None:
    th = db.query(ThinkingHistory).filter(ThinkingHistory.id == th_id, ThinkingHistory.user_id == user_id).first()
    if not th:
        return None
    now = datetime.now(timezone.utc)
    th.finished_at = now
    th.thinking_seconds = int((now - th.started_at).total_seconds()) if th.started_at else data.get("thinking_seconds", 0)
    th.hints_opened = data.get("hints_opened", 0)
    th.attempts = data.get("attempts", 1)
    th.solution_completed = data.get("solution_completed", False)
    th.revision_required = data.get("revision_required", False)

    # Compute improvement score: compare to previous attempts on same problem
    previous = db.query(ThinkingHistory).filter(
        ThinkingHistory.user_id == user_id,
        ThinkingHistory.problem_title == th.problem_title,
        ThinkingHistory.id != th.id,
        ThinkingHistory.finished_at.isnot(None),
    ).order_by(ThinkingHistory.finished_at.desc()).first()

    if previous:
        prev_time = previous.thinking_seconds
        curr_time = th.thinking_seconds
        if prev_time > 0:
            th.improvement_score = max(-100, min(100, int((prev_time - curr_time) / prev_time * 100)))
    else:
        th.improvement_score = 0

    # Schedule revision if needed
    if th.revision_required:
        th.next_review_date = date.today() + timedelta(days=1)
    elif th.solution_completed:
        th.next_review_date = date.today() + timedelta(days=3)

    db.commit()
    db.refresh(th)
    return th


def list_thinking_history(db: Session, user_id: UUID, limit: int = 50) -> list[ThinkingHistory]:
    return (
        db.query(ThinkingHistory)
        .filter(ThinkingHistory.user_id == user_id)
        .order_by(ThinkingHistory.started_at.desc())
        .limit(limit)
        .all()
    )


def get_thinking_stats(db: Session, user_id: UUID) -> dict:
    rows = db.query(ThinkingHistory).filter(ThinkingHistory.user_id == user_id).all()
    total = len(rows)
    completed = sum(1 for r in rows if r.solution_completed)
    avg_time = sum(r.thinking_seconds for r in rows) // max(total, 1)
    avg_hints = sum(r.hints_opened for r in rows) // max(total, 1)
    avg_improvement = sum(r.improvement_score for r in rows) // max(total, 1)
    return {
        "total_attempts": total,
        "completed": completed,
        "avg_thinking_seconds": avg_time,
        "avg_hints_opened": avg_hints,
        "avg_improvement_score": avg_improvement,
    }
