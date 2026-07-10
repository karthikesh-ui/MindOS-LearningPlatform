"""Gamification service — XP awards, level computation, achievement checks."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Achievement, UserAchievement, XpEvent

XP_PER_LEVEL = 700

ACHIEVEMENT_RULES = [
    {"code": "centurion", "title": "100 Study Hours", "desc": "Accumulate 100 hours of study time", "xp": 500, "check": lambda ctx: ctx["total_minutes"] >= 6000},
    {"code": "problem_master", "title": "50 Problems Solved", "desc": "Solve 50 coding problems", "xp": 400, "check": lambda ctx: ctx["problems_solved"] >= 50},
    {"code": "week_warrior", "title": "7 Day Consistency", "desc": "Maintain a 7-day streak", "xp": 200, "check": lambda ctx: ctx["streak"] >= 7},
    {"code": "python_basics", "title": "Python Basics Completed", "desc": "Complete the Python Beginner track", "xp": 300, "check": lambda ctx: ctx.get("python_beginner", False)},
    {"code": "sql_ready", "title": "SQL Ready", "desc": "Reach 80% in SQL", "xp": 300, "check": lambda ctx: ctx.get("sql_ready", False)},
    {"code": "interview_ready", "title": "Interview Ready", "desc": "Complete a mock interview", "xp": 350, "check": lambda ctx: ctx.get("interview_ready", False)},
]


def award_xp(db: Session, user_id: UUID, amount: int, reason: str) -> XpEvent:
    event = XpEvent(user_id=user_id, amount=amount, reason=reason)
    db.add(event)
    db.flush()
    return event


def get_level(total_xp: int) -> int:
    return max(1, total_xp // XP_PER_LEVEL + 1)


def get_xp_summary(db: Session, user_id: UUID) -> dict:
    events = db.query(XpEvent).filter(XpEvent.user_id == user_id).all()
    total = sum(e.amount for e in events)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly = sum(e.amount for e in events if e.created_at and e.created_at >= week_ago)
    return {
        "total": total,
        "level": get_level(total),
        "current_level_xp": total % XP_PER_LEVEL,
        "next_level_xp": XP_PER_LEVEL,
        "weekly_gain": weekly,
    }


def check_achievements(db: Session, user_id: UUID) -> list[dict]:
    """Check all achievement rules and unlock any newly-earned ones."""
    from app.models import LearningSessionRecord, Problem
    from app.services.learning_service import get_streak

    total_minutes = sum(
        s.duration_minutes for s in db.query(LearningSessionRecord).filter(LearningSessionRecord.user_id == user_id).all()
    )
    problems_solved = db.query(Problem).filter(Problem.user_id == user_id, Problem.status == "solved").count()
    streak = get_streak(db, user_id)
    streak_count = streak.current if streak else 0

    ctx = {
        "total_minutes": total_minutes,
        "problems_solved": problems_solved,
        "streak": streak_count,
        "python_beginner": False,
        "sql_ready": False,
        "interview_ready": False,
    }

    unlocked = []
    existing_codes = {
        ua.achievement.code if ua.achievement else None
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    }

    for rule in ACHIEVEMENT_RULES:
        if rule["code"] in existing_codes:
            continue
        if rule["check"](ctx):
            ach = db.query(Achievement).filter(Achievement.code == rule["code"]).first()
            if not ach:
                ach = Achievement(code=rule["code"], title=rule["title"], description=rule["desc"], icon="Award", xp_reward=rule["xp"])
                db.add(ach)
                db.flush()
            ua = UserAchievement(user_id=user_id, achievement_id=ach.id, progress=100, unlocked_at=datetime.now(timezone.utc))
            db.add(ua)
            award_xp(db, user_id, rule["xp"], f"achievement: {rule['title']}")
            unlocked.append({"code": rule["code"], "title": rule["title"], "description": rule["desc"], "xp": rule["xp"]})
    db.flush()
    return unlocked


def get_gamification_overview(db: Session, user_id: UUID) -> dict:
    xp = get_xp_summary(db, user_id)
    from app.services.learning_service import get_streak
    streak = get_streak(db, user_id)
    from app.models import Problem, LearningSessionRecord
    problems_solved = db.query(Problem).filter(Problem.user_id == user_id, Problem.status == "solved").count()
    total_minutes = sum(s.duration_minutes for s in db.query(LearningSessionRecord).filter(LearningSessionRecord.user_id == user_id).all())

    week_start = datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())
    week_minutes = sum(
        s.duration_minutes for s in db.query(LearningSessionRecord)
        .filter(LearningSessionRecord.user_id == user_id, LearningSessionRecord.started_at >= week_start).all()
    )

    return {
        "xp": xp,
        "level": xp["level"],
        "streak": {
            "current": streak.current if streak else 0,
            "longest": streak.longest if streak else 0,
        },
        "weekly_challenge": {
            "label": "Study 5 hours this week",
            "current": week_minutes,
            "target": 300,
            "percent": min(100, int(week_minutes / 300 * 100)) if week_minutes else 0,
        },
        "monthly_challenge": {
            "label": "Solve 20 problems",
            "current": problems_solved,
            "target": 20,
            "percent": min(100, int(problems_solved / 20 * 100)) if problems_solved else 0,
        },
        "milestones": [
            {"label": "100 study hours", "current": total_minutes // 60, "target": 100},
            {"label": "50 problems solved", "current": problems_solved, "target": 50},
            {"label": "7 day streak", "current": streak.current if streak else 0, "target": 7},
        ],
        "recent_achievements": [
            {"code": ua.achievement.code, "title": ua.achievement.title, "xp": ua.achievement.xp_reward}
            for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).order_by(UserAchievement.unlocked_at.desc()).limit(5).all()
            if ua.achievement
        ],
    }
