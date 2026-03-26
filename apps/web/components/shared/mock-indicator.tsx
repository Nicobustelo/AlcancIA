import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MockIndicatorProps {
  className?: string;
  /** Texto corto para la insignia */
  label?: 'Demo' | 'Simulado';
}

export function MockIndicator({
  className,
  label = 'Simulado',
}: MockIndicatorProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100',
        className,
      )}
      title="Los datos son de demostración y no reflejan valores on-chain reales"
    >
      {label}
    </Badge>
  );
}
