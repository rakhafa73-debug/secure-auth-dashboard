import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FullPageLoader } from '@/components/ui';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { UserLayout } from './UserLayout';
import { AdminLayout } from './AdminLayout';

// Public auth pages
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const TermsPage = lazy(() =>
  import('@/pages/Legal').then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/Legal').then((m) => ({ default: m.PrivacyPage })),
);

// User area
const UserOverview = lazy(() => import('@/pages/UserOverview'));
const Profile = lazy(() => import('@/pages/Profile'));
const SecuritySettings = lazy(() => import('@/pages/SecuritySettings'));
const HelpSupport = lazy(() => import('@/pages/HelpSupport'));

// Admin area
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const ProfileManagement = lazy(() => import('@/pages/admin/ProfileManagement'));
const AdminSecurity = lazy(() => import('@/pages/admin/AdminSecurity'));

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Authenticated user area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<UserOverview />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/security" element={<SecuritySettings />} />
            <Route path="/help" element={<HelpSupport />} />
          </Route>
        </Route>

        {/* Administrator area */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/profiles" element={<ProfileManagement />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
