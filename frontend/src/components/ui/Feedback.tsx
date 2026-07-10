import type { ReactNode } from 'react';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-surface-border border-t-brand-500 ${className || 'h-5 w-5'}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className || 'h-4 w-full'}`} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border bg-surface-subtle px-6 py-10 text-center">
      {icon && <div className="text-ink-300">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-ink-700">{title}</p>
        {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-error-500/20 bg-error-500/5 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-error-600">Something went wrong</p>
      <p className="max-w-xs text-xs text-ink-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1 text-xs">
          Try again
        </button>
      )}
    </div>
  );
}
