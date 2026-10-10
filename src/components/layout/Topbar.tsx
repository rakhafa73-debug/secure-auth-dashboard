import { Bell, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';

export function Topbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  const { profile, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-base/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-content-muted transition-colors hover:bg-white/[0.05] hover:text-content lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-content sm:text-lg">
        {title}
      </h1>

      <button
        type="button"
        aria-label="Notifications"
        className="relative hidden rounded-lg p-2 text-content-muted transition-colors hover:bg-white/[0.05] hover:text-content sm:block"
      >
        <Bell className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5 rounded-full border border-line bg-card py-1 pl-1 pr-3">
        <Avatar name={profile?.full_name} email={profile?.email ?? user?.email} size="sm" />
        <span className="hidden max-w-[140px] truncate text-sm text-content sm:block">
          {profile?.full_name ?? user?.email}
        </span>
      </div>
    </header>
  );
}
