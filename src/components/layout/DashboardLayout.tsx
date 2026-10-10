import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SessionExpiredBanner } from './SessionExpiredBanner';
import type { NavItem } from '@/routes/nav';
import { cn } from '@/lib/cn';

export function DashboardLayout({
  items,
  variant,
}: {
  items: NavItem[];
  variant: 'user' | 'admin';
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const activeItem =
    items.find(
      (item) =>
        location.pathname === item.to ||
        (location.pathname.startsWith(`${item.to}/`) && item.to !== '/'),
    ) ?? items[0];

  const title = activeItem?.label ?? 'Dashboard';

  return (
    <div className="min-h-dvh bg-base">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-line lg:block">
        <Sidebar items={items} variant={variant} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            'absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line shadow-2xl transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar
            items={items}
            variant={variant}
            isMobile
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[272px]">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <SessionExpiredBanner />
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
