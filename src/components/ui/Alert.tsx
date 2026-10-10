import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<Tone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: 'border-accent/25 bg-accent-soft text-accent',
    icon: <Info className="h-4 w-4" aria-hidden="true" />,
  },
  success: {
    wrap: 'border-success/25 bg-success-soft text-success',
    icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
  },
  warning: {
    wrap: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  },
  error: {
    wrap: 'border-danger/25 bg-danger-soft text-danger',
    icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
  },
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const config = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm animate-fade-in',
        config.wrap,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold text-content">{title}</p>}
        <div className={cn('text-content-muted', title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}
