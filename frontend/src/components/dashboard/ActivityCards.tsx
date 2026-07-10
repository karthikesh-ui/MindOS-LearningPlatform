import { Activity, Bookmark, CheckCircle2, Flag, Rocket, Sparkles } from 'lucide-react';
import type { ActivityItem, Bookmark as BookmarkType, DashboardData } from '@/types';
import { Card, CardHeader, EmptyState, ProgressBar } from '@/components/ui';
import { formatRelativeTime } from '@/utils';

interface Props {
  data: DashboardData;
}

const kindIcon = {
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-accent-600" />,
  started: <Rocket className="h-3.5 w-3.5 text-brand-600" />,
  bookmark: <Bookmark className="h-3.5 w-3.5 text-warning-600" />,
  milestone: <Flag className="h-3.5 w-3.5 text-brand-600" />,
};

export function RecentActivityCard({ data }: Props) {
  const items = data.recentActivity;
  return (
    <Card>
      <CardHeader title="Recent activity" subtitle="Your latest moves" icon={<Activity className="h-4 w-4" />} />
      {items.length === 0 ? (
        <EmptyState icon={<Activity className="h-7 w-7" />} title="No activity yet" />
      ) : (
        <ol className="mt-4 space-y-3">
          {items.map((item: ActivityItem) => (
            <li key={item.id} className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-card">
                {kindIcon[item.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800">{item.title}</p>
                <p className="truncate text-xs text-ink-400">
                  {item.detail} · {formatRelativeTime(item.occurredAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function BookmarksPreviewCard({ data }: Props) {
  const items = data.bookmarks.slice(0, 4);
  return (
    <Card>
      <CardHeader
        title="Bookmarks"
        subtitle="Saved for later"
        icon={<Bookmark className="h-4 w-4" />}
      />
      {items.length === 0 ? (
        <EmptyState icon={<Bookmark className="h-7 w-7" />} title="No bookmarks yet" />
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((b: BookmarkType) => (
            <li
              key={b.id}
              className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 transition-colors hover:bg-surface-card"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warning-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800">{b.title}</p>
                <p className="truncate text-xs text-ink-400">{b.languageName}</p>
              </div>
              <span className="rounded-md bg-surface-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-400">
                {b.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function WeeklyGoalCard({ data }: Props) {
  const { completedMinutes, targetMinutes } = data.weeklyGoal;
  const pct = Math.round((completedMinutes / targetMinutes) * 100);
  return (
    <Card>
      <CardHeader title="Weekly goal" subtitle="Focused study time" icon={<Flag className="h-4 w-4" />} />
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-display text-3xl font-semibold text-ink-900">{completedMinutes}</p>
          <p className="text-xs text-ink-400">of {targetMinutes} minutes</p>
        </div>
        <span
          className={`chip ${
            pct >= 100 ? 'bg-accent-50 text-accent-700' : 'bg-brand-50 text-brand-700'
          }`}
        >
          {pct >= 100 ? 'Goal reached' : `${pct}% there`}
        </span>
      </div>
      <ProgressBar value={completedMinutes} max={targetMinutes} tone="accent" className="mt-4" />
      <p className="mt-3 text-xs text-ink-400">
        {targetMinutes - completedMinutes > 0
          ? `${targetMinutes - completedMinutes} min to go — pace looks healthy.`
          : 'Excellent work this week. Set a higher goal in Settings.'}
      </p>
    </Card>
  );
}

export function StreakCard({ data }: Props) {
  const { current, longest, thisWeek } = data.streak;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <Card>
      <CardHeader title="Learning streak" subtitle="Consistency wins" icon={<Activity className="h-4 w-4" />} />
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-display text-3xl font-semibold text-ink-900">{current}</p>
          <p className="text-xs text-ink-400">day streak · best {longest}</p>
        </div>
        <div className="flex gap-1.5">
          {thisWeek.map((on, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                  on ? 'bg-accent-500 text-white' : 'bg-surface-card text-ink-300'
                }`}
              >
                {days[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function XPCounterCard({ data }: Props) {
  const { total, level, currentLevelXp, nextLevelXp, weeklyGain } = data.xp;
  return (
    <Card>
      <CardHeader title="XP counter" subtitle={`Level ${level}`} icon={<Sparkles className="h-4 w-4" />} />
      <div className="mt-4 flex items-end justify-between">
        <p className="font-display text-3xl font-semibold text-ink-900">{total.toLocaleString()}</p>
        <span className="chip bg-brand-50 text-brand-700">+{weeklyGain} this week</span>
      </div>
      <ProgressBar value={currentLevelXp} max={nextLevelXp} tone="brand" className="mt-4" />
      <p className="mt-3 text-xs text-ink-400">
        {nextLevelXp - currentLevelXp} XP to Level {level + 1}
      </p>
    </Card>
  );
}
