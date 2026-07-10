import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import type { DashboardData, Language, Progress as ProgressType } from '@/types';
import { Card, CardHeader, ProgressBar, EmptyState } from '@/components/ui';
import { formatRelativeTime, formatHours } from '@/utils';

interface Props {
  data: DashboardData;
}

function languageById(languages: Language[], id: string) {
  return languages.find((l) => l.id === id);
}

export function ContinueLearningCard({ data }: Props) {
  const items = data.continueLearning;
  return (
    <Card>
      <CardHeader
        title="Continue learning"
        subtitle="Pick up where you left off"
        icon={<BookOpen className="h-4 w-4" />}
        action={
          <Link to="/app/learning" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No tracks in progress"
          description="Start a language from the Learning Hub to see it here."
        />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((p: ProgressType) => {
            const lang = languageById(data.languages, p.languageId);
            return (
              <Link
                key={p.languageId}
                to="/app/learning"
                className="group rounded-xl border border-surface-border bg-surface-subtle p-4 transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-500">{lang?.name ?? 'Track'}</span>
                  <span className="text-xs font-medium text-ink-400">{p.percent}%</span>
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium text-ink-900">
                  {p.nextModuleTitle ?? 'Next module'}
                </p>
                <ProgressBar value={p.percent} tone="brand" size="sm" className="mt-3" />
                <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.lastStudiedAt ? formatRelativeTime(p.lastStudiedAt) : 'Not started'}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Resume <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function ProgressOverviewCard({ data }: Props) {
  const items = data.continueLearning;
  const avg =
    items.length === 0 ? 0 : Math.round(items.reduce((s, i) => s + i.percent, 0) / items.length);
  const completedModules = items.reduce((s, i) => s + i.completedModules, 0);
  return (
    <Card>
      <CardHeader title="Progress overview" subtitle="Across all active tracks" icon={<BookOpen className="h-4 w-4" />} />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Tracks" value={String(items.length)} />
        <Stat label="Modules" value={String(completedModules)} />
        <Stat label="Avg %" value={`${avg}%`} />
      </div>
      <div className="mt-4 space-y-3">
        {items.map((p) => {
          const lang = languageById(data.languages, p.languageId);
          return (
            <div key={p.languageId}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-600">{lang?.name ?? p.languageId}</span>
                <span className="text-ink-400">
                  {p.completedModules}/{p.totalModules} · {formatHours(lang?.estimatedHours ?? 0)}
                </span>
              </div>
              <ProgressBar value={p.percent} size="sm" className="mt-1.5" tone="accent" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 text-center">
      <p className="font-display text-lg font-semibold text-ink-900">{value}</p>
      <p className="mt-0.5 text-xs text-ink-400">{label}</p>
    </div>
  );
}
