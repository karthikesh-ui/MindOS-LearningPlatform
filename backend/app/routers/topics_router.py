from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import Topic, User
from app.schemas import RoadmapOut, RoadmapStageOut, TopicBriefOut, TopicOut, MessageOut
from app.services import (
    get_roadmap,
    get_topic,
    is_topic_bookmarked,
    list_topics,
    mark_topic_complete,
    serialize_topic,
    topic_progress_for_user,
    toggle_topic_bookmark,
)
from uuid import UUID

router = APIRouter(prefix="/learning", tags=["learning"])


def _topic_brief(topic: Topic, completed: bool = False) -> TopicBriefOut:
    return TopicBriefOut(
        id=topic.id,
        title=topic.title,
        estimated_minutes=topic.estimated_minutes,
        difficulty=topic.difficulty,
        completed=completed,
    )


@router.get("/{language_slug}/roadmap", response_model=RoadmapOut)
def fetch_roadmap(language_slug: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rm = get_roadmap(db, language_slug)
    if not rm:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    topics = list_topics(db, language_slug)
    progress_map = topic_progress_for_user(db, current.id, [t.id for t in topics])
    stages_out: list[RoadmapStageOut] = []
    for stage in sorted(rm.stages, key=lambda s: s.position):
        stage_topics = [t for t in topics if t.stage_id == stage.id]
        stage_out = RoadmapStageOut(
            stage=stage.stage,
            description=stage.description,
            progress=stage.progress,
            topics=[
                _topic_brief(t, completed=progress_map.get(t.id) is not None and progress_map[t.id].completed)
                for t in sorted(stage_topics, key=lambda x: x.position)
            ],
        )
        stages_out.append(stage_out)
    return RoadmapOut(
        language_slug=rm.language_slug,
        language_name=rm.language_name,
        overall_percent=rm.overall_percent,
        stages=stages_out,
    )


@router.get("/{language_slug}/topics/{topic_slug}", response_model=TopicOut)
def fetch_topic(language_slug: str, topic_slug: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = get_topic(db, language_slug, topic_slug)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    progress_map = topic_progress_for_user(db, current.id, [topic.id])
    is_completed = progress_map.get(topic.id) is not None and progress_map[topic.id].completed
    is_bookmarked = is_topic_bookmarked(db, current.id, topic.id)
    return TopicOut(**serialize_topic(topic, is_completed=is_completed, is_bookmarked=is_bookmarked))


@router.post("/{language_slug}/topics/{topic_slug}/complete", response_model=MessageOut)
def complete_topic(language_slug: str, topic_slug: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = get_topic(db, language_slug, topic_slug)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    mark_topic_complete(db, current.id, topic.id)
    return MessageOut(message="completed")


@router.post("/{language_slug}/topics/{topic_slug}/bookmark", response_model=MessageOut)
def bookmark_topic(language_slug: str, topic_slug: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = get_topic(db, language_slug, topic_slug)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    state = toggle_topic_bookmark(db, current.id, topic)
    return MessageOut(message="bookmarked" if state else "unbookmarked")
