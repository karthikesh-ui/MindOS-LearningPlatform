"""Weak Area Detection — detects topics where the learner struggles."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import ThinkingHistory, WeakArea, QuizAttempt, HintLog


def detect_weak_areas(
    db: Session,
    user_id: UUID,
    language_slug: str | None = None,
    hints_used: int = 0,
    score: int | None = None,
) -> list[dict]:
    """Detect weak areas based on learning behavior signals."""
    detected: list[dict] = []

    # Signal 1: High hint usage
    if hints_used >= 4:
        existing = db.query(WeakArea).filter(
            WeakArea.user_id == user_id,
            WeakArea.language_slug == language_slug or "",
            WeakArea.weakness_type == "high_hints",
        ).first()
        if not existing:
            wa = WeakArea(
                user_id=user_id,
                language_slug=language_slug or "general",
                title=f"High hint usage in {language_slug or 'recent problems'}",
                weakness_type="high_hints",
                severity="medium" if hints_used < 6 else "high",
                score=min(1.0, hints_used / 10),
            )
            db.add(wa)
            detected.append({"title": wa.title, "type": "high_hints", "severity": wa.severity})
        else:
            existing.score = min(1.0, existing.score + 0.1)
            detected.append({"title": existing.title, "type": "high_hints"})

    # Signal 2: Low quiz score
    if score is not None and score < 50:
        existing = db.query(WeakArea).filter(
            WeakArea.user_id == user_id,
            WeakArea.language_slug == language_slug or "",
            WeakArea.weakness_type == "low_quiz",
        ).first()
        if not existing:
            wa = WeakArea(
                user_id=user_id,
                language_slug=language_slug or "general",
                title=f"Low quiz scores in {language_slug or 'recent quizzes'}",
                weakness_type="low_quiz",
                severity="high",
                score=1.0 - (score / 100),
            )
            db.add(wa)
            detected.append({"title": wa.title, "type": "low_quiz", "severity": "high"})

    # Signal 3: Long solving time (from thinking history)
    recent_thinking = db.query(ThinkingHistory).filter(
        ThinkingHistory.user_id == user_id,
        ThinkingHistory.solution_completed.is_(False),
    ).order_by(ThinkingHistory.started_at.desc()).limit(5).all()
    for th in recent_thinking:
        if th.thinking_seconds > 1800:  # > 30 min
            existing = db.query(WeakArea).filter(
                WeakArea.user_id == user_id,
                WeakArea.topic_ref == th.problem_title,
                WeakArea.weakness_type == "long_solve",
            ).first()
            if not existing:
                wa = WeakArea(
                    user_id=user_id,
                    language_slug=th.language_slug or "general",
                    topic_ref=th.problem_title,
                    title=f"Long solving time: {th.problem_title}",
                    weakness_type="long_solve",
                    severity="medium",
                    score=min(1.0, th.thinking_seconds / 3600),
                )
                db.add(wa)
                detected.append({"title": wa.title, "type": "long_solve"})

    db.flush()
    return detected


def list_weak_areas(db: Session, user_id: UUID) -> list[WeakArea]:
    return db.query(WeakArea).filter(WeakArea.user_id == user_id).order_by(WeakArea.score.desc()).all()


def dismiss_weak_area(db: Session, user_id: UUID, weak_area_id: UUID) -> bool:
    wa = db.query(WeakArea).filter(WeakArea.id == weak_area_id, WeakArea.user_id == user_id).first()
    if not wa:
        return False
    db.delete(wa)
    db.commit()
    return True
