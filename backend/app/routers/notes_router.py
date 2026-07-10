from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import NoteIn, NoteOut, NoteUpdate, MessageOut
from app.services import (
    list_notes,
    search_notes,
    get_note,
    create_note,
    update_note,
    delete_note,
    toggle_pin,
    toggle_favorite,
)

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteOut])
def fetch_notes(
    q: str | None = Query(default=None),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if q:
        return search_notes(db, current.id, q)
    return list_notes(db, current.id)


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create(payload: NoteIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_note(db, current.id, payload.model_dump())


@router.patch("/{note_id}", response_model=NoteOut)
def patch(note_id: str, patch: NoteUpdate, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = update_note(db, current.id, note_id, patch.model_dump(exclude_unset=True))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{note_id}", response_model=MessageOut)
def remove(note_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = delete_note(db, current.id, note_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Note not found")
    return MessageOut(message="deleted")


@router.post("/{note_id}/pin", response_model=NoteOut)
def pin(note_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = toggle_pin(db, current.id, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post("/{note_id}/favorite", response_model=NoteOut)
def favorite(note_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = toggle_favorite(db, current.id, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note
