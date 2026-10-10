import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Accessible confirmation dialog used before sensitive administrative actions.
 * Traps focus minimally, closes on Escape, and restores focus on close.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKey);
      window.clearTimeout(timer);
      previouslyFocused.current?.focus();
    };
  }, [open, isLoading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md animate-scale-in card-surface p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="confirm-title" className="text-base font-semibold text-content">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-white/[0.05] hover:text-content disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {description && <div className="mt-2 text-sm text-content-muted">{description}</div>}
        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className={cn(tone === 'danger' && 'bg-danger/20')}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
