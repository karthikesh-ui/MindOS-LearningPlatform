import json
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Bookmark, Roadmap, RoadmapStage, Topic, TopicProgress


def get_roadmap(db: Session, language_slug: str) -> Roadmap | None:
    return db.query(Roadmap).filter(Roadmap.language_slug == language_slug).first()


def list_topics(db: Session, language_slug: str) -> list[Topic]:
    return (
        db.query(Topic)
        .filter(Topic.language_slug == language_slug)
        .order_by(Topic.position)
        .all()
    )


def get_topic(db: Session, language_slug: str, topic_slug: str) -> Topic | None:
    return (
        db.query(Topic)
        .filter(Topic.language_slug == language_slug, Topic.slug == topic_slug)
        .first()
    )


def topic_progress_for_user(db: Session, user_id, topic_ids: list[UUID]) -> dict:
    rows = (
        db.query(TopicProgress)
        .filter(TopicProgress.user_id == user_id, TopicProgress.topic_id.in_(topic_ids))
        .all()
    )
    return {r.topic_id: r for r in rows}


def mark_topic_complete(db: Session, user_id, topic_id) -> TopicProgress:
    tp = db.query(TopicProgress).filter(
        TopicProgress.user_id == user_id, TopicProgress.topic_id == topic_id
    ).first()
    if tp:
        tp.completed = True
        tp.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    else:
        tp = TopicProgress(user_id=user_id, topic_id=topic_id, completed=True,
                           completed_at=__import__("datetime").datetime.now(__import__("datetime").timezone.utc))
        db.add(tp)
    db.commit()
    db.refresh(tp)
    return tp


def toggle_topic_bookmark(db: Session, user_id, topic: Topic) -> bool:
    """Returns the new bookmarked state."""
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.type == "topic",
        Bookmark.external_ref == str(topic.id),
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return False
    bm = Bookmark(
        user_id=user_id,
        title=topic.title,
        language_slug=topic.language_slug,
        language_name=topic.language_slug.replace("-", " ").title(),
        type="topic",
        external_ref=str(topic.id),
    )
    db.add(bm)
    db.commit()
    return True


def is_topic_bookmarked(db: Session, user_id, topic_id) -> bool:
    return (
        db.query(Bookmark)
        .filter(Bookmark.user_id == user_id, Bookmark.type == "topic", Bookmark.external_ref == str(topic_id))
        .first()
        is not None
    )


def _json_list(raw: str | None) -> list:
    if not raw:
        return []
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []


def serialize_topic(topic: Topic, *, is_completed: bool = False, is_bookmarked: bool = False) -> dict:
    return {
        "id": str(topic.id),
        "language_slug": topic.language_slug,
        "title": topic.title,
        "stage": topic.stage.stage if topic.stage else "Beginner",
        "description": topic.description or "",
        "objectives": _json_list(topic.objectives),
        "prerequisites": _json_list(topic.prerequisites),
        "estimated_minutes": topic.estimated_minutes,
        "difficulty": topic.difficulty,
        "sub_topics": _json_list(topic.sub_topics),
        "examples": _json_list(topic.examples),
        "references": _json_list(topic.references),
        "is_completed": is_completed,
        "is_bookmarked": is_bookmarked,
    }
