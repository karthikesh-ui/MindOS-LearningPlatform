"""Revisions router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import RevisionOut, RevisionScheduleOut, MessageOut
from app.services import get_revision_schedule, complete_revision, list_revisions

router = APIRouter(prefix="/revisions", tags=["revisions"])


@router.get("", response_model=list[RevisionOut])
def all_revisions(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_revisions(db, current.id)


@router.get("/schedule", response_model=RevisionScheduleOut)
def schedule(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_revision_schedule(db, current.id)


@router.post("/{revision_id}/complete", response_model=RevisionOut)
def complete(revision_id: UUID, accuracy: int = 80, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = complete_revision(db, current.id, revision_id, accuracy)
    if not result:
        raise HTTPException(status_code=404, detail="Revision not found")
    return result
