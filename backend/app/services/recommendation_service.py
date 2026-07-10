"""Recommendation Engine — suggests next steps based on learning history."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import (
    LearningSessionRecord,
    Progress,
    Recommendation,
    ThinkingHistory,
    TopicProgress,
)


def generate_recommendations(
    db: Session,
    user_id: UUID,
    event_type: str,
    language_slug: str | None = None,
) -> list[dict]:
    """Generate recommendations based on the current event and learning history."""
    generated: list[dict] = []

    # Next topic recommendation
    if event_type == "topic_completed" and language_slug:
        rec = Recommendation(
            user_id=user_id,
            kind="next_topic",
            title=f"Continue with the next {language_slug} topic",
            subtitle="Pick up where you left off",
            language_slug=language_slug,
            priority=8,
            reason="You just completed a topic — momentum is highest right now.",
        )
        db.add(rec)
        generated.append({"kind": "next_topic", "title": rec.title, "language_slug": language_slug})

    # Practice problem recommendation
    if event_type == "problem_solved":
        rec = Recommendation(
            user_id=user_id,
            kind="practice_problem",
            title="Try a harder problem",
            subtitle="Challenge yourself with the next difficulty level",
            language_slug=language_slug,
            priority=7,
            reason="Solving consecutive problems builds problem-solving muscle.",
        )
        db.add(rec)
        generated.append({"kind": "practice_problem", "title": rec.title})

    # Revision recommendation
    if event_type == "quiz_taken":
        rec = Recommendation(
            user_id=user_id,
            kind="revision",
            title="Review weak areas from recent quizzes",
            subtitle="Spaced repetition will lock in the concepts",
            priority=6,
            reason="Quiz performance suggests some topics need reinforcement.",
        )
        db.add(rec)
        generated.append({"kind": "revision", "title": rec.title})

    # Next language recommendation
    progress_rows = db.query(Progress).filter(Progress.user_id == user_id).all()
    if len(progress_rows) >= 2 and event_type == "topic_completed":
        completed_langs = [p for p in progress_rows if p.percent >= 100]
        if completed_langs and len(completed_langs) < 4:
            rec = Recommendation(
                user_id=user_id,
                kind="next_language",
                title="Start a new language track",
                subtitle="Broaden your skill set",
                priority=5,
                reason="You have completed tracks — diversifying will accelerate growth.",
            )
            db.add(rec)
            generated.append({"kind": "next_language", "title": rec.title})

    # Interview recommendation
    recent_thinking = db.query(ThinkingHistory).filter(
        ThinkingHistory.user_id == user_id,
        ThinkingHistory.solution_completed.is_(True),
    ).count()
    if recent_thinking >= 10 and event_type == "problem_solved":
        rec = Recommendation(
            user_id=user_id,
            kind="interview",
            title="Try a mock interview",
            subtitle="Test your skills under time pressure",
            priority=6,
            reason="You have solved 10+ problems — interview practice will sharpen your delivery.",
        )
        db.add(rec)
        generated.append({"kind": "interview", "title": rec.title})

    # Project suggestion
    if event_type == "topic_completed":
        total_sessions = db.query(LearningSessionRecord).filter(LearningSessionRecord.user_id == user_id).count()
        if total_sessions > 20:
            rec = Recommendation(
                user_id=user_id,
                kind="project",
                title="Build a project to apply your skills",
                subtitle="Apply what you have learned to a real-world problem",
                language_slug=language_slug,
                priority=5,
                reason="You have enough foundation — building a project will consolidate your knowledge.",
            )
            db.add(rec)
            generated.append({"kind": "project", "title": rec.title})

    db.flush()
    return generated


def list_recommendations(db: Session, user_id: UUID, accepted_only: bool = False) -> list[Recommendation]:
    q = db.query(Recommendation).filter(Recommendation.user_id == user_id)
    if accepted_only:
        q = q.filter(Recommendation.accepted.is_(True))
    return q.order_by(Recommendation.priority.desc(), Recommendation.created_at.desc()).limit(20).all()


def accept_recommendation(db: Session, user_id: UUID, rec_id: UUID) -> Recommendation | None:
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id, Recommendation.user_id == user_id).first()
    if not rec:
        return None
    rec.accepted = True
    db.commit()
    return rec


def dismiss_recommendation(db: Session, user_id: UUID, rec_id: UUID) -> bool:
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id, Recommendation.user_id == user_id).first()
    if not rec:
        return False
    db.delete(rec)
    db.commit()
    return True
