"""Thinking History + Hint Engine router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import ThinkingHistoryIn, ThinkingHistoryOut, HintProgressOut, RevealHintIn, MessageOut
from app.services import (
    start_thinking_session,
    finish_thinking_session,
    list_thinking_history,
    get_thinking_stats,
    get_hint_progress,
    reveal_hint,
)

router = APIRouter(prefix="/thinking", tags=["thinking"])


@router.get("/history", response_model=list[ThinkingHistoryOut])
def history(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_thinking_history(db, current.id)


@router.get("/stats")
def stats(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_thinking_stats(db, current.id)


@router.post("/start", response_model=ThinkingHistoryOut, status_code=201)
def start(payload: ThinkingHistoryIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return start_thinking_session(db, current.id, payload.model_dump())


@router.post("/{session_id}/finish", response_model=ThinkingHistoryOut)
def finish(session_id: UUID, payload: ThinkingHistoryIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = finish_thinking_session(db, current.id, session_id, payload.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="Thinking session not found")
    return result


@router.get("/hints", response_model=HintProgressOut)
def hint_progress(problem_title: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_hint_progress(db, current.id, problem_title)


@router.post("/hints/reveal")
def reveal(payload: RevealHintIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return reveal_hint(db, current.id, payload.problem_title, payload.stage)
