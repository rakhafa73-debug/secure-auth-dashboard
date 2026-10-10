import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-content-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function InfoRow({
  label,
  children,
  icon,
}: {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="flex items-center gap-2.5 text-sm text-content-muted">
        {icon && <span className="text-content-faint">{icon}</span>}
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-content">
        {children}
      </dd>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-14 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.02] text-content-faint">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-content">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-content-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
