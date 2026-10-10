import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Logo({
  size = 'md',
  withWordmark = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  withWordmark?: boolean;
  className?: string;
}) {
  const box = {
    sm: 'h-8 w-8 rounded-[10px]',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
  } as const;

  const icon = {
    sm: 'h-4 w-4',
    md: 'h-[18px] w-[18px]',
    lg: 'h-5 w-5',
  } as const;

  const text = {
    sm: 'text-sm',
    md: 'text-[15px]',
    lg: 'text-lg',
  } as const;

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative inline-flex items-center justify-center bg-indigo-soft text-white shadow-[0_8px_24px_-10px_rgba(119,121,237,0.9)]',
          box[size],
        )}
      >
        <ShieldCheck className={icon[size]} aria-hidden="true" />
      </span>
      {withWordmark && (
        <span className={cn('font-extrabold tracking-tight text-content', text[size])}>
          Secure<span className="text-accent">Auth</span>
        </span>
      )}
    </span>
  );
}
