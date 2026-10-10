import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hideLabel, id, children, ...props },
  ref,
) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={cn('mb-1.5 block text-[13px] font-medium text-content', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            'input-field appearance-none pr-10',
            'cursor-pointer',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint"
          aria-hidden="true"
        />
      </div>
    </div>
  );
});
