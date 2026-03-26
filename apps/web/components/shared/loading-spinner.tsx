import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  className,
  label = 'Cargando',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden
      />
      <span className="text-sm text-muted-foreground">{label}…</span>
    </div>
  );
}
