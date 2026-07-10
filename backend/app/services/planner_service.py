from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import PlannerItem


SCOPE_VALUES = ("today", "tomorrow", "week", "month")
PRIORITY_VALUES = ("low", "medium", "high")


def list_planner(db: Session, user_id, scope: str | None = None) -> list[PlannerItem]:
    q = db.query(PlannerItem).filter(PlannerItem.user_id == user_id)
    if scope:
        q = q.filter(PlannerItem.scheduled_for == scope)
    return q.order_by(PlannerItem.done, PlannerItem.position, PlannerItem.created_at).all()


def create_planner_item(db: Session, user_id, data: dict) -> PlannerItem:
    item = PlannerItem(user_id=user_id, **data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_planner_item(db: Session, user_id, item_id, patch: dict) -> PlannerItem | None:
    item = db.query(PlannerItem).filter(PlannerItem.id == item_id, PlannerItem.user_id == user_id).first()
    if not item:
        return None
    for k, v in patch.items():
        if v is not None:
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


def delete_planner_item(db: Session, user_id, item_id) -> bool:
    item = db.query(PlannerItem).filter(PlannerItem.id == item_id, PlannerItem.user_id == user_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def planner_overview(db: Session, user_id) -> dict:
    items = list_planner(db, user_id)
    today = [i for i in items if i.scheduled_for == "today"]
    completed_today = sum(1 for i in today if i.done)
    week = [i for i in items if i.scheduled_for == "week"]
    done_week = sum(1 for i in week if i.done)
    week_progress = int((done_week / max(len(week), 1)) * 100) if week else 0
    return {
        "today": [i for i in today],
        "tomorrow": [i for i in items if i.scheduled_for == "tomorrow"],
        "week": week,
        "month": [i for i in items if i.scheduled_for == "month"],
        "completed_today": completed_today,
        "total_today": len(today),
        "week_progress": week_progress,
    }
