"""Quiz Engine — supports MCQ, fill-in-blank, output prediction, code debug, concept match."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Quiz, QuizAttempt

QUIZ_TEMPLATES = {
    "python": [
        {"id": "q1", "question": "What is the output of: print(type([]))?", "type": "output_predict", "options": ["<class 'list'>", "<class 'array'>", "<class 'dict'>", "list"], "correct_index": 0, "explanation": "[] creates a list, and type() returns its class."},
        {"id": "q2", "question": "Which keyword is used to define a function in Python?", "type": "mcq", "options": ["function", "def", "func", "lambda"], "correct_index": 1, "explanation": "Python uses 'def' to define functions."},
        {"id": "q3", "question": "Fill in the blank: The ______ statement is used to exit a loop early.", "type": "fill_blank", "correct_answer": "break", "explanation": "The break statement exits the nearest enclosing loop."},
    ],
    "sql": [
        {"id": "q1", "question": "Which JOIN returns all rows from the left table even if no match in the right?", "type": "mcq", "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], "correct_index": 1, "explanation": "LEFT JOIN preserves all rows from the left table."},
        {"id": "q2", "question": "What does COUNT(*) return?", "type": "mcq", "options": ["Number of distinct values", "Total number of rows", "First row count", "Column sum"], "correct_index": 1, "explanation": "COUNT(*) counts all rows including duplicates and NULLs."},
    ],
    "java": [
        {"id": "q1", "question": "Which keyword prevents method overriding?", "type": "mcq", "options": ["static", "final", "private", "abstract"], "correct_index": 1, "explanation": "The 'final' keyword prevents a method from being overridden."},
        {"id": "q2", "question": "What is the parent class of all classes in Java?", "type": "mcq", "options": ["Class", "Object", "Super", "Base"], "correct_index": 1, "explanation": "All Java classes implicitly extend Object."},
    ],
    "javascript": [
        {"id": "q1", "question": "What does 'typeof null' return?", "type": "output_predict", "options": ["null", "undefined", "object", "number"], "correct_index": 2, "explanation": "This is a well-known JavaScript quirk — typeof null returns 'object'."},
        {"id": "q2", "question": "Which method converts a JSON string to an object?", "type": "mcq", "options": ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "parse()"], "correct_index": 1, "explanation": "JSON.parse() converts a JSON string into a JavaScript object."},
    ],
}


def list_quizzes(db: Session, user_id: UUID | None, language_slug: str | None = None) -> list[Quiz]:
    q = db.query(Quiz).filter(Quiz.is_published.is_(True))
    if language_slug:
        q = q.filter(Quiz.language_slug == language_slug)
    return q.order_by(Quiz.created_at.desc()).all()


def get_or_create_quiz(db: Session, language_slug: str) -> Quiz:
    """Get a quiz for a language, or create one from templates."""
    quiz = db.query(Quiz).filter(
        Quiz.language_slug == language_slug,
        Quiz.is_published.is_(True),
    ).first()
    if quiz:
        return quiz
    template = QUIZ_TEMPLATES.get(language_slug, QUIZ_TEMPLATES["python"])
    quiz = Quiz(
        language_slug=language_slug,
        title=f"{language_slug.title()} Knowledge Check",
        quiz_type="mixed",
        questions=template,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


def submit_quiz(db: Session, user_id: UUID, quiz_id: UUID, answers: list[dict]) -> dict:
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        return {"error": "Quiz not found"}
    questions = quiz.questions if isinstance(quiz.questions, list) else []
    score = 0
    for i, q in enumerate(questions):
        ans = answers[i] if i < len(answers) else {}
        if q.get("type") == "fill_blank":
            if ans.get("answer", "").strip().lower() == q.get("correct_answer", "").strip().lower():
                score += 1
        elif ans.get("selected") == q.get("correct_index"):
            score += 1
    total = len(questions)
    passed = score >= total * 0.7
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        total=total,
        answers=answers,
        passed=passed,
        attempted_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {"score": score, "total": total, "passed": passed, "attempt_id": str(attempt.id)}


def list_attempts(db: Session, user_id: UUID) -> list[QuizAttempt]:
    return db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).order_by(QuizAttempt.attempted_at.desc()).all()
