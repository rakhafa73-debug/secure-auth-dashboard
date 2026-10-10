import {
  Activity,
  Gauge,
  IdCard,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match nested routes (default true for parent sections). */
  end?: boolean;
}

export const userNav: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Profile', to: '/profile', icon: User },
  { label: 'Security', to: '/security', icon: ShieldCheck },
  { label: 'Help & Support', to: '/help', icon: LifeBuoy },
];

export const adminNav: NavItem[] = [
  { label: 'Admin Overview', to: '/admin', icon: Gauge, end: true },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'Profile Management', to: '/admin/profiles', icon: IdCard },
  { label: 'Security & Activity', to: '/admin/security', icon: Activity },
];
