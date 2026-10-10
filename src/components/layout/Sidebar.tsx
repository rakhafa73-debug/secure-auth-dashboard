import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, ShieldCheck, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Avatar, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { NavItem } from '@/routes/nav';
import { useAuth } from '@/contexts/auth-context';

function NavItems({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                isActive
                  ? 'bg-primary/12 text-content shadow-[inset_0_0_0_1px_rgba(119,121,237,0.25)]'
                  : 'text-content-muted hover:bg-white/[0.04] hover:text-content',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('h-[18px] w-[18px] transition-colors', isActive ? 'text-accent' : 'text-content-faint group-hover:text-content-muted')}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  items,
  variant,
  onClose,
  isMobile = false,
}: {
  items: NavItem[];
  variant: 'user' | 'admin';
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const { profile, user, role, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // Redirect handled by route guards reacting to auth state.
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Logo size="md" />
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-content-muted transition-colors hover:bg-white/[0.05] hover:text-content"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {variant === 'admin' && (
          <div className="mb-3 px-2">
            <Badge tone="primary" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Administrator
            </Badge>
          </div>
        )}
        <NavItems items={items} onNavigate={isMobile ? onClose : undefined} />
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={profile?.full_name} email={profile?.email ?? user?.email} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-content">
              {profile?.full_name ?? 'Your account'}
            </p>
            <p className="truncate text-xs text-content-muted">
              {role === 'admin' ? 'Administrator' : 'Member'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            'text-content-muted hover:bg-danger-soft hover:text-danger',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            'disabled:opacity-60',
          )}
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          {signingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    </div>
  );
}

export { NavItems };
