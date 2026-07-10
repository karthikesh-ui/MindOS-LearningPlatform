from sqlalchemy.orm import Session

from app.models import Language, Progress, Bookmark, PlannerItem, XpEvent, Streak, Achievement, UserAchievement


def list_languages(db: Session) -> list[Language]:
    return db.query(Language).filter(Language.is_published.is_(True)).order_by(Language.name).all()


def get_language_by_slug(db: Session, slug: str) -> Language | None:
    return db.query(Language).filter(Language.slug == slug).first()


def list_progress(db: Session, user_id) -> list[Progress]:
    return db.query(Progress).filter(Progress.user_id == user_id).all()


def upsert_progress(db: Session, user_id, language_id, *, percent: int, completed_modules: int, total_modules: int, next_module_title: str | None) -> Progress:
    progress = db.query(Progress).filter(
        Progress.user_id == user_id, Progress.language_id == language_id
    ).first()
    if progress:
        progress.percent = percent
        progress.completed_modules = completed_modules
        progress.total_modules = total_modules
        progress.next_module_title = next_module_title
    else:
        progress = Progress(
            user_id=user_id,
            language_id=language_id,
            percent=percent,
            completed_modules=completed_modules,
            total_modules=total_modules,
            next_module_title=next_module_title,
        )
        db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


def list_bookmarks(db: Session, user_id) -> list[Bookmark]:
    return (
        db.query(Bookmark)
        .filter(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )


def add_bookmark(db: Session, user_id, data: dict) -> Bookmark:
    bm = Bookmark(user_id=user_id, **data)
    db.add(bm)
    db.commit()
    db.refresh(bm)
    return bm


def remove_bookmark(db: Session, user_id, bookmark_id) -> bool:
    bm = db.query(Bookmark).filter(Bookmark.id == bookmark_id, Bookmark.user_id == user_id).first()
    if not bm:
        return False
    db.delete(bm)
    db.commit()
    return True


def list_planner(db: Session, user_id, scheduled_for: str | None = None) -> list[PlannerItem]:
    q = db.query(PlannerItem).filter(PlannerItem.user_id == user_id)
    if scheduled_for:
        q = q.filter(PlannerItem.scheduled_for == scheduled_for)
    return q.order_by(PlannerItem.position, PlannerItem.created_at).all()


def add_xp(db: Session, user_id, amount: int, reason: str) -> XpEvent:
    event = XpEvent(user_id=user_id, amount=amount, reason=reason)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_xp_summary(db: Session, user_id) -> dict:
    total = (
        db.query(db.query(XpEvent).filter(XpEvent.user_id == user_id).with_entities(XpEvent.amount).subquery())
        if False
        else sum(e.amount for e in db.query(XpEvent).filter(XpEvent.user_id == user_id).all())
    )
    level = max(1, total // 700 + 1)
    current_level_xp = total % 700
    next_level_xp = 700
    from datetime import datetime, timezone, timedelta
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_gain = sum(
        e.amount for e in db.query(XpEvent).filter(XpEvent.user_id == user_id, XpEvent.created_at >= week_ago).all()
    )
    return {
        "total": total,
        "level": level,
        "current_level_xp": current_level_xp,
        "next_level_xp": next_level_xp,
        "weekly_gain": weekly_gain,
    }


def get_streak(db: Session, user_id) -> Streak | None:
    return db.get(Streak, user_id)


def list_achievements(db: Session) -> list[Achievement]:
    return db.query(Achievement).order_by(Achievement.title).all()


def list_user_achievements(db: Session, user_id) -> list[UserAchievement]:
    return db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
