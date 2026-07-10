import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, FileText, Pin } from 'lucide-react';
import type { DashboardData } from '@/types';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { cx, formatRelativeTime } from '@/utils';

interface Props {
  data: DashboardData;
}

export function RecentNotesCard({ data }: Props) {
  const notes = data.recentNotes ?? [];
  return (
    <Card>
      <CardHeader
        title="Recent notes"
        subtitle="Your latest captures"
        icon={<FileText className="h-4 w-4" />}
        action={
          <Link to="/app/notes" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            All notes
          </Link>
        }
      />
      {notes.length === 0 ? (
        <EmptyState icon={<FileText className="h-7 w-7" />} title="No notes yet" description="Create notes from any topic page." />
      ) : (
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Link
                to="/app/notes"
                className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 transition-colors hover:bg-surface-card"
              >
                {n.pinned && <Pin className="h-3 w-3 shrink-0 text-brand-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800">{n.title}</p>
                  <p className="truncate text-xs text-ink-400">{n.category} · {formatRelativeTime(n.updatedAt)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const stageTone: Record<string, string> = {
  Beginner: 'text-accent-600',
  Intermediate: 'text-brand-600',
  Advanced: 'text-error-600',
  'Interview Preparation': 'text-ink-600',
  Projects: 'text-warning-600',
  Resources: 'text-ink-500',
};

export function UpcomingTopicsCard({ data }: Props) {
  const topics = data.upcomingTopics ?? [];
  return (
    <Card>
      <CardHeader
        title="Upcoming topics"
        subtitle="Your next steps"
        icon={<CalendarClock className="h-4 w-4" />}
      />
      {topics.length === 0 ? (
        <EmptyState icon={<CalendarClock className="h-7 w-7" />} title="All caught up" description="Start a track to see what's next." />
      ) : (
        <ul className="mt-4 space-y-2">
          {topics.map((t) => (
            <li key={t.id}>
              <Link
                to={`/app/learning/${t.languageSlug}/topics/${t.id}`}
                className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card"
              >
                <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-card text-xs font-bold', stageTone[t.stage] ?? 'text-ink-500')}>
                  {t.languageName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{t.title}</p>
                  <p className="truncate text-xs text-ink-400">{t.languageName} · {t.stage}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function QuickResumeCard({ data }: Props) {
  const items = data.continueLearning.slice(0, 3);
  return (
    <Card>
      <CardHeader title="Quick resume" subtitle="Jump back into a track" icon={<ArrowRight className="h-4 w-4" />} />
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {items.map((p) => {
          const lang = data.languages.find((l) => l.id === p.languageId);
          return (
            <Link
              key={p.languageId}
              to={lang ? `/app/learning/${lang.slug}` : '/app/learning'}
              className="group rounded-xl border border-surface-border bg-surface-subtle p-3 transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card"
            >
              <p className="truncate text-xs font-semibold text-ink-500">{lang?.name ?? 'Track'}</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink-900">{p.percent}%</p>
              <p className="mt-0.5 truncate text-xs text-ink-400">{p.completedModules}/{p.totalModules} modules</p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
