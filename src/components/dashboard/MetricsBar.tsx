'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisStore } from '@/stores/analysisStore';
import { getStep1Summary } from '@/lib/analysis/step1';
import { getStep3Summary } from '@/lib/analysis/step3';

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

function MetricCard({ label, value, description, variant = 'default' }: MetricCardProps) {
  const bgColors = {
    default: 'bg-slate-50',
    warning: 'bg-orange-50',
    danger: 'bg-red-50',
    success: 'bg-green-50',
  };

  const textColors = {
    default: 'text-slate-900',
    warning: 'text-orange-900',
    danger: 'text-red-900',
    success: 'text-green-900',
  };

  return (
    <Card className={bgColors[variant]}>
      <CardContent className="pt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${textColors[variant]}`}>{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsBar() {
  const { step1Results, step3Results, threshold } = useAnalysisStore();

  // Don't render if no results
  if (!step1Results || !step3Results) {
    return null;
  }

  const step1Summary = getStep1Summary(step1Results);
  const step3Summary = getStep3Summary(step3Results, threshold || 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MetricCard
        label="Total INADs"
        value={step1Summary.totalInads}
        description="Included cases"
      />

      <MetricCard
        label="Airlines"
        value={`${step1Summary.passingAirlines} / ${step1Summary.totalAirlines}`}
        description="Above threshold"
      />

      <MetricCard
        label="High Priority"
        value={step3Summary.highPriority}
        variant={step3Summary.highPriority > 0 ? 'danger' : 'default'}
        description="Routes requiring action"
      />

      <MetricCard
        label="Watch List"
        value={step3Summary.watchList}
        variant={step3Summary.watchList > 0 ? 'warning' : 'default'}
        description="Routes to monitor"
      />

      <MetricCard
        label="Clear"
        value={step3Summary.clear}
        variant="success"
        description="Routes below threshold"
      />

      <MetricCard
        label="Threshold"
        value={`${threshold?.toFixed(3) || 0}‰`}
        description="Median density"
      />
    </div>
  );
}
