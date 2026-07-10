"""Mock Interview service — interview mode with Q&A, self-evaluation, improvement notes."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import MockInterview

INTERVIEW_QUESTIONS = {
    "python": [
        {"id": "q1", "question": "Explain the difference between a list and a tuple in Python. When would you use each?", "difficulty": "Easy", "hints": ["Think about mutability", "Consider performance implications"]},
        {"id": "q2", "question": "How does Python's GIL affect multi-threaded programs? What alternatives exist?", "difficulty": "Medium", "hints": ["Global Interpreter Lock", "Consider multiprocessing"]},
        {"id": "q3", "question": "Write a function to reverse a linked list. Explain your approach.", "difficulty": "Medium", "hints": ["Iterative vs recursive", "Think about pointers"]},
        {"id": "q4", "question": "Explain decorators in Python. Write a simple timing decorator.", "difficulty": "Medium", "hints": ["Functions as first-class objects", "Wrapper pattern"]},
        {"id": "q5", "question": "How would you handle a large CSV file that doesn't fit in memory?", "difficulty": "Hard", "hints": ["Chunking", "Generators", "pandas chunksize"]},
    ],
    "java": [
        {"id": "q1", "question": "Explain the JVM memory model. What are heap and stack?", "difficulty": "Medium", "hints": ["Object allocation", "Method frames"]},
        {"id": "q2", "question": "What is the difference between ArrayList and LinkedList? When to use each?", "difficulty": "Easy", "hints": ["Array vs doubly-linked list", "Random access vs insertion"]},
        {"id": "q3", "question": "Explain how HashMap works internally. What happens during collision?", "difficulty": "Hard", "hints": ["Hash function", "Buckets", "Red-black tree conversion"]},
    ],
    "sql": [
        {"id": "q1", "question": "Explain the difference between WHERE and HAVING clauses.", "difficulty": "Easy", "hints": ["Filtering rows vs groups", "WHERE runs before GROUP BY"]},
        {"id": "q2", "question": "Write a query to find the second highest salary in each department.", "difficulty": "Medium", "hints": ["Window functions", "DENSE_RANK()"]},
        {"id": "q3", "question": "How would you optimize a slow-running query?", "difficulty": "Hard", "hints": ["EXPLAIN ANALYZE", "Index strategy", "Query rewrite"]},
    ],
    "javascript": [
        {"id": "q1", "question": "Explain the event loop in JavaScript. How do microtasks differ from macrotasks?", "difficulty": "Medium", "hints": ["Call stack", "Promise.then vs setTimeout"]},
        {"id": "q2", "question": "What is a closure? Give a practical example.", "difficulty": "Easy", "hints": ["Function + lexical scope", "Data encapsulation"]},
        {"id": "q3", "question": "Explain prototypal inheritance. How does it differ from class-based inheritance?", "difficulty": "Medium", "hints": ["Prototype chain", "Object.create()"]},
    ],
    "dsa": [
        {"id": "q1", "question": "Explain the difference between BFS and DFS. When would you choose one over the other?", "difficulty": "Easy", "hints": ["Queue vs stack", "Shortest path vs deep traversal"]},
        {"id": "q2", "question": "How does a hash table work? Explain collision resolution strategies.", "difficulty": "Medium", "hints": ["Hash function", "Chaining vs open addressing"]},
        {"id": "q3", "question": "Explain dynamic programming. Solve the coin change problem.", "difficulty": "Hard", "hints": ["Overlapping subproblems", "Memoization vs tabulation"]},
    ],
    "system_design": [
        {"id": "q1", "question": "Design a URL shortener like bit.ly. How would you handle scale?", "difficulty": "Medium", "hints": ["Encoding strategy", "Database sharding", "Caching"]},
        {"id": "q2", "question": "Design a rate limiter. What algorithms would you consider?", "difficulty": "Hard", "hints": ["Token bucket", "Sliding window", "Distributed state"]},
        {"id": "q3", "question": "How would you design a notification system that handles millions of users?", "difficulty": "Hard", "hints": ["Message queues", "Fan-out", "Multi-channel delivery"]},
    ],
}


def start_interview(db: Session, user_id: UUID, track: str) -> MockInterview:
    questions = INTERVIEW_QUESTIONS.get(track, INTERVIEW_QUESTIONS["python"])
    interview = MockInterview(
        user_id=user_id,
        track=track,
        status="active",
        questions=questions,
        current_index=0,
        self_evaluations=[],
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


def submit_answer(db: Session, user_id: UUID, session_id: UUID, question_index: int, answer: str, self_rating: int, notes: str | None = None) -> MockInterview | None:
    interview = db.query(MockInterview).filter(MockInterview.id == session_id, MockInterview.user_id == user_id).first()
    if not interview:
        return None
    evals = list(interview.self_evaluations or [])
    evals.append({
        "question_index": question_index,
        "answer": answer,
        "self_rating": self_rating,
        "notes": notes,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    })
    interview.self_evaluations = evals
    interview.current_index = question_index + 1

    # Check if interview is complete
    questions = interview.questions if isinstance(interview.questions, list) else []
    if interview.current_index >= len(questions):
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        avg_rating = sum(e.get("self_rating", 3) for e in evals) / max(len(evals), 1)
        interview.overall_score = int(avg_rating * 20)  # Convert 1-5 to 0-100
    db.commit()
    db.refresh(interview)
    return interview


def list_interviews(db: Session, user_id: UUID) -> list[MockInterview]:
    return db.query(MockInterview).filter(MockInterview.user_id == user_id).order_by(MockInterview.started_at.desc()).all()


def get_interview(db: Session, user_id: UUID, session_id: UUID) -> MockInterview | None:
    return db.query(MockInterview).filter(MockInterview.id == session_id, MockInterview.user_id == user_id).first()
