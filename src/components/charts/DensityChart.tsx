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
import {
  CLASSIFICATION_BAR_COLORS,
  CLASSIFICATION_COLORS,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_REFERENCE_NEUTRAL,
  PORTAL_ACCENT,
} from '@/lib/utils';

/**
 * Horizontal density chart for Prüfstufe 3, shared between Admin and Viewer.
 * Routes are colored by classification using the shared chart theme (pale
 * fill + saturated stroke, mirroring the badge components); dashed reference
 * lines mark the median threshold and the high-priority limit so the
 * classification logic becomes visible instead of living only in badges.
 */
export type DensityClassification = keyof typeof CLASSIFICATION_COLORS;

export interface DensityChartRoute {
  /** e.g. "LX → DUB" */
  label: string;
  density: number;
  inadCount: number;
  pax: number;
  classification: DensityClassification;
}

interface DensityChartProps {
  routes: DensityChartRoute[];
  /** Median density threshold (‰) */
  threshold: number;
  /** Density limit for the high-priority classification (‰) */
  highPriorityThreshold: number;
}

const MAX_BARS = 20;

// recharts 3 injects active/payload at render time; its TooltipProps type
// omits them, so the content component declares what it actually receives.
interface DensityTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  classificationLabels: Record<DensityClassification, string>;
  localeFormat: string;
  inadLabel: string;
  paxLabel: string;
}

function DensityTooltip({
  active,
  payload,
  classificationLabels,
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
          style={{ backgroundColor: CLASSIFICATION_COLORS[route.classification] }}
        />
        {classificationLabels[route.classification]}
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
  const classificationLabels: Record<DensityClassification, string> = {
    sanction: tPriority('sanction'),
    watchList: tPriority('watchList'),
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
            margin={{ top: 44, right: 40, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxDensity * 1.15]}
              tickFormatter={(value: number) =>
                (value < 0.01 ? value.toFixed(4) : value.toFixed(2)) + '‰'
              }
              tick={CHART_AXIS_TICK}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ ...CHART_AXIS_TICK, fill: '#404040' }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f5f5f5' }}
              content={
                <DensityTooltip
                  classificationLabels={classificationLabels}
                  localeFormat={localeFormat}
                  inadLabel={tTable('inads')}
                  paxLabel={tTable('pax')}
                />
              }
            />
            {/* The two labels sit on separate rows: when an outlier route
                stretches the x-domain, both reference lines crowd together
                and same-row labels would overlap (e.g. semester 2022 H2). */}
            {threshold > 0 && (
              <ReferenceLine
                x={threshold}
                stroke={CHART_REFERENCE_NEUTRAL}
                strokeDasharray="6 4"
                label={{
                  value: `${t('median')} ${threshold.toFixed(3)}‰`,
                  position: 'top',
                  fill: CHART_REFERENCE_NEUTRAL,
                  fontSize: 11,
                }}
              />
            )}
            {highPriorityThreshold > threshold && (
              <ReferenceLine
                x={highPriorityThreshold}
                stroke={PORTAL_ACCENT.red}
                strokeDasharray="6 4"
                label={{
                  value: `${t('critical')} ${highPriorityThreshold.toFixed(3)}‰`,
                  position: 'top',
                  dy: -16,
                  fill: PORTAL_ACCENT.red,
                  fontSize: 11,
                }}
              />
            )}
            <Bar dataKey="density" radius={[0, 2, 2, 0]} maxBarSize={22} strokeWidth={1.5}>
              {chartRoutes.map((route) => (
                <Cell
                  key={route.label}
                  fill={CLASSIFICATION_BAR_COLORS[route.classification].fill}
                  stroke={CLASSIFICATION_BAR_COLORS[route.classification].stroke}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-600">
        {(Object.keys(CLASSIFICATION_BAR_COLORS) as DensityClassification[]).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 border"
              style={{
                backgroundColor: CLASSIFICATION_BAR_COLORS[level].fill,
                borderColor: CLASSIFICATION_BAR_COLORS[level].stroke,
              }}
            />
            {classificationLabels[level]}
          </span>
        ))}
      </div>
    </ChartWrapper>
  );
}
