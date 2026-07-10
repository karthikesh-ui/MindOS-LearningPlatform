import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Layers, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/services/api';
import { useAsync } from '@/hooks';
import type { Language, Roadmap } from '@/types';
import { SEED_LANGUAGES } from '@/services/seed';
import { roadmapBySlug } from '@/services/roadmaps';
import { Badge, Button, Card, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { RoadmapView } from '@/components/learning/RoadmapView';
import { cx, formatHours } from '@/utils';

const ICONS: Record<string, LucideIcon> = {
  Code2: BookOpen, Database: BookOpen, Coffee: BookOpen, Cpu: BookOpen,
  Braces: BookOpen, FileCode2: BookOpen, Sparkles: BookOpen, TerminalSquare: BookOpen, Network: BookOpen,
};

type Tab = 'overview' | 'roadmap' | 'topics';

export default function LanguageDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const language: Language | undefined = SEED_LANGUAGES.find((l) => l.slug === slug);
  const { data: roadmap, loading, error, refetch } = useAsync<Roadmap>(
    () => api.roadmaps.get(slug),
    [slug],
  );

  if (!language) {
    return (
      <div className="py-10">
        <ErrorState message="Language not found." onRetry={() => navigate('/app/learning')} />
      </div>
    );
  }

  const Icon = ICONS[language.icon] ?? BookOpen;
  const rm = roadmap ?? roadmapBySlug(slug);

  return (
    <div className="space-y-6">
      <Link to="/app/learning" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Learning Hub
      </Link>

      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-50 opacity-60 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-card text-ink-700">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">{language.name}</h1>
              <p className="mt-0.5 text-sm font-medium text-brand-600">{language.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
                <Badge tone={language.difficulty === 'Beginner' ? 'accent' : language.difficulty === 'Advanced' ? 'error' : 'warning'}>
                  {language.difficulty}
                </Badge>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatHours(language.estimatedHours)}</span>
                <span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {language.modulesCount} modules</span>
              </div>
            </div>
          </div>
          {rm && (
            <div className="text-center">
              <p className="font-display text-3xl font-semibold text-ink-900">{rm.overallPercent}%</p>
              <p className="text-xs text-ink-400">complete</p>
            </div>
          )}
        </div>
        {rm && <ProgressBar value={rm.overallPercent} tone="brand" className="relative mt-5" />}
      </Card>

      <div className="flex gap-1.5 rounded-xl border border-surface-border bg-surface p-1">
        {(['overview', 'roadmap', 'topics'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              tab === t ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="font-display text-base font-semibold text-ink-900">Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{language.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat label="Modules" value={String(language.modulesCount)} />
              <MiniStat label="Est. time" value={formatHours(language.estimatedHours)} />
              <MiniStat label="Difficulty" value={language.difficulty} />
            </div>
            <Button className="mt-5" onClick={() => setTab('roadmap')} rightIcon={<ArrowLeft className="h-4 w-4 rotate-180" />}>
              View roadmap
            </Button>
          </Card>
          <Card>
            <h2 className="font-display text-base font-semibold text-ink-900">Learning journey</h2>
            <ul className="mt-4 space-y-3">
              {['Beginner', 'Intermediate', 'Advanced', 'Interview Preparation', 'Projects', 'Resources'].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={cx('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold', i < 2 ? 'bg-accent-500 text-white' : 'bg-surface-card text-ink-400')}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink-700">{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'roadmap' && (
        loading ? <Skeleton className="h-96 rounded-2xl" /> :
        error || !rm ? <ErrorState message={error ?? 'Roadmap unavailable.'} onRetry={refetch} /> :
        <RoadmapView roadmap={rm} languageSlug={slug} />
      )}

      {tab === 'topics' && (
        loading ? <Skeleton className="h-96 rounded-2xl" /> :
        error || !rm ? <ErrorState message={error ?? 'Topics unavailable.'} onRetry={refetch} /> :
        <div className="space-y-3">
          {rm.stages.flatMap((s) => s.topics).map((t) => (
            <Link
              key={t.id}
              to={`/app/learning/${slug}/topics/${t.id}`}
              className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card"
            >
              <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold', t.completed ? 'bg-accent-500 text-white' : 'bg-surface-card text-ink-400')}>
                {t.completed ? '✓' : ''}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{t.title}</p>
                <p className="truncate text-xs text-ink-400">{t.difficulty} · {t.estimatedMinutes}m</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-subtle px-3 py-3 text-center">
      <p className="font-display text-base font-semibold text-ink-900">{value}</p>
      <p className="mt-0.5 text-xs text-ink-400">{label}</p>
    </div>
  );
}
