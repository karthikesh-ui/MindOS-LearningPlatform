from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import PlannerItem, User
from app.schemas import PlannerTaskIn, PlannerTaskOut, PlannerTaskUpdate, PlannerOverviewOut, MessageOut
from app.services import (
    create_planner_item,
    delete_planner_item,
    list_planner_items,
    planner_overview,
    update_planner_item,
)

router = APIRouter(prefix="/planner", tags=["planner"])


def _to_out(item: PlannerItem) -> PlannerTaskOut:
    return PlannerTaskOut(
        id=item.id,
        title=item.title,
        language_slug=item.language_slug,
        language_name=item.language_name,
        scope=item.scheduled_for,
        priority="medium",
        duration_minutes=item.duration_minutes,
        deadline=None,
        done=item.done,
        created_at=item.created_at,
    )


@router.get("", response_model=list[PlannerTaskOut])
def fetch_tasks(
    scope: str | None = Query(default=None),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = list_planner_items(db, current.id, scope)
    return [_to_out(i) for i in items]


@router.get("/overview", response_model=PlannerOverviewOut)
def overview(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = planner_overview(db, current.id)
    return PlannerOverviewOut(
        today=[_to_out(i) for i in data["today"]],
        tomorrow=[_to_out(i) for i in data["tomorrow"]],
        week=[_to_out(i) for i in data["week"]],
        month=[_to_out(i) for i in data["month"]],
        completed_today=data["completed_today"],
        total_today=data["total_today"],
        week_progress=data["week_progress"],
    )


@router.post("", response_model=PlannerTaskOut, status_code=status.HTTP_201_CREATED)
def create(payload: PlannerTaskIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = {
        "title": payload.title,
        "language_slug": payload.language_slug,
        "language_name": payload.language_name,
        "scheduled_for": payload.scope,
        "duration_minutes": payload.duration_minutes,
    }
    item = create_planner_item(db, current.id, data)
    return _to_out(item)


@router.patch("/{task_id}", response_model=PlannerTaskOut)
def patch(task_id: str, patch: PlannerTaskUpdate, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = patch.model_dump(exclude_unset=True)
    mapped = {}
    if "scope" in data:
        mapped["scheduled_for"] = data.pop("scope")
    if "done" in data:
        mapped["done"] = data.pop("done")
    mapped.update(data)
    item = update_planner_item(db, current.id, task_id, mapped)
    if not item:
        raise HTTPException(status_code=404, detail="Task not found")
    return _to_out(item)


@router.delete("/{task_id}", response_model=MessageOut)
def remove(task_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = delete_planner_item(db, current.id, task_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return MessageOut(message="deleted")
