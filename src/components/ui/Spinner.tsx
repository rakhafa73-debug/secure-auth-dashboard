import { cn } from '@/lib/cn';

export function Spinner({
  className,
  label = 'Loading',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <svg
        className={cn('h-4 w-4 animate-spin text-primary', className)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647Z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FullPageLoader({ label = 'Loading SecureAuth' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-2xl bg-indigo-soft opacity-20 blur-lg" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-card">
            <Spinner className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm text-content-muted">{label}</p>
      </div>
    </div>
  );
}
