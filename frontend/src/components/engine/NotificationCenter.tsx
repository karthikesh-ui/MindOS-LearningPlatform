import { Bell, CheckCheck, X } from 'lucide-react';
import type { AppNotification } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/components/ui';
import { cx, formatRelativeTime } from '@/utils';

const KIND_TONE: Record<string, 'brand' | 'warning' | 'error' | 'accent' | 'neutral'> = {
  revision: 'warning', weak_topic: 'error', planner: 'brand', goal: 'accent', achievement: 'accent',
};

export function NotificationCenter({ notifications, onChange }: { notifications: AppNotification[]; onChange?: () => void }) {
  const unread = notifications.filter((n) => !n.read).length;

  async function handleRead(id: string) { await engineApi.markNotificationRead(id); onChange?.(); }
  async function handleReadAll() { await engineApi.markAllNotificationsRead(); onChange?.(); }

  return (
    <Card>
      <CardHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        icon={<Bell className="h-4 w-4" />}
        action={unread > 0 ? <Button variant="ghost" size="sm" leftIcon={<CheckCheck className="h-3.5 w-3.5" />} onClick={handleReadAll}>Mark all</Button> : undefined}
      />
      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" />} title="No notifications" description="Intelligent reminders will appear here." />
      ) : (
        <ul className="mt-4 space-y-1.5">
          {notifications.slice(0, 8).map((n) => (
            <li key={n.id} className={cx(
              'flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors',
              n.read ? 'border-surface-border bg-surface-subtle opacity-70' : 'border-brand-100 bg-brand-50/30',
            )}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink-900">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                </div>
                {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">{n.body}</p>}
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={KIND_TONE[n.kind] ?? 'neutral'}>{n.kind.replace(/_/g, ' ')}</Badge>
                  <span className="text-[10px] text-ink-400">{formatRelativeTime(n.created_at)}</span>
                </div>
              </div>
              {!n.read && (
                <button onClick={() => handleRead(n.id)} className="rounded p-1 text-ink-300 hover:bg-surface-card hover:text-ink-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
