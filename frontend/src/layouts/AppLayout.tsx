import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Code2, Compass, FileText, Hash, LayoutDashboard, LogOut, Menu,
  Search, Settings, Target, TrendingUp, User as UserIcon, X, Brain,
} from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/hooks';
import { cx } from '@/utils';

const nav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/learning', label: 'Learning Hub', icon: Compass },
  { to: '/app/notes', label: 'Notes', icon: FileText },
  { to: '/app/problems', label: 'Problems', icon: Hash },
  { to: '/app/editor', label: 'Editor', icon: Code2 },
  { to: '/app/planner', label: 'Planner', icon: Target },
  { to: '/app/progress', label: 'Progress', icon: TrendingUp },
  { to: '/app/intelligence', label: 'Intelligence', icon: Brain },
  { to: '/app/profile', label: 'Profile', icon: UserIcon },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const current = nav.find((n) => location.pathname.startsWith(n.to))?.label ?? 'MindOS';

  return (
    <div className="min-h-screen bg-surface-subtle">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-surface-border bg-surface lg:flex">
        <SidebarContent user={user} signOut={signOut} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-surface-border bg-surface shadow-lift animate-scale-in">
            <button className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-400 hover:bg-surface-card" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={user} signOut={signOut} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-surface-border bg-surface/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 text-ink-500 hover:bg-surface-card lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
              <div className="lg:hidden"><Logo size="sm" /></div>
              <h1 className="hidden text-sm font-semibold text-ink-900 lg:block">{current}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={onOpenSearch} className="hidden items-center gap-2 rounded-lg border border-surface-border bg-surface-subtle px-3 py-1.5 text-xs text-ink-400 transition-colors hover:bg-surface-card sm:flex">
                <Search className="h-3.5 w-3.5" /> Search…
                <kbd className="rounded bg-surface-card px-1.5 py-0.5 text-[10px] font-medium text-ink-400">Cmd K</kbd>
              </button>
              <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="sm" />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  signOut,
  onNavigate,
}: {
  user: { name: string; email: string; avatarUrl?: string } | null;
  signOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center px-5">
        <Logo size="md" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-300">Menu</p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }: { isActive: boolean }) => cx('nav-link', isActive && 'nav-link-active')}
            end={item.to === '/app/learning'}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className={cx('h-4 w-4', isActive ? 'text-brand-600' : 'text-ink-400')} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="nav-link mt-1 w-full text-ink-500 hover:text-error-600">
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );
}
