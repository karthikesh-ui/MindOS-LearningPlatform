import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Circle, Clock, FileText, ListChecks, Target,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '@/services/api';
import { useAsync } from '@/hooks';
import type { TopicPageData } from '@/types';
import { Badge, Button, Card, CardHeader, CodeEditor, ErrorState, Skeleton } from '@/components/ui';
import { cx, formatMinutes } from '@/utils';

export default function TopicPage() {
  const { slug = '', topicId = '' } = useParams<{ slug: string; topicId: string }>();
  const navigate = useNavigate();
  const { data: topic, loading, error, refetch } = useAsync<TopicPageData>(
    () => api.topics.get(slug, topicId),
    [slug, topicId],
  );
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (loading) return <Skeleton className="h-[40rem] rounded-2xl" />;
  if (error || !topic) {
    return <div className="py-10"><ErrorState message={error ?? 'Topic not found.'} onRetry={refetch} /></div>;
  }

  const isDone = completed || topic.isCompleted;
  const isMarked = bookmarked || topic.isBookmarked;

  async function handleComplete() {
    const r = await api.topics.complete(slug, topicId);
    if (r.ok) setCompleted(true);
  }
  async function handleBookmark() {
    const r = await api.topics.toggleBookmark(slug, topicId);
    if (r.ok) setBookmarked((b) => !b);
  }
  async function saveNote() {
    if (!noteText.trim()) return;
    await api.notes.create({ title: `Note: ${topic!.title}`, body: noteText, category: 'concept', languageSlug: slug, topicId });
    setNoteText('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/app/learning/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> {topic.languageName}
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Bookmark className={cx('h-3.5 w-3.5', isMarked && 'fill-brand-500 text-brand-500')} />} onClick={handleBookmark}>
            {isMarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button size="sm" leftIcon={isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />} onClick={handleComplete} disabled={isDone}>
            {isDone ? 'Completed' : 'Mark complete'}
          </Button>
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Badge tone="brand">{topic.stage}</Badge>
          <Badge tone={topic.difficulty === 'Beginner' ? 'accent' : topic.difficulty === 'Advanced' ? 'error' : 'warning'}>{topic.difficulty}</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-400"><Clock className="h-3.5 w-3.5" /> {formatMinutes(topic.estimatedMinutes)}</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">{topic.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">{topic.description}</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Learning objectives" subtitle="What you'll be able to do" icon={<Target className="h-4 w-4" />} />
          <ul className="mt-4 space-y-2">
            {topic.objectives.map((o, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink-700">
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> {o}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Prerequisites" subtitle="Recommended before starting" icon={<CheckCircle2 className="h-4 w-4" />} />
          <ul className="mt-4 space-y-2">
            {topic.prerequisites.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink-700">
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" /> {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {topic.examples.length > 0 && (
        <Card>
          <CardHeader title="Examples" subtitle="Worked code samples" icon={<FileText className="h-4 w-4" />} />
          <div className="mt-4 space-y-4">
            {topic.examples.map((ex, i) => (
              <div key={i}>
                <p className="mb-2 text-xs font-semibold text-ink-500">{ex.title}</p>
                <CodeEditor initialCode={ex.code} initialLanguage={(ex.language as 'python') ?? 'python'} readOnly />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Notes" subtitle="Capture your understanding" icon={<FileText className="h-4 w-4" />} />
        <div className="mt-4 space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write a note in markdown… (auto-saved on submit)"
            className="input min-h-32 font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setNoteText('')}>Clear</Button>
            <Button size="sm" onClick={saveNote} disabled={!noteText.trim()}>Save note</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="References" subtitle="Go deeper" icon={<FileText className="h-4 w-4" />} />
        <ul className="mt-4 space-y-2">
          {topic.references.map((r, i) => (
            <li key={i}>
              <a href={r.url} className="text-sm text-brand-600 hover:text-brand-700 hover:underline">{r.title}</a>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-subtle px-5 py-3">
        <button
          disabled={!topic.prevTopicId}
          onClick={() => topic.prevTopicId && navigate(`/app/learning/${slug}/topics/${topic.prevTopicId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-xs text-ink-400">{topic.languageName}</span>
        <button
          disabled={!topic.nextTopicId}
          onClick={() => topic.nextTopicId && navigate(`/app/learning/${slug}/topics/${topic.nextTopicId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 disabled:opacity-40"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
