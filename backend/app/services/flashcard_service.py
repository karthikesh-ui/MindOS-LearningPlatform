"""Flashcard service — spaced-repetition flashcards with SM-2-like scheduling."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Flashcard

RATING_MAP = {"again": 0, "hard": 3, "good": 4, "easy": 5}


def list_flashcards(db: Session, user_id: UUID, due_only: bool = False) -> list[Flashcard]:
    q = db.query(Flashcard).filter(Flashcard.user_id == user_id)
    if due_only:
        now = datetime.now(timezone.utc)
        q = q.filter(Flashcard.next_review_at.is_(None) | (Flashcard.next_review_at <= now))
    return q.order_by(Flashcard.next_review_at.asc().nullsfirst(), Flashcard.updated_at.desc()).all()


def create_flashcard(db: Session, user_id: UUID, data: dict) -> Flashcard:
    fc = Flashcard(user_id=user_id, **data)
    db.add(fc)
    db.commit()
    db.refresh(fc)
    return fc


def auto_generate_from_topic(db: Session, user_id: UUID, topic_title: str, language_slug: str, sub_topics: list[str]) -> list[Flashcard]:
    """Generate flashcards from a topic's sub-topics."""
    created = []
    for sub in sub_topics:
        fc = Flashcard(
            user_id=user_id,
            front=f"What is {sub} in {topic_title}?",
            back=f"{sub} is a key concept within {topic_title}. Review the topic material for details.",
            source_type="topic",
            source_ref=topic_title,
            language_slug=language_slug,
        )
        db.add(fc)
        created.append(fc)
    db.commit()
    return created


def review_flashcard(db: Session, user_id: UUID, flashcard_id: UUID, rating: str) -> Flashcard | None:
    """Apply SM-2-like spaced repetition to a flashcard."""
    fc = db.query(Flashcard).filter(Flashcard.id == flashcard_id, Flashcard.user_id == user_id).first()
    if not fc:
        return None
    quality = RATING_MAP.get(rating, 3)

    # SM-2 algorithm
    if quality < 3:
        fc.interval_days = 0
        fc.status = "learning"
        fc.ease_factor = max(1.3, fc.ease_factor - 0.2)
        fc.next_review_at = datetime.now(timezone.utc) + timedelta(hours=1)
    else:
        if fc.interval_days == 0:
            fc.interval_days = 1
        elif fc.interval_days == 1:
            fc.interval_days = 3
        else:
            fc.interval_days = int(fc.interval_days * fc.ease_factor)
        fc.ease_factor = max(1.3, fc.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        fc.next_review_at = datetime.now(timezone.utc) + timedelta(days=fc.interval_days)
        if fc.interval_days >= 14:
            fc.status = "mastered"
        elif fc.interval_days >= 3:
            fc.status = "known"
        else:
            fc.status = "learning"

    fc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(fc)
    return fc


def delete_flashcard(db: Session, user_id: UUID, flashcard_id: UUID) -> bool:
    fc = db.query(Flashcard).filter(Flashcard.id == flashcard_id, Flashcard.user_id == user_id).first()
    if not fc:
        return False
    db.delete(fc)
    db.commit()
    return True


def get_flashcard_stats(db: Session, user_id: UUID) -> dict:
    cards = db.query(Flashcard).filter(Flashcard.user_id == user_id).all()
    total = len(cards)
    now = datetime.now(timezone.utc)
    due = sum(1 for c in cards if c.next_review_at is None or c.next_review_at <= now)
    mastered = sum(1 for c in cards if c.status == "mastered")
    return {"total": total, "due": due, "mastered": mastered}
