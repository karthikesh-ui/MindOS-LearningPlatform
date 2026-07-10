from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import Problem, User
from app.schemas import ProblemIn, ProblemOut, ProblemUpdate, MessageOut
from app.services import create_problem, delete_problem, get_problem, list_problems, tags_as_list, update_problem

router = APIRouter(prefix="/problems", tags=["problems"])


def _to_out(p: Problem) -> ProblemOut:
    return ProblemOut(
        id=p.id,
        title=p.title,
        description=p.description,
        language_slug=p.language_slug,
        tags=tags_as_list(p),
        status=p.status,
        difficulty=p.difficulty,
        notes=p.notes,
        is_bookmarked=p.is_bookmarked,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.get("", response_model=list[ProblemOut])
def fetch_problems(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = list_problems(db, current.id)
    return [_to_out(p) for p in items]


@router.post("", response_model=ProblemOut, status_code=status.HTTP_201_CREATED)
def create(payload: ProblemIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = create_problem(db, current.id, payload.model_dump())
    return _to_out(p)


@router.patch("/{problem_id}", response_model=ProblemOut)
def patch(problem_id: str, patch: ProblemUpdate, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = update_problem(db, current.id, problem_id, patch.model_dump(exclude_unset=True))
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return _to_out(p)


@router.delete("/{problem_id}", response_model=MessageOut)
def remove(problem_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = delete_problem(db, current.id, problem_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Problem not found")
    return MessageOut(message="deleted")
