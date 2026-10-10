import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { userNav } from '@/routes/nav';

/** Shell for the standard user dashboard. */
export function UserLayout() {
  return <DashboardLayout items={userNav} variant="user" />;
}
