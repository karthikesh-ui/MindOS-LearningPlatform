"""Flashcards router."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import FlashcardIn, FlashcardOut, MessageOut
from app.services import list_flashcards, create_flashcard, review_flashcard, delete_flashcard, get_flashcard_stats

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.get("", response_model=list[FlashcardOut])
def list_cards(
    due_only: bool = Query(default=False),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_flashcards(db, current.id, due_only)


@router.get("/stats")
def stats(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_flashcard_stats(db, current.id)


@router.post("", response_model=FlashcardOut, status_code=status.HTTP_201_CREATED)
def create(payload: FlashcardIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_flashcard(db, current.id, payload.model_dump())


@router.post("/{card_id}/review", response_model=FlashcardOut)
def review(card_id: UUID, rating: str = Query(...), current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = review_flashcard(db, current.id, card_id, rating)
    if not result:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return result


@router.delete("/{card_id}", response_model=MessageOut)
def remove(card_id: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = delete_flashcard(db, current.id, card_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return MessageOut(message="deleted")
