import type { Priority } from '@/lib/analysis/types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/analysis/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colors = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];

  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        'font-medium',
        className
      )}
    >
      {label}
    </Badge>
  );
}
