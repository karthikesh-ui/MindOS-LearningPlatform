import json
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Note


def list_notes(db: Session, user_id) -> list[Note]:
    return (
        db.query(Note)
        .filter(Note.user_id == user_id)
        .order_by(Note.pinned.desc(), Note.updated_at.desc())
        .all()
    )


def search_notes(db: Session, user_id, query: str) -> list[Note]:
    q = f"%{query}%"
    return (
        db.query(Note)
        .filter(Note.user_id == user_id, Note.title.ilike(q))
        .order_by(Note.updated_at.desc())
        .all()
    )


def get_note(db: Session, user_id, note_id) -> Note | None:
    return db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()


def create_note(db: Session, user_id, data: dict) -> Note:
    note = Note(user_id=user_id, **data)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, user_id, note_id, patch: dict) -> Note | None:
    note = get_note(db, user_id, note_id)
    if not note:
        return None
    for k, v in patch.items():
        if v is not None:
            setattr(note, k, v)
    note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, user_id, note_id) -> bool:
    note = get_note(db, user_id, note_id)
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True


def toggle_pin(db: Session, user_id, note_id) -> Note | None:
    note = get_note(db, user_id, note_id)
    if not note:
        return None
    note.pinned = not note.pinned
    db.commit()
    db.refresh(note)
    return note


def toggle_favorite(db: Session, user_id, note_id) -> Note | None:
    note = get_note(db, user_id, note_id)
    if not note:
        return None
    note.favorite = not note.favorite
    db.commit()
    db.refresh(note)
    return note


def _serialize_tags(raw: str | None) -> list[str]:
    if not raw:
        return []
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []
