"""Notification service — intelligent reminders."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Notification


def create_notification(
    db: Session,
    user_id: UUID,
    kind: str,
    title: str,
    body: str | None = None,
    resource_url: str | None = None,
) -> Notification:
    n = Notification(user_id=user_id, kind=kind, title=title, body=body, resource_url=resource_url)
    db.add(n)
    db.flush()
    return n


def list_notifications(db: Session, user_id: UUID, unread_only: bool = False) -> list[Notification]:
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.read.is_(False))
    return q.order_by(Notification.created_at.desc()).limit(50).all()


def mark_read(db: Session, user_id: UUID, notification_id: UUID) -> Notification | None:
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not n:
        return None
    n.read = True
    db.commit()
    return n


def mark_all_read(db: Session, user_id: UUID) -> int:
    rows = db.query(Notification).filter(Notification.user_id == user_id, Notification.read.is_(False)).all()
    for n in rows:
        n.read = True
    db.commit()
    return len(rows)


def delete_notification(db: Session, user_id: UUID, notification_id: UUID) -> bool:
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not n:
        return False
    db.delete(n)
    db.commit()
    return True
