import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Braces,
  BrainCircuit,
  Coffee,
  Code2,
  Compass,
  Cpu,
  Database,
  FileCode2,
  Network,
  Sparkles,
  TerminalSquare,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '@/services/api';
import { useAsync } from '@/hooks';
import type { Difficulty, LearningHubData } from '@/types';
import { Badge, Button, Card, EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { cx, formatHours } from '@/utils';

const ICONS: Record<string, LucideIcon> = {
  Code2,
  Database,
  Coffee,
  Cpu,
  Braces,
  FileCode2,
  Sparkles,
  TerminalSquare,
  Network,
};

const difficultyTone: Record<Difficulty, 'accent' | 'warning' | 'error'> = {
  Beginner: 'accent',
  Intermediate: 'warning',
  Advanced: 'error',
};

type Filter = 'All' | Difficulty;

export default function LearningHubPage() {
  const { data, loading, error, refetch } = useAsync<LearningHubData>(() => api.learning.hub(), []);
  const [filter, setFilter] = useState<Filter>('All');

  const languages = data?.languages ?? [];
  const filtered = filter === 'All' ? languages : languages.filter((l) => l.difficulty === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Learning Hub</h1>
          <p className="mt-1 text-sm text-ink-500">
            {languages.length} tracks · curated for AI-era engineering careers
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-surface-border bg-surface p-1">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cx(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <HubSkeleton />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Unable to load tracks.'} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-8 w-8" />}
          title="No tracks match this filter"
          description="Try a different difficulty level."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lang, i) => {
            const Icon = ICONS[lang.icon] ?? BookOpen;
            const progress = lang.progress;
            return (
              <Card
                key={lang.id}
                hover
                className="flex flex-col p-6 animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-card text-ink-700">
                    <Icon className="h-6 w-6" />
                  </span>
                  <Badge tone={difficultyTone[lang.difficulty]}>{lang.difficulty}</Badge>
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{lang.name}</h3>
                <p className="mt-0.5 text-xs font-medium text-brand-600">{lang.tagline}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
                  {lang.description}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Meta label="Modules" value={String(lang.modulesCount)} />
                  <Meta label="Time" value={formatHours(lang.estimatedHours)} />
                  <Meta label="Progress" value={`${progress?.percent ?? 0}%`} />
                </div>

                {progress && progress.percent > 0 ? (
                  <ProgressBar value={progress.percent} tone="brand" size="sm" className="mt-4" />
                ) : (
                  <div className="mt-4 h-1.5 rounded-full bg-surface-card" />
                )}

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-ink-400">
                    {progress?.completedModules ?? 0}/{lang.modulesCount} done
                  </span>
                  <Link
                    to={`/app/learning/${lang.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    {progress && progress.percent > 0 ? 'Continue' : 'Start'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-dashed bg-surface-subtle">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-card text-ink-500">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">More tracks coming</p>
            <p className="text-xs text-ink-400">
              The Hub is an extension point — additional languages and AI modules will land in later
              releases.
            </p>
          </div>
          <Button variant="ghost" size="sm">Roadmap</Button>
        </div>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-subtle px-2 py-2">
      <p className="text-sm font-semibold text-ink-900">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

function HubSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-72 rounded-2xl" />
      ))}
    </div>
  );
}
