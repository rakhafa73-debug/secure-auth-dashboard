import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-base px-6 text-center">
      <Logo size="lg" />
      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-card">
        <Compass className="h-7 w-7 text-accent" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-content">404</h1>
      <p className="mt-2 max-w-sm text-sm text-content-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-8">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
