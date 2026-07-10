from sqlalchemy.orm import Session

from app.models import Achievement, Language
from app.database.session import SessionLocal

LANGUAGES = [
    dict(slug="python", name="Python", tagline="The lingua franca of AI & ML",
         description="Master Python from foundations to data manipulation with NumPy and Pandas — the backbone of every modern AI workflow.",
         difficulty="Beginner", estimated_hours=28, icon="Code2", accent="brand", modules_count=12),
    dict(slug="sql", name="SQL", tagline="Speak fluently with databases",
         description="Query, join, and optimize relational data. Essential for analytics, backend engineering, and feature engineering at scale.",
         difficulty="Beginner", estimated_hours=18, icon="Database", accent="accent", modules_count=8),
    dict(slug="java", name="Java", tagline="Enterprise-grade engineering",
         description="Build robust, type-safe systems with Java. From OOP fundamentals to concurrency.",
         difficulty="Intermediate", estimated_hours=34, icon="Coffee", accent="warning", modules_count=14),
    dict(slug="cpp", name="C++", tagline="Performance at the metal",
         description="Memory, pointers, and systems programming. The foundation for ML infrastructure and high-performance computing.",
         difficulty="Advanced", estimated_hours=40, icon="Cpu", accent="error", modules_count=16),
    dict(slug="javascript", name="JavaScript", tagline="The language of the web",
         description="Build interactive applications end-to-end. Core to frontend engineering and full-stack AI product development.",
         difficulty="Beginner", estimated_hours=24, icon="Braces", accent="warning", modules_count=11),
    dict(slug="typescript", name="TypeScript", tagline="JavaScript with safety rails",
         description="Add static typing to JavaScript. The industry standard for scalable web apps and modern AI tooling.",
         difficulty="Intermediate", estimated_hours=22, icon="FileCode2", accent="brand", modules_count=10),
    dict(slug="prompt-engineering", name="Prompt Engineering", tagline="Steer large language models",
         description="Craft prompts that reliably elicit high-quality output from LLMs. Few-shot, chain-of-thought, RAG, and structured generation.",
         difficulty="Beginner", estimated_hours=16, icon="Sparkles", accent="accent", modules_count=9),
    dict(slug="bash", name="Bash", tagline="Automate the command line",
         description="Shell scripting, pipelines, and automation. The everyday toolkit of every engineer.",
         difficulty="Beginner", estimated_hours=12, icon="TerminalSquare", accent="ink", modules_count=7),
    dict(slug="system-design", name="System Design", tagline="Architect at scale",
         description="Design scalable, resilient systems. Caching, sharding, queues, and the trade-offs senior engineers articulate.",
         difficulty="Advanced", estimated_hours=30, icon="Network", accent="brand", modules_count=13),
]

ACHIEVEMENTS = [
    dict(code="first_steps", title="First Steps", description="Complete your first module", icon="Footprints", xp_reward=100),
    dict(code="week_warrior", title="Week Warrior", description="Maintain a 7-day streak", icon="Flame", xp_reward=200),
    dict(code="curious_mind", title="Curious Mind", description="Start 3 different tracks", icon="Compass", xp_reward=150),
    dict(code="polyglot", title="Polyglot", description="Reach 50% in 4 languages", icon="Languages", xp_reward=300),
    dict(code="deep_diver", title="Deep Diver", description="Complete an Advanced track", icon="Anchor", xp_reward=400),
    dict(code="night_owl", title="Night Owl", description="Study after 10pm, 5 times", icon="Moon", xp_reward=120),
]


def seed_reference_data(db: Session) -> None:
    for lang in LANGUAGES:
        existing = db.query(Language).filter(Language.slug == lang["slug"]).first()
        if existing:
            for k, v in lang.items():
                setattr(existing, k, v)
        else:
            db.add(Language(**lang))
    for ach in ACHIEVEMENTS:
        existing = db.query(Achievement).filter(Achievement.code == ach["code"]).first()
        if existing:
            for k, v in ach.items():
                setattr(existing, k, v)
        else:
            db.add(Achievement(**ach))
    db.commit()


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_reference_data(db)
    finally:
        db.close()
