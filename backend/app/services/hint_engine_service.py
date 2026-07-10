"""AI Hint Engine — progressive hint stages that never reveal the solution immediately.

7 stages:
  1. Understand the problem
  2. Tiny Hint
  3. Thinking Direction
  4. Logical Approach
  5. Pseudo Code
  6. Time Complexity
  7. Final Solution (locked until explicitly requested)
"""
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import HintLog, ThinkingHistory

HINT_STAGES = [
    {"stage": 1, "name": "Understand the Problem", "content": "Re-read the problem statement. What are the inputs and expected outputs? What constraints are given? Try to restate the problem in your own words before writing any code."},
    {"stage": 2, "name": "Tiny Hint", "content": "Think about what data structure could help here. Consider whether the problem involves counting, searching, or transformation of the input."},
    {"stage": 3, "name": "Thinking Direction", "content": "Consider approaching this with a hash map (for O(n) lookups) or two pointers (for in-place traversal). Which fits the problem's constraints better?"},
    {"stage": 4, "name": "Logical Approach", "content": "Outline the steps: (1) Initialize a data structure, (2) Iterate through the input, (3) For each element, check/update the structure, (4) Return the result. Map these steps to the problem specifics."},
    {"stage": 5, "name": "Pseudo Code", "content": "function solve(input):\n  structure = empty\n  for each item in input:\n    if condition(item, structure):\n      update result\n    else:\n      add item to structure\n  return result"},
    {"stage": 6, "name": "Time Complexity", "content": "The optimal approach runs in O(n) time with O(n) space, where n is the input size. The brute-force O(n^2) approach would be too slow for large inputs. Can you identify why?"},
    {"stage": 7, "name": "Final Solution", "content": "This stage is locked. Only reveal the solution after you have attempted the problem yourself. Click 'Reveal Solution' if you are truly stuck."},
]


def get_hint_progress(db: Session, user_id: UUID, problem_title: str) -> dict:
    """Get the current hint progress for a problem."""
    th = db.query(ThinkingHistory).filter(
        ThinkingHistory.user_id == user_id,
        ThinkingHistory.problem_title == problem_title,
        ThinkingHistory.finished_at.is_(None),
    ).order_by(ThinkingHistory.started_at.desc()).first()

    revealed_stages = set()
    th_id = None
    if th:
        th_id = th.id
        logs = db.query(HintLog).filter(HintLog.thinking_history_id == th.id).all()
        revealed_stages = {log.stage for log in logs}

    stages = []
    for s in HINT_STAGES:
        stages.append({
            "stage": s["stage"],
            "stage_name": s["name"],
            "content": s["content"] if s["stage"] in revealed_stages else "",
            "is_locked": s["stage"] not in revealed_stages,
        })

    current_stage = max(revealed_stages) if revealed_stages else 0
    return {"thinking_history_id": th_id, "current_stage": current_stage, "stages": stages}


def reveal_hint(db: Session, user_id: UUID, problem_title: str, stage: int) -> dict:
    """Reveal a specific hint stage for a problem."""
    if stage < 1 or stage > 7:
        return {"error": "Invalid stage"}

    th = db.query(ThinkingHistory).filter(
        ThinkingHistory.user_id == user_id,
        ThinkingHistory.problem_title == problem_title,
        ThinkingHistory.finished_at.is_(None),
    ).order_by(ThinkingHistory.started_at.desc()).first()

    if not th:
        th = ThinkingHistory(
            user_id=user_id,
            problem_title=problem_title,
            started_at=__import__("datetime").datetime.now(__import__("datetime").timezone.utc),
            difficulty="Medium",
        )
        db.add(th)
        db.flush()

    # Check if already revealed
    existing = db.query(HintLog).filter(
        HintLog.thinking_history_id == th.id,
        HintLog.stage == stage,
    ).first()
    if not existing:
        log = HintLog(
            user_id=user_id,
            thinking_history_id=th.id,
            stage=stage,
            stage_name=HINT_STAGES[stage - 1]["name"],
        )
        db.add(log)
        th.hints_opened = (th.hints_opened or 0) + 1
        db.flush()

    stage_info = HINT_STAGES[stage - 1]
    return {
        "stage": stage,
        "stage_name": stage_info["name"],
        "content": stage_info["content"],
        "is_locked": False,
        "thinking_history_id": th.id,
    }
