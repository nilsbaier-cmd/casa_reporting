'use client';

import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ChartWrapper } from '@/components/ui/ChartWrapper';

/**
 * Horizontal density chart for Prüfstufe 3, shared between Admin and Viewer.
 * Routes are colored by classification; dashed reference lines mark the
 * median threshold and the high-priority limit so the classification logic
 * becomes visible instead of living only in table badges.
 */
export type DensityLevel = 'high' | 'watch' | 'clear';

export interface DensityChartRoute {
  /** e.g. "LX → DUB" */
  label: string;
  density: number;
  inadCount: number;
  pax: number;
  level: DensityLevel;
}

interface DensityChartProps {
  routes: DensityChartRoute[];
  /** Median density threshold (‰) */
  threshold: number;
  /** Density limit for the high-priority classification (‰) */
  highPriorityThreshold: number;
}

const LEVEL_COLORS: Record<DensityLevel, string> = {
  high: '#DC2626',
  watch: '#D97706',
  clear: '#16A34A',
};

const MAX_BARS = 20;

// recharts 3 injects active/payload at render time; its TooltipProps type
// omits them, so the content component declares what it actually receives.
interface DensityTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  levelLabels: Record<DensityLevel, string>;
  localeFormat: string;
  inadLabel: string;
  paxLabel: string;
}

function DensityTooltip({
  active,
  payload,
  levelLabels,
  localeFormat,
  inadLabel,
  paxLabel,
}: DensityTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const route = payload[0].payload as DensityChartRoute;

  return (
    <div className="bg-white border border-neutral-200 px-3 py-2 text-sm shadow-md">
      <p className="font-bold text-neutral-900">{route.label}</p>
      <p className="text-neutral-600">
        <span
          className="inline-block w-2 h-2 mr-1.5"
          style={{ backgroundColor: LEVEL_COLORS[route.level] }}
        />
        {levelLabels[route.level]}
      </p>
      <p className="text-neutral-600 mt-1">
        {route.density.toFixed(4)}‰ · {route.inadCount} {inadLabel} ·{' '}
        {route.pax.toLocaleString(localeFormat)} {paxLabel}
      </p>
    </div>
  );
}

export function DensityChart({ routes, threshold, highPriorityThreshold }: DensityChartProps) {
  const t = useTranslations('charts');
  const tPriority = useTranslations('priority');
  const tTable = useTranslations('table');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  const chartRoutes = useMemo(
    () => [...routes].sort((a, b) => b.density - a.density).slice(0, MAX_BARS),
    [routes]
  );

  if (chartRoutes.length === 0) return null;

  const truncated = routes.length > MAX_BARS;
  const levelLabels: Record<DensityLevel, string> = {
    high: tPriority('sanction'),
    watch: tPriority('watchList'),
    clear: tPriority('clear'),
  };

  const maxDensity = Math.max(
    chartRoutes[0].density,
    highPriorityThreshold,
    threshold
  );

  return (
    <ChartWrapper
      title={t('densityTitle')}
      subtitle={
        truncated
          ? `${t('densitySubtitle')} · ${t('densityTopNote', { count: MAX_BARS })}`
          : t('densitySubtitle')
      }
    >
      <div style={{ height: Math.max(240, chartRoutes.length * 34 + 60) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartRoutes}
            layout="vertical"
            margin={{ top: 28, right: 40, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, Number((maxDensity * 1.15).toFixed(2))]}
              tickFormatter={(value: number) => value.toFixed(2) + '‰'}
              tick={{ fontSize: 11, fill: '#737373' }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ fontSize: 11, fill: '#404040' }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f5f5f5' }}
              content={
                <DensityTooltip
                  levelLabels={levelLabels}
                  localeFormat={localeFormat}
                  inadLabel={tTable('inads')}
                  paxLabel={tTable('pax')}
                />
              }
            />
            {threshold > 0 && (
              <ReferenceLine
                x={threshold}
                stroke="#2563EB"
                strokeDasharray="6 4"
                label={{
                  value: `${t('median')} ${threshold.toFixed(3)}‰`,
                  position: 'top',
                  fill: '#2563EB',
                  fontSize: 11,
                }}
              />
            )}
            {highPriorityThreshold > threshold && (
              <ReferenceLine
                x={highPriorityThreshold}
                stroke="#DC2626"
                strokeDasharray="6 4"
                label={{
                  value: `${t('critical')} ${highPriorityThreshold.toFixed(3)}‰`,
                  position: 'top',
                  fill: '#DC2626',
                  fontSize: 11,
                }}
              />
            )}
            <Bar dataKey="density" radius={[0, 2, 2, 0]} maxBarSize={22}>
              {chartRoutes.map((route) => (
                <Cell key={route.label} fill={LEVEL_COLORS[route.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-600">
        {(Object.keys(LEVEL_COLORS) as DensityLevel[]).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
            />
            {levelLabels[level]}
          </span>
        ))}
      </div>
    </ChartWrapper>
  );
}
