import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  LogOut,
  Moon,
  Palette,
  Shield,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { api } from '@/services/api';
import { Avatar, Badge, Button, Card, CardHeader } from '@/components/ui';
import { cx } from '@/utils';

type Section = 'theme' | 'notifications' | 'account' | 'security';

const sections: { key: Section; label: string; icon: typeof Palette }[] = [
  { key: 'theme', label: 'Theme', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'account', label: 'Account', icon: UserIcon },
  { key: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>('theme');
  const [theme, setTheme] = useState<'light' | 'system'>('light');
  const [notif, setNotif] = useState({ daily: true, weekly: true, streaks: true, product: false });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    api.profile.update({ weeklyGoalMinutes: 300 }).catch(() => {});
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your preferences and account.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Sidebar nav */}
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cx(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active === s.key
                  ? 'bg-surface-card text-ink-900 shadow-soft'
                  : 'text-ink-500 hover:bg-surface-card hover:text-ink-900',
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="space-y-5">
          {active === 'theme' && (
            <Card>
              <CardHeader title="Theme" subtitle="MindOS is designed for a calm, light workspace." icon={<Palette className="h-4 w-4" />} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <ThemeOption
                  active={theme === 'light'}
                  onClick={() => setTheme('light')}
                  icon={<Sun className="h-4 w-4" />}
                  label="Light"
                  description="Default · recommended"
                />
                <ThemeOption
                  active={theme === 'system'}
                  onClick={() => setTheme('system')}
                  icon={<Moon className="h-4 w-4" />}
                  label="System"
                  description="Match device"
                />
              </div>
              <p className="mt-4 rounded-xl bg-surface-subtle px-3.5 py-2.5 text-xs text-ink-400">
                A dark theme is on the roadmap. The light theme is tuned for long, focused study
                sessions.
              </p>
            </Card>
          )}

          {active === 'notifications' && (
            <Card>
              <CardHeader title="Notifications" subtitle="Choose what reaches you" icon={<Bell className="h-4 w-4" />} />
              <div className="mt-4 space-y-1">
                <Toggle
                  label="Daily plan reminder"
                  description="A gentle nudge each morning"
                  checked={notif.daily}
                  onChange={(v) => setNotif((n) => ({ ...n, daily: v }))}
                />
                <Toggle
                  label="Weekly progress report"
                  description="Sundays at 6pm"
                  checked={notif.weekly}
                  onChange={(v) => setNotif((n) => ({ ...n, weekly: v }))}
                />
                <Toggle
                  label="Streak alerts"
                  description="Protect your streak before midnight"
                  checked={notif.streaks}
                  onChange={(v) => setNotif((n) => ({ ...n, streaks: v }))}
                />
                <Toggle
                  label="Product updates"
                  description="New tracks and features"
                  checked={notif.product}
                  onChange={(v) => setNotif((n) => ({ ...n, product: v }))}
                />
              </div>
            </Card>
          )}

          {active === 'account' && (
            <Card>
              <CardHeader title="Account" subtitle="Your profile information" icon={<UserIcon className="h-4 w-4" />} />
              <div className="mt-4 flex items-center gap-4">
                <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="lg" />
                <div>
                  <p className="font-display text-base font-semibold text-ink-900">{user?.name}</p>
                  <p className="text-sm text-ink-500">{user?.email}</p>
                  <Badge tone={user?.provider === 'google' ? 'brand' : 'neutral'} className="mt-2">
                    {user?.provider === 'google' ? 'Google account' : 'Guest account'}
                  </Badge>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Display name" defaultValue={user?.name} />
                <Field label="Email" defaultValue={user?.email} disabled />
              </div>
            </Card>
          )}

          {active === 'security' && (
            <Card>
              <CardHeader title="Security" subtitle="Sessions and access" icon={<Shield className="h-4 w-4" />} />
              <div className="mt-4 space-y-3">
                <Row label="Authentication" value={user?.provider === 'google' ? 'Google OAuth' : 'Guest'} />
                <Row label="JWT session" value="Active · 7-day token" />
                <Row label="Row-level data" value="Isolated to your user ID" />
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" size="sm">Reset session</Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LogOut className="h-3.5 w-3.5" />}
                  onClick={() => {
                    signOut();
                    navigate('/login');
                  }}
                >
                  Sign out
                </Button>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-600">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            <Button variant="secondary" size="md">Cancel</Button>
            <Button size="md" onClick={handleSave}>Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
        active ? 'border-brand-400 bg-brand-50/50 ring-2 ring-brand-400/30' : 'border-surface-border hover:border-ink-100',
      )}
    >
      <span className={cx('flex h-9 w-9 items-center justify-center rounded-lg', active ? 'bg-brand-500 text-white' : 'bg-surface-card text-ink-500')}>
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="text-xs text-ink-400">{description}</p>
      </div>
    </button>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-1 py-3 transition-colors hover:bg-surface-subtle">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-xs text-ink-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-ink-200',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
            checked ? 'left-0.5' : 'left-0.5',
          )}
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </label>
  );
}

function Field({ label, defaultValue, disabled }: { label: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <input className="input mt-1.5" defaultValue={defaultValue} disabled={disabled} />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}
