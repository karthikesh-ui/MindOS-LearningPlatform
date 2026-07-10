"""Revision service — spaced-repetition scheduling (1/3/7/14/30 days)."""
from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Revision

INTERVALS = [1, 3, 7, 14, 30]


def schedule_revision(db: Session, user_id: UUID, topic_ref: str, language_slug: str, title: str, *, interval_index: int = 0) -> Revision:
    """Schedule or advance a revision using spaced-repetition intervals."""
    existing = db.query(Revision).filter(
        Revision.user_id == user_id,
        Revision.topic_ref == topic_ref,
        Revision.completed.is_(False),
    ).first()

    interval = INTERVALS[min(interval_index, len(INTERVALS) - 1)]
    scheduled = date.today() + timedelta(days=interval)

    if existing:
        existing.interval_days = interval
        existing.scheduled_date = scheduled
        db.flush()
        return existing

    rev = Revision(
        user_id=user_id,
        topic_ref=topic_ref,
        language_slug=language_slug,
        title=title,
        scheduled_date=scheduled,
        interval_days=interval,
    )
    db.add(rev)
    db.flush()
    return rev


def complete_revision(db: Session, user_id: UUID, revision_id: UUID, accuracy: int = 80) -> Revision | None:
    rev = db.query(Revision).filter(Revision.id == revision_id, Revision.user_id == user_id).first()
    if not rev:
        return None
    rev.completed = True
    rev.completed_at = datetime.now(timezone.utc)
    rev.accuracy = accuracy
    db.flush()
    # Schedule the next interval if accuracy is high enough
    if accuracy >= 70:
        current_idx = INTERVALS.index(rev.interval_days) if rev.interval_days in INTERVALS else 0
        if current_idx < len(INTERVALS) - 1:
            schedule_revision(db, user_id, rev.topic_ref, rev.language_slug, rev.title, interval_index=current_idx + 1)
    db.flush()
    return rev


def get_revision_schedule(db: Session, user_id: UUID) -> dict:
    today = date.today()
    all_revs = db.query(Revision).filter(Revision.user_id == user_id).order_by(Revision.scheduled_date).all()
    return {
        "today": [r for r in all_revs if r.scheduled_date == today and not r.completed],
        "upcoming": [r for r in all_revs if r.scheduled_date > today and not r.completed],
        "overdue": [r for r in all_revs if r.scheduled_date < today and not r.completed],
    }


def list_revisions(db: Session, user_id: UUID) -> list[Revision]:
    return db.query(Revision).filter(Revision.user_id == user_id).order_by(Revision.scheduled_date).all()
