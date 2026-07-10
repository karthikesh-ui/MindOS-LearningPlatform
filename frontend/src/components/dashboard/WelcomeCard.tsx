import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import type { DashboardData } from '@/types';
import { Avatar, Button, Card, ProgressBar } from '@/components/ui';
import { cx, formatMinutes } from '@/utils';

interface Props {
  data: DashboardData;
}

export function WelcomeCard({ data }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = data.user.name.split(' ')[0];
  const xpToNext = data.xp.nextLevelXp - data.xp.currentLevelXp;

  return (
    <Card className="relative overflow-hidden p-6 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-50 opacity-70 blur-2xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={data.user.name} src={data.user.avatarUrl} size="lg" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{greeting}</p>
            <h2 className="mt-0.5 font-display text-2xl font-semibold text-ink-900">
              {firstName}
            </h2>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              You're on a {data.streak.current}-day streak. Keep the momentum going — {xpToNext} XP
              to Level {data.xp.level + 1}.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-surface-border bg-surface-subtle px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-400">
              <Zap className="h-3.5 w-3.5 text-brand-500" /> Total XP
            </div>
            <p className="mt-1 font-display text-lg font-semibold text-ink-900">
              {data.xp.total.toLocaleString()}
            </p>
          </div>
          <Link to="/app/learning" className="btn-primary">
            Continue learning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative mt-6 border-t border-surface-border pt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink-500">Level {data.xp.level} progress</span>
          <span className="text-ink-400">
            {data.xp.currentLevelXp} / {data.xp.nextLevelXp} XP
          </span>
        </div>
        <ProgressBar
          value={data.xp.currentLevelXp}
          max={data.xp.nextLevelXp}
          tone="brand"
          size="md"
          className="mt-2"
        />
      </div>

      <div className={cx('mt-4 flex items-center gap-2 rounded-xl bg-accent-50 px-4 py-2.5 text-xs text-accent-700')}>
        <Sparkles className="h-3.5 w-3.5" />
        <span>AI Assistant coming soon — your study companion is being prepared.</span>
      </div>
    </Card>
  );
}

export function TodaysPlanCard({ data }: Props) {
  const items = data.todaysPlan;
  const remaining = items.filter((i) => !i.done).reduce((s, i) => s + i.durationMinutes, 0);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Today's plan</h3>
          <p className="mt-0.5 text-xs text-ink-400">
            {items.length} tasks · {formatMinutes(remaining)} remaining
          </p>
        </div>
        <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
          Plan
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 transition-colors hover:bg-surface-card"
          >
            <span
              className={cx(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold',
                item.done
                  ? 'border-accent-500 bg-accent-500 text-white'
                  : 'border-ink-200 text-transparent group-hover:border-ink-300',
              )}
            >
              ✓
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cx(
                  'truncate text-sm font-medium',
                  item.done ? 'text-ink-400 line-through' : 'text-ink-800',
                )}
              >
                {item.title}
              </p>
              <p className="truncate text-xs text-ink-400">
                {item.languageName} · {formatMinutes(item.durationMinutes)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function TomorrowPreviewCard({ data }: Props) {
  const items = data.tomorrowPreview;
  const total = items.reduce((s, i) => s + i.durationMinutes, 0);
  return (
    <Card>
      <h3 className="text-sm font-semibold text-ink-900">Tomorrow</h3>
      <p className="mt-0.5 text-xs text-ink-400">{items.length} planned · {formatMinutes(total)}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
            <p className="flex-1 truncate text-sm text-ink-700">{item.title}</p>
            <span className="text-xs text-ink-400">{formatMinutes(item.durationMinutes)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
