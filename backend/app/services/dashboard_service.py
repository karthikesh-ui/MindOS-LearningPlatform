from datetime import datetime, timezone, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import (
    Achievement,
    Bookmark,
    Language,
    PlannerItem,
    Progress,
    Streak,
    User,
    UserAchievement,
    XpEvent,
)
from app.services.learning_service import get_xp_summary


def build_dashboard(db: Session, user: User) -> dict:
    user_id = user.id

    progress_rows: list[Progress] = (
        db.query(Progress).filter(Progress.user_id == user_id).all()
    )
    languages: list[Language] = (
        db.query(Language).filter(Language.is_published.is_(True)).order_by(Language.name).all()
    )

    todays_plan = (
        db.query(PlannerItem)
        .filter(PlannerItem.user_id == user_id, PlannerItem.scheduled_for == "today")
        .order_by(PlannerItem.position, PlannerItem.created_at)
        .all()
    )
    tomorrow = (
        db.query(PlannerItem)
        .filter(PlannerItem.user_id == user_id, PlannerItem.scheduled_for == "tomorrow")
        .order_by(PlannerItem.position, PlannerItem.created_at)
        .all()
    )

    bookmarks = (
        db.query(Bookmark)
        .filter(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
        .limit(4)
        .all()
    )

    streak = db.get(Streak, user_id)

    xp = get_xp_summary(db, user_id)

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_xp = (
        db.query(XpEvent)
        .filter(XpEvent.user_id == user_id, XpEvent.created_at >= week_ago)
        .order_by(XpEvent.created_at.desc())
        .all()
    )

    recent_activity = _recent_activity(progress_rows, bookmarks, weekly_xp)

    profile = user.profile
    weekly_goal = {
        "completed_minutes": 215 if not profile else max(0, min(profile.weekly_goal_minutes, 215)),
        "target_minutes": profile.weekly_goal_minutes if profile else 300,
    }

    return {
        "user": _user_dict(user),
        "xp": xp,
        "streak": _streak_dict(streak),
        "todays_plan": [_planner_dict(p) for p in todays_plan],
        "tomorrow_preview": [_planner_dict(p) for p in tomorrow],
        "continue_learning": [_progress_dict(p) for p in progress_rows],
        "weekly_goal": weekly_goal,
        "recent_activity": recent_activity,
        "bookmarks": [_bookmark_dict(b) for b in bookmarks],
        "languages": [_language_dict(l) for l in languages],
    }


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "provider": user.provider,
        "created_at": user.created_at,
    }


def _streak_dict(streak: Streak | None) -> dict:
    if not streak:
        return {"current": 0, "longest": 0, "last_study_date": None, "week_mask": "0000000"}
    return {
        "current": streak.current,
        "longest": streak.longest,
        "last_study_date": streak.last_study_date,
        "week_mask": streak.week_mask,
    }


def _planner_dict(p: PlannerItem) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "language_slug": p.language_slug,
        "language_name": p.language_name,
        "scheduled_for": p.scheduled_for,
        "duration_minutes": p.duration_minutes,
        "done": p.done,
    }


def _progress_dict(p: Progress) -> dict:
    return {
        "language_id": p.language_id,
        "percent": p.percent,
        "completed_modules": p.completed_modules,
        "total_modules": p.total_modules,
        "last_studied_at": p.last_studied_at,
        "next_module_title": p.next_module_title,
    }


def _bookmark_dict(b: Bookmark) -> dict:
    return {
        "id": b.id,
        "title": b.title,
        "language_slug": b.language_slug,
        "language_name": b.language_name,
        "type": b.type,
        "created_at": b.created_at,
    }


def _language_dict(l: Language) -> dict:
    return {
        "id": l.id,
        "slug": l.slug,
        "name": l.name,
        "tagline": l.tagline,
        "description": l.description,
        "difficulty": l.difficulty,
        "estimated_hours": l.estimated_hours,
        "icon": l.icon,
        "accent": l.accent,
        "modules_count": l.modules_count,
    }


def _recent_activity(
    progress_rows: list[Progress],
    bookmarks: list[Bookmark],
    weekly_xp: list[XpEvent],
) -> list[dict]:
    items: list[dict] = []
    for p in progress_rows[:3]:
        if p.last_studied_at:
            items.append(
                {
                    "id": str(p.language_id),
                    "kind": "completed",
                    "title": f"Studied {p.completed_modules}/{p.total_modules} modules",
                    "detail": "Track progress",
                    "occurred_at": p.last_studied_at,
                }
            )
    for b in bookmarks[:2]:
        items.append(
            {
                "id": str(b.id),
                "kind": "bookmark",
                "title": f"Bookmarked · {b.title}",
                "detail": b.language_name,
                "occurred_at": b.created_at,
            }
        )
    for e in weekly_xp[:1]:
        items.append(
            {
                "id": str(e.id),
                "kind": "milestone",
                "title": f"+{e.amount} XP",
                "detail": e.reason,
                "occurred_at": e.created_at,
            }
        )
    items.sort(key=lambda i: i["occurred_at"], reverse=True)
    return items[:6]
