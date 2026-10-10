import { forwardRef, type InputHTMLAttributes, type ReactNode, useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, leftIcon, hideLabel, id, type = 'text', ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword && revealed ? 'text' : type;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={cn(
          'mb-1.5 block text-[13px] font-medium text-content',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>

      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-faint"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'input-field',
            leftIcon && 'pl-11',
            (isPassword || error) && 'pr-11',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-content-faint transition-colors hover:bg-white/[0.05] hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            tabIndex={-1}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-content-muted">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs text-danger"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});
