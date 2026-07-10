import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';

export function MarketingLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Outlet />
      {children}
    </div>
  );
}

export function BareLayout() {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <Outlet />
    </div>
  );
}

export function CenteredLogoHeader() {
  return (
    <header className="flex items-center justify-center py-10">
      <Logo size="md" />
    </header>
  );
}
