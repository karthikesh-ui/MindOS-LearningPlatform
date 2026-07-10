from sqlalchemy.orm import Session

from app.models import Bookmark, Language, Note, Problem, Topic


def global_search(db: Session, user_id, query: str) -> list[dict]:
    q = f"%{query.lower()}%"
    results: list[dict] = []

    for lang in db.query(Language).filter(Language.is_published.is_(True)).all():
        if query.lower() in lang.name.lower() or query.lower() in lang.tagline.lower():
            results.append({
                "id": str(lang.id),
                "kind": "language",
                "title": lang.name,
                "subtitle": lang.tagline,
                "language_slug": lang.slug,
                "url": f"/app/learning/{lang.slug}",
            })

    for topic in db.query(Topic).filter(Topic.title.ilike(q)).limit(10).all():
        results.append({
            "id": str(topic.id),
            "kind": "topic",
            "title": topic.title,
            "subtitle": topic.language_slug,
            "language_slug": topic.language_slug,
            "url": f"/app/learning/{topic.language_slug}/topics/{topic.slug}",
        })

    for note in db.query(Note).filter(Note.user_id == user_id, Note.title.ilike(q)).limit(10).all():
        results.append({
            "id": str(note.id),
            "kind": "note",
            "title": note.title,
            "subtitle": note.category,
            "url": "/app/notes",
        })

    for problem in db.query(Problem).filter(Problem.user_id == user_id, Problem.title.ilike(q)).limit(10).all():
        results.append({
            "id": str(problem.id),
            "kind": "problem",
            "title": problem.title,
            "subtitle": problem.difficulty,
            "language_slug": problem.language_slug,
            "url": "/app/problems",
        })

    for bm in db.query(Bookmark).filter(Bookmark.user_id == user_id, Bookmark.title.ilike(q)).limit(10).all():
        results.append({
            "id": str(bm.id),
            "kind": "bookmark",
            "title": bm.title,
            "subtitle": bm.language_name,
            "language_slug": bm.language_slug,
            "url": "/app/dashboard",
        })

    return results[:20]
