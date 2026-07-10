import type { ReactNode } from 'react';
import { cx } from '@/utils';

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'error';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-card text-ink-600 border border-surface-border',
  brand: 'bg-brand-50 text-brand-700 border border-brand-100',
  accent: 'bg-accent-50 text-accent-700 border border-accent-100',
  success: 'bg-success-500/10 text-success-600 border border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-600 border border-warning-500/20',
  error: 'bg-error-500/10 text-error-600 border border-error-500/20',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, icon, className }: BadgeProps) {
  return (
    <span className={cx('chip', tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
