import { CalendarCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { RevisionSchedule as Schedule } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Button, Card, CardHeader, EmptyState } from '@/components/ui';
import { cx } from '@/utils';

export function RevisionScheduleCard({ schedule, onComplete }: { schedule: Schedule | null; onComplete?: () => void }) {
  if (!schedule) return null;
  const all = [...schedule.overdue, ...schedule.today, ...schedule.upcoming];
  const overdueCount = schedule.overdue.length;
  const todayCount = schedule.today.length;

  return (
    <Card>
      <CardHeader
        title="Revision Schedule"
        subtitle={`${todayCount} due today${overdueCount ? ` · ${overdueCount} overdue` : ''}`}
        icon={<CalendarCheck className="h-4 w-4" />}
      />
      {all.length === 0 ? (
        <EmptyState icon={<CalendarCheck className="h-7 w-7" />} title="No revisions scheduled" description="Complete topics to generate revision schedules." />
      ) : (
        <div className="mt-4 space-y-3">
          {overdueCount > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-error-600">Overdue</p>
              <RevisionGroup items={schedule.overdue} tone="error" onComplete={onComplete} />
            </div>
          )}
          {todayCount > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-600">Today</p>
              <RevisionGroup items={schedule.today} tone="brand" onComplete={onComplete} />
            </div>
          )}
          {schedule.upcoming.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">Upcoming</p>
              <RevisionGroup items={schedule.upcoming} tone="neutral" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function RevisionGroup({ items, tone, onComplete }: { items: Schedule['today']; tone: 'error' | 'brand' | 'neutral'; onComplete?: () => void }) {
  async function complete(id: string) { await engineApi.completeRevision(id); onComplete?.(); }
  const icon = tone === 'error' ? <AlertCircle className="h-3.5 w-3.5" /> : tone === 'brand' ? <Clock className="h-3.5 w-3.5" /> : <CalendarCheck className="h-3.5 w-3.5" />;

  return (
    <ul className="space-y-1.5">
      {items.map((rev) => (
        <li key={rev.id} className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2">
          <span className={cx(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            tone === 'error' ? 'bg-error-500/10 text-error-600' : tone === 'brand' ? 'bg-brand-50 text-brand-600' : 'bg-surface-card text-ink-400',
          )}>{icon}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-800">{rev.title}</p>
            <p className="truncate text-xs text-ink-400">{rev.language_slug} · {rev.interval_days}d interval</p>
          </div>
          {tone !== 'neutral' && (
            <Button size="sm" variant="ghost" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => complete(rev.id)}>
              Done
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
