import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminNav } from '@/routes/nav';

/** Shell for administrator pages. */
export function AdminLayout() {
  return <DashboardLayout items={adminNav} variant="admin" />;
}
