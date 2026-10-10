import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card-surface', className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 sm:p-6', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-content">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-content-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />;
}

export function CardDivider() {
  return <div className="divider" />;
}
