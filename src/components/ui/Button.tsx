import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-[0_10px_30px_-12px_rgba(119,121,237,0.7)]',
  secondary: 'bg-white/[0.06] text-content hover:bg-white/[0.1] border border-line',
  outline: 'border border-line-strong bg-transparent text-content hover:bg-white/[0.05]',
  ghost: 'bg-transparent text-content-muted hover:bg-white/[0.05] hover:text-content',
  danger: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'btn-base',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      <span className={cn(isLoading && 'opacity-90')}>{children}</span>
    </button>
  );
});
