import { AlertTriangle, Ban, Clock, Lightbulb, Target, TrendingDown } from 'lucide-react';
import type { WeakArea } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui';
import { cx } from '@/utils';

const ICONS: Record<string, typeof AlertTriangle> = {
  low_quiz: TrendingDown,
  high_hints: Lightbulb,
  long_solve: Clock,
  missed_revision: Target,
  fail_rate: AlertTriangle,
  skip_rate: AlertTriangle,
  low_completion: TrendingDown,
};

const SEVERITY_TONE: Record<string, 'error' | 'warning' | 'neutral'> = {
  high: 'error', medium: 'warning', low: 'neutral',
};

export function WeakAreaCard({ areas, onDismiss }: { areas: WeakArea[]; onDismiss?: () => void }) {
  async function handleDismiss(id: string) {
    await engineApi.dismissWeakArea(id);
    onDismiss?.();
  }

  return (
    <Card>
      <CardHeader title="Weak Areas" subtitle="Auto-detected from your learning" icon={<AlertTriangle className="h-4 w-4" />} />
      {areas.length === 0 ? (
        <EmptyState icon={<Target className="h-7 w-7" />} title="No weak areas detected" description="Great progress — keep it up!" />
      ) : (
        <ul className="mt-4 space-y-2">
          {areas.map((wa) => {
            const Icon = ICONS[wa.weakness_type] ?? AlertTriangle;
            return (
              <li key={wa.id} className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5">
                <span className={cx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  wa.severity === 'high' ? 'bg-error-500/10 text-error-600' : wa.severity === 'medium' ? 'bg-warning-500/10 text-warning-600' : 'bg-surface-card text-ink-400',
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800">{wa.title}</p>
                  <p className="truncate text-xs text-ink-400 capitalize">{wa.weakness_type.replace(/_/g, ' ')}</p>
                </div>
                <Badge tone={SEVERITY_TONE[wa.severity] ?? 'neutral'}>{wa.severity}</Badge>
                <button
                  onClick={() => handleDismiss(wa.id)}
                  className="rounded p-1 text-ink-300 opacity-0 transition-opacity hover:bg-error-500/10 hover:text-error-600 group-hover:opacity-100"
                >
                  <Ban className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
