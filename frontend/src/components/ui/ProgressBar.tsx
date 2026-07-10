import { cx, clampPercent } from '@/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const toneBg: Record<string, string> = {
  brand: 'bg-brand-500',
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
};

export function ProgressBar({
  value,
  max = 100,
  tone = 'brand',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const pct = clampPercent((value / max) * 100);
  return (
    <div className={cx('w-full', className)}>
      <div
        className={cx(
          'w-full overflow-hidden rounded-full bg-surface-card',
          size === 'sm' ? 'h-1.5' : 'h-2',
        )}
      >
        <div
          className={cx('h-full rounded-full transition-all duration-700 ease-out', toneBg[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-ink-400">
          <span>{pct}%</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
