import { BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cx } from '@/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withWordmark?: boolean;
  to?: string | null;
  className?: string;
}

const markSizes = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-11 w-11 rounded-2xl',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const wordSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export function Logo({ size = 'md', withWordmark = true, to = '/', className }: LogoProps) {
  const mark = (
    <span
      className={cx(
        'inline-flex items-center justify-center bg-ink-900 text-white shadow-soft',
        markSizes[size],
      )}
    >
      <BrainCircuit className={iconSizes[size]} strokeWidth={2.25} />
    </span>
  );

  const content = (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      {mark}
      {withWordmark && (
        <span className={cx('font-display font-semibold tracking-tight text-ink-900', wordSizes[size])}>
          MindOS
        </span>
      )}
    </span>
  );

  if (to === null) return content;
  return <Link to={to} className="focus-ring rounded-lg">{content}</Link>;
}
