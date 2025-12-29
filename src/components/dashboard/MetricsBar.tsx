'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { getStep1Summary } from '@/lib/analysis/step1';
import { getStep3Summary } from '@/lib/analysis/step3';
import { useTranslations, useLocale } from 'next-intl';
import {
  Plane,
  Users,
  AlertTriangle,
  Eye,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success' | 'primary';
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({
  label,
  value,
  description,
  icon,
  variant = 'default',
  trend,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      container: 'bg-white border-neutral-200',
      icon: 'bg-neutral-100 text-neutral-600',
      value: 'text-neutral-900',
      accent: 'bg-neutral-900',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-900',
      accent: 'bg-amber-600',
    },
    danger: {
      container: 'bg-red-50 border-red-200',
      icon: 'bg-red-100 text-red-700',
      value: 'text-red-900',
      accent: 'bg-red-600',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'bg-green-100 text-green-700',
      value: 'text-green-900',
      accent: 'bg-green-600',
    },
    primary: {
      container: 'bg-neutral-900 border-neutral-800',
      icon: 'bg-red-600 text-white',
      value: 'text-white',
      accent: 'bg-red-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative border overflow-hidden group',
        'animate-sem-fade-in opacity-0',
        styles.container
      )}
    >
      {/* Top accent line */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', styles.accent)} aria-hidden="true" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2', styles.icon)}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-neutral-500'
            )}>
              <TrendingUp className={cn(
                'w-3 h-3',
                trend === 'down' && 'rotate-180'
              )} />
            </div>
          )}
        </div>

        {/* Value */}
        <p className={cn('text-3xl font-bold tracking-tight mb-1', styles.value)}>
          {value}
        </p>

        {/* Label */}
        <p className={cn(
          'text-xs font-bold uppercase tracking-wider',
          variant === 'primary' ? 'text-neutral-400' : 'text-neutral-500'
        )}>
          {label}
        </p>

        {/* Description */}
        {description && (
          <p className={cn(
            'text-sm mt-2',
            variant === 'primary' ? 'text-neutral-500' : 'text-neutral-600'
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function MetricsBar() {
  const t = useTranslations('metrics');
  const locale = useLocale();
  const { step1Results, step3Results, threshold } = useAnalysisStore();

  if (!step1Results || !step3Results) {
    return null;
  }

  const step1Summary = getStep1Summary(step1Results);
  const step3Summary = getStep3Summary(step3Results, threshold || 0);
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-px bg-red-600" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {t('title')}
        </h2>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label={t('totalInads')}
          value={step1Summary.totalInads.toLocaleString(localeFormat)}
          description={t('totalInadsDesc')}
          icon={<Plane className="w-5 h-5" />}
          variant="primary"
        />

        <MetricCard
          label={t('airlines')}
          value={`${step1Summary.passingAirlines}/${step1Summary.totalAirlines}`}
          description={t('airlinesDesc')}
          icon={<Users className="w-5 h-5" />}
        />

        <MetricCard
          label={t('highPriority')}
          value={step3Summary.highPriority}
          description={t('highPriorityDesc')}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={step3Summary.highPriority > 0 ? 'danger' : 'default'}
        />

        <MetricCard
          label={t('watchList')}
          value={step3Summary.watchList}
          description={t('watchListDesc')}
          icon={<Eye className="w-5 h-5" />}
          variant={step3Summary.watchList > 0 ? 'warning' : 'default'}
        />

        <MetricCard
          label={t('clear')}
          value={step3Summary.clear}
          description={t('clearDesc')}
          icon={<CheckCircle className="w-5 h-5" />}
          variant="success"
        />

        <MetricCard
          label={t('threshold')}
          value={`${threshold?.toFixed(3) || 0}‰`}
          description={t('thresholdDesc')}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}
