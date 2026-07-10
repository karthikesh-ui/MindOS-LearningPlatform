from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import LearningSession, Progress, Streak, TopicProgress, XpEvent


def progress_overview(db: Session, user_id) -> dict:
    sessions = db.query(LearningSession).filter(LearningSession.user_id == user_id).all()
    learning_hours = sum(s.duration_minutes for s in sessions) // 60

    completed_topics = (
        db.query(TopicProgress)
        .filter(TopicProgress.user_id == user_id, TopicProgress.completed.is_(True))
        .count()
    )

    progress_rows = db.query(Progress).filter(Progress.user_id == user_id).all()
    completed_languages = sum(1 for p in progress_rows if p.percent >= 100)

    streak = db.get(Streak, user_id)
    current_streak = streak.current if streak else 0
    longest_streak = streak.longest if streak else 0

    total_xp = sum(e.amount for e in db.query(XpEvent).filter(XpEvent.user_id == user_id).all())
    level = max(1, total_xp // 700 + 1)
    current_level_xp = total_xp % 700
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_gain = sum(e.amount for e in db.query(XpEvent).filter(XpEvent.user_id == user_id, XpEvent.created_at >= week_ago).all())

    weekly = _weekly_minutes(sessions)
    monthly = _monthly_progress(sessions)
    per_language = _per_language(progress_rows, sessions)

    timeline = [
        {
            "id": str(s.id),
            "title": f"Studied {s.duration_minutes} min",
            "detail": s.language_slug or "General",
            "occurred_at": s.started_at.isoformat() if s.started_at else datetime.now(timezone.utc).isoformat(),
            "kind": "completed",
        }
        for s in sorted(sessions, key=lambda x: x.started_at or datetime.min, reverse=True)[:6]
    ]

    return {
        "learning_hours": learning_hours,
        "completed_topics": completed_topics,
        "completed_languages": completed_languages,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "xp": {
            "total": total_xp,
            "level": level,
            "current_level_xp": current_level_xp,
            "next_level_xp": 700,
            "weekly_gain": weekly_gain,
        },
        "weekly_progress": weekly,
        "monthly_progress": monthly,
        "per_language": per_language,
        "timeline": timeline,
    }


def _weekly_minutes(sessions) -> list[dict]:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=today.weekday())
    buckets = {start + timedelta(days=i): 0 for i in range(7)}
    for s in sessions:
        if s.started_at and s.started_at.date() in buckets:
            buckets[s.started_at.date()] += s.duration_minutes
    return [{"day": days[i], "minutes": buckets[start + timedelta(days=i)]} for i in range(7)]


def _monthly_progress(sessions) -> list[dict]:
    now = datetime.now(timezone.utc)
    weeks = []
    for w in range(4):
        week_start = now - timedelta(weeks=3 - w)
        week_label = f"W{w + 1}"
        minutes = 0
        topics = 0
        for s in sessions:
            if s.started_at and (now - s.started_at).days <= (3 - w) * 7 + 7 and (now - s.started_at).days > (3 - w) * 7:
                minutes += s.duration_minutes
        weeks.append({"week": week_label, "minutes": minutes, "topics": topics})
    return weeks


def _per_language(progress_rows, sessions) -> list[dict]:
    out = []
    for p in progress_rows:
        lang_minutes = sum(s.duration_minutes for s in sessions if s.language_slug and p.language_id)
        out.append({
            "language_slug": "",
            "language_name": "",
            "percent": p.percent,
            "hours": lang_minutes // 60,
        })
    return out
