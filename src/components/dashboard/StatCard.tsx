import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui';

export function StatCard({
  label,
  value,
  icon,
  tone = 'default',
  hint,
  isLoading = false,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: 'default' | 'success' | 'primary' | 'warning';
  hint?: string;
  isLoading?: boolean;
}) {
  const tones = {
    default: 'text-content',
    success: 'text-success',
    primary: 'text-accent',
    warning: 'text-amber-200',
  } as const;

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-content-muted">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/[0.03]',
            tones[tone],
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className={cn('text-2xl font-bold tracking-tight', tones[tone])}>{value}</p>
        )}
        {hint && !isLoading && (
          <p className="mt-1 text-xs text-content-faint">{hint}</p>
        )}
      </div>
    </div>
  );
}
