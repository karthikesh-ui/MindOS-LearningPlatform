import type { ReactNode } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-card font-medium text-ink-600 ring-1 ring-surface-border ${sizes[size]} ${className || ''}`}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}

interface IconBadgeProps {
  children: ReactNode;
  tone?: 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconTones = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-success-500/10 text-success-600',
  warning: 'bg-warning-500/10 text-warning-600',
  error: 'bg-error-500/10 text-error-600',
  neutral: 'bg-surface-card text-ink-500',
};

const iconSizes = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-2xl',
};

export function IconBadge({ children, tone = 'neutral', size = 'md', className }: IconBadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center ${iconTones[tone]} ${iconSizes[size]} ${className || ''}`}>
      {children}
    </span>
  );
}
