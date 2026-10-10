import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className, id, ...props },
  ref,
) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-content-muted',
          'transition-colors hover:text-content',
          className,
        )}
      >
        <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            className="peer sr-only"
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'h-[18px] w-[18px] rounded-[6px] border border-line-strong bg-input transition-all',
              'peer-checked:border-primary peer-checked:bg-primary',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-base',
              error && 'border-danger/60',
            )}
          />
          <Check
            aria-hidden="true"
            className="pointer-events-none absolute h-3.5 w-3.5 scale-75 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
          />
        </span>
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1.5 pl-[30px] text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
