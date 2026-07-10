import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Problem


def list_problems(db: Session, user_id) -> list[Problem]:
    return (
        db.query(Problem)
        .filter(Problem.user_id == user_id)
        .order_by(Problem.created_at.desc())
        .all()
    )


def get_problem(db: Session, user_id, problem_id) -> Problem | None:
    return db.query(Problem).filter(Problem.id == problem_id, Problem.user_id == user_id).first()


def create_problem(db: Session, user_id, data: dict) -> Problem:
    tags = data.pop("tags", [])
    problem = Problem(user_id=user_id, tags=json.dumps(tags), **data)
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


def update_problem(db: Session, user_id, problem_id, patch: dict) -> Problem | None:
    problem = get_problem(db, user_id, problem_id)
    if not problem:
        return None
    if "tags" in patch and isinstance(patch["tags"], list):
        patch["tags"] = json.dumps(patch["tags"])
    for k, v in patch.items():
        if v is not None:
            setattr(problem, k, v)
    problem.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(problem)
    return problem


def delete_problem(db: Session, user_id, problem_id) -> bool:
    problem = get_problem(db, user_id, problem_id)
    if not problem:
        return False
    db.delete(problem)
    db.commit()
    return True


def tags_as_list(problem: Problem) -> list[str]:
    if not problem.tags:
        return []
    try:
        return json.loads(problem.tags)
    except (json.JSONDecodeError, TypeError):
        return []
