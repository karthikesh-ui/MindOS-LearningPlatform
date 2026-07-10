"""Quizzes router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import QuizOut, QuizSubmitIn, QuizAttemptOut, MessageOut
from app.services import list_quizzes, get_or_create_quiz, submit_quiz, list_attempts

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("", response_model=list[QuizOut])
def quizzes(language_slug: str | None = None, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_quizzes(db, current.id, language_slug)


@router.get("/{language_slug}", response_model=QuizOut)
def get_quiz(language_slug: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_or_create_quiz(db, language_slug)


@router.post("/submit")
def submit(payload: QuizSubmitIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = submit_quiz(db, current.id, payload.quiz_id, payload.answers)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/attempts/all", response_model=list[QuizAttemptOut])
def attempts(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_attempts(db, current.id)
