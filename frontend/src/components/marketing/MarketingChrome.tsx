import { Link, NavLink } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cx } from '@/utils';

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#journey', label: 'Journey' },
  { to: '/#benefits', label: 'Benefits' },
  { to: '/login', label: 'Sign in' },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size="md" />
        <nav className="hidden items-center gap-1 md:flex">
          {links.slice(0, 3).map((l) => (
            <NavLink key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className={cx('btn-ghost hidden sm:inline-flex')}>
            Sign in
          </Link>
          <Link to="/login" className="btn-primary">
            <LogIn className="h-4 w-4" /> Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-surface-border bg-surface-subtle">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm text-ink-500">
              A calm, focused learning operating system for students preparing for careers in
              Software Engineering, AI, ML, and GenAI.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: 'Features', to: '/#features' },
              { label: 'Learning Hub', to: '/app/learning' },
              { label: 'Dashboard', to: '/app/dashboard' },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: 'About', to: '/' },
              { label: 'Roadmap', to: '/' },
              { label: 'Changelog', to: '/' },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { label: 'Sign in', to: '/login' },
              { label: 'Guest mode', to: '/login' },
              { label: 'Settings', to: '/app/settings' },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-surface-border pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} MindOS. Crafted for focused learners.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-ink-700">Privacy</Link>
            <Link to="/" className="hover:text-ink-700">Terms</Link>
            <Link to="/" className="hover:text-ink-700">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-ink-600 transition-colors hover:text-ink-900">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
