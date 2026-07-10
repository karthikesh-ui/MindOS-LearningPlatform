import { Brain, Clock, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import type { ThinkingHistoryEntry, ThinkingStats } from '@/types/engine';
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui';
import { cx, formatRelativeTime } from '@/utils';

export function ThinkingHistoryTracker({
  history,
  stats,
}: {
  history: ThinkingHistoryEntry[];
  stats: ThinkingStats | null;
}) {
  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          <StatBox icon={<Brain className="h-4 w-4" />} label="Attempts" value={String(stats.total_attempts)} />
          <StatBox icon={<Clock className="h-4 w-4" />} label="Avg time" value={`${Math.floor(stats.avg_thinking_seconds / 60)}m`} />
          <StatBox icon={<Lightbulb className="h-4 w-4" />} label="Avg hints" value={String(stats.avg_hints_opened)} />
          <StatBox
            icon={stats.avg_improvement_score >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            label="Improvement"
            value={`${stats.avg_improvement_score > 0 ? '+' : ''}${stats.avg_improvement_score}%`}
            tone={stats.avg_improvement_score >= 0 ? 'accent' : 'error'}
          />
        </div>
      )}
      <Card>
        <CardHeader title="Thinking History" subtitle="Every problem-solving attempt" icon={<Brain className="h-4 w-4" />} />
        {history.length === 0 ? (
          <EmptyState icon={<Brain className="h-7 w-7" />} title="No attempts yet" description="Start solving problems to track your thinking history." />
        ) : (
          <ul className="mt-4 space-y-2">
            {history.map((th) => (
              <li key={th.id} className="rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{th.problem_title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-400">
                      {th.language_slug} · {Math.floor(th.thinking_seconds / 60)}m {th.thinking_seconds % 60}s
                      · {th.hints_opened} hints · {th.attempts} attempt{th.attempts === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Badge tone={th.solution_completed ? 'accent' : 'warning'}>
                    {th.solution_completed ? 'Solved' : 'In progress'}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[10px] text-ink-400">{formatRelativeTime(th.started_at)}</span>
                  {th.improvement_score !== 0 && (
                    <span className={cx(
                      'inline-flex items-center gap-1 text-[10px] font-medium',
                      th.improvement_score > 0 ? 'text-accent-600' : 'text-error-600',
                    )}>
                      {th.improvement_score > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {th.improvement_score > 0 ? '+' : ''}{th.improvement_score}% vs last
                    </span>
                  )}
                  {th.revision_required && <Badge tone="warning">Revision needed</Badge>}
                  {th.next_review_date && (
                    <span className="text-[10px] text-ink-400">Review: {th.next_review_date}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatBox({ icon, label, value, tone = 'neutral' }: { icon: React.ReactNode; label: string; value: string; tone?: 'neutral' | 'accent' | 'error' }) {
  const tones = { neutral: 'bg-surface-card text-ink-500', accent: 'bg-accent-50 text-accent-600', error: 'bg-error-500/10 text-error-600' };
  return (
    <Card className="p-3">
      <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', tones[tone])}>{icon}</span>
      <p className="mt-2 font-display text-lg font-semibold text-ink-900">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </Card>
  );
}
