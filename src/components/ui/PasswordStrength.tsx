import { Check, X } from 'lucide-react';
import { evaluatePassword } from '@/lib/validation';
import { cn } from '@/lib/cn';

export function PasswordStrength({ value }: { value: string }) {
  const { results, isStrong, met, total } = evaluatePassword(value);

  return (
    <div aria-live="polite" className="mt-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 gap-1" aria-hidden="true">
          {results.map((r, i) => (
            <span
              key={r.id}
              className={cn(
                'h-full flex-1 rounded-full transition-colors duration-200',
                i < met
                  ? isStrong
                    ? 'bg-success'
                    : 'bg-primary'
                  : 'bg-white/10',
              )}
            />
          ))}
        </div>
        <span className="w-16 text-right text-[11px] text-content-muted">
          {met}/{total}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-1 xs:grid-cols-2">
        {results.map((r) => (
          <li
            key={r.id}
            className={cn(
              'flex items-center gap-1.5 text-[11px] transition-colors',
              r.met ? 'text-success' : 'text-content-faint',
            )}
          >
            {r.met ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3" aria-hidden="true" />
            )}
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
