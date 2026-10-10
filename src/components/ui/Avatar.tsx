import { cn } from '@/lib/cn';

function initialsFrom(name: string | null | undefined, email?: string | null): string {
  const source = (name?.trim() || email?.split('@')[0] || '').trim();
  if (!source) return '?';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  email,
  size = 'md',
  className,
}: {
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white',
        'bg-indigo-soft ring-1 ring-white/10',
        sizes[size],
        className,
      )}
    >
      {initialsFrom(name, email)}
    </span>
  );
}
