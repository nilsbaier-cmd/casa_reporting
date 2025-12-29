'use client';

import type { Priority } from '@/lib/analysis/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Eye, CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const t = useTranslations('priority');

  const PRIORITY_CONFIG = {
    HIGH_PRIORITY: {
      label: t('sanction'),
      shortLabel: t('sanctionShort'),
      icon: AlertTriangle,
      styles: 'bg-red-50 text-red-900 border-red-600',
    },
    WATCH_LIST: {
      label: t('watchList'),
      shortLabel: t('watchListShort'),
      icon: Eye,
      styles: 'bg-amber-50 text-amber-900 border-amber-600',
    },
    CLEAR: {
      label: t('clear'),
      shortLabel: t('clearShort'),
      icon: CheckCircle,
      styles: 'bg-green-50 text-green-900 border-green-600',
    },
    UNRELIABLE: {
      label: t('unreliable'),
      shortLabel: t('unreliableShort'),
      icon: HelpCircle,
      styles: 'bg-neutral-100 text-neutral-600 border-neutral-400',
    },
  } as const;

  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1',
        'text-xs font-bold uppercase tracking-wider',
        'border-2',
        config.styles,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.shortLabel}</span>
    </span>
  );
}
