import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning';

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-white/[0.04] text-content-muted',
  primary: 'border-primary/30 bg-primary/12 text-accent',
  success: 'border-success/30 bg-success-soft text-success',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  warning: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
