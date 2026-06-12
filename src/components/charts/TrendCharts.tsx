'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  BarChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush,
  ComposedChart,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, ArrowRightLeft } from 'lucide-react';
import { ChartWrapper } from '@/components/ui/ChartWrapper';
import {
  PORTAL_ACCENT,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_REFERENCE_NEUTRAL,
  PORTAL_BAR_COLORS,
  CLASSIFICATION_BAR_COLORS,
} from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Shared trend-chart layer for the Admin (red) and Viewer (blue) portals.
 * One data shape, one chart implementation, one comparison widget — the
 * portals only differ in accent color and in how they produce TrendPoints.
 */
export interface TrendPoint {
  semester: string;
  inadCount: number;
  paxCount: number;
  density: number | null;
}

export type TrendAccent = 'red' | 'blue';

const ACCENTS: Record<
  TrendAccent,
  { stroke: string; barFill: string; focusSelect: string; focusButton: string }
> = {
  red: {
    stroke: PORTAL_ACCENT.red,
    barFill: PORTAL_BAR_COLORS.red.fill,
    focusSelect: 'border-neutral-300 focus:border-red-600 focus:ring-red-600',
    focusButton: 'focus:ring-red-600',
  },
  blue: {
    stroke: PORTAL_ACCENT.blue,
    barFill: PORTAL_BAR_COLORS.blue.fill,
    focusSelect: 'border-neutral-300 focus:border-blue-600 focus:ring-blue-600',
    focusButton: 'focus:ring-blue-600',
  },
};


/** Semester labels look like "2024 H1" — derive the month-range suffix. */
function semesterPeriod(label: string, janJun: string, julDec: string): string {
  return label.endsWith('H1') ? janJun : julDec;
}

// ---------------------------------------------------------------------------
// Tooltip with delta vs. previous semester
// ---------------------------------------------------------------------------

type ValueFormatter = (value: number) => string;

// recharts 3 injects active/payload/label at render time; its TooltipProps
// type omits them, so the content component declares what it actually receives.
interface DeltaTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string }>;
  label?: string | number;
  data: TrendPoint[];
  dataKey: keyof TrendPoint;
  seriesLabel: string;
  format: ValueFormatter;
  vsPreviousLabel: string;
}

function DeltaTooltip({
  active,
  payload,
  label,
  data,
  dataKey,
  seriesLabel,
  format,
  vsPreviousLabel,
}: DeltaTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0].value;
  if (typeof value !== 'number') return null;

  const index = data.findIndex((d) => d.semester === label);
  const previous = index > 0 ? data[index - 1][dataKey] : null;
  const delta =
    typeof previous === 'number' && previous !== 0
      ? ((value - previous) / previous) * 100
      : null;

  return (
    <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2 text-sm shadow-md">
      <p className="font-bold text-neutral-900">{label}</p>
      <p className="text-neutral-600">
        {seriesLabel}: <span className="font-semibold text-neutral-900">{format(value)}</span>
      </p>
      {delta !== null && (
        <p
          className={`text-xs mt-1 ${
            delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-neutral-400'
          }`}
        >
          {delta > 0 ? '+' : ''}
          {delta.toFixed(1)}% {vsPreviousLabel}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trend charts (INAD / PAX / density) with zoom brush + synced hover
// ---------------------------------------------------------------------------

interface TrendChartsProps {
  data: TrendPoint[];
  accent: TrendAccent;
}

export function TrendCharts({ data, accent }: TrendChartsProps) {
  const t = useTranslations('trends');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';
  const { stroke, barFill } = ACCENTS[accent];

  // One series for all three charts: semesters without BAZL data keep their
  // x-position but render as gaps (null), so the x-axes line up and the
  // brush/tooltip sync via syncId stays index-aligned across charts.
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        paxCount: d.paxCount > 0 ? d.paxCount : null,
      })),
    [data]
  );
  const hasPaxData = useMemo(() => data.some((d) => d.paxCount > 0), [data]);

  // Year-over-year change per semester (vs. the same half one year earlier),
  // which removes the strong seasonal H1/H2 pattern from the comparison.
  const yoyData = useMemo(() => {
    const byLabel = new Map(data.map((d) => [d.semester, d]));
    return data
      .map((d) => {
        const [yearStr, half] = d.semester.split(' ');
        const prev = byLabel.get(`${Number(yearStr) - 1} ${half}`);
        if (!prev || prev.inadCount === 0) return null;
        return {
          semester: d.semester,
          change: ((d.inadCount - prev.inadCount) / prev.inadCount) * 100,
        };
      })
      .filter((d): d is { semester: string; change: number } => d !== null);
  }, [data]);

  // Brush is only useful once the series is long enough to feel crowded.
  const showBrush = data.length > 8;
  const gradientId = `trendGradient-${accent}`;

  const xAxis = (
    <XAxis dataKey="semester" tick={CHART_AXIS_TICK} angle={-45} textAnchor="end" height={60} />
  );

  return (
    <>
      {/* INAD trend */}
      <ChartWrapper title={t('inadTrend')} subtitle={t('inadTrendDesc')}>
        <div className={showBrush ? 'h-80' : 'h-72'}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              syncId="casa-trends"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              {xAxis}
              <YAxis tick={{ ...CHART_AXIS_TICK, fontSize: 12 }} />
              <Tooltip
                content={
                  <DeltaTooltip
                    data={data}
                    dataKey="inadCount"
                    seriesLabel={t('refusals')}
                    format={(v) => v.toLocaleString(localeFormat)}
                    vsPreviousLabel={t('vsPrevious')}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="inadCount"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
              {showBrush && (
                <Brush
                  dataKey="semester"
                  height={24}
                  stroke={stroke}
                  travellerWidth={8}
                  fill="#fafafa"
                  startIndex={0}
                  endIndex={chartData.length - 1}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartWrapper>

      {/* PAX trend (only semesters with BAZL data) */}
      {hasPaxData && (
        <ChartWrapper title={t('passengerTrend')} subtitle={t('passengerTrendDesc')}>
          <div className={showBrush ? 'h-80' : 'h-72'}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                syncId="casa-trends"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={`${gradientId}-pax`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                {xAxis}
                <YAxis
                  tickFormatter={(value: number) => (value / 1_000_000).toFixed(1) + 'M'}
                  tick={{ ...CHART_AXIS_TICK, fontSize: 12 }}
                />
                <Tooltip
                  content={
                    <DeltaTooltip
                      data={data}
                      dataKey="paxCount"
                      seriesLabel={t('passengers')}
                      format={(v) => v.toLocaleString(localeFormat)}
                      vsPreviousLabel={t('vsPrevious')}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="paxCount"
                  stroke={stroke}
                  strokeWidth={2}
                  fill={`url(#${gradientId}-pax)`}
                />
                {showBrush && (
                  <Brush
                    dataKey="semester"
                    height={24}
                    stroke={stroke}
                    travellerWidth={8}
                    fill="#fafafa"
                    startIndex={0}
                    endIndex={chartData.length - 1}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      )}

      {/* Density trend (only semesters with BAZL data) */}
      {hasPaxData && (
        <ChartWrapper title={t('densityTrend')} subtitle={t('densityTrendDesc')}>
          <div className={showBrush ? 'h-80' : 'h-72'}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                syncId="casa-trends"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                {xAxis}
                <YAxis
                  tickFormatter={(value: number) => value.toFixed(2) + '‰'}
                  tick={{ ...CHART_AXIS_TICK, fontSize: 12 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={
                    <DeltaTooltip
                      data={data}
                      dataKey="density"
                      seriesLabel={t('density')}
                      format={(v) => v.toFixed(4) + '‰'}
                      vsPreviousLabel={t('vsPrevious')}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="density"
                  stroke={stroke}
                  strokeWidth={3}
                  dot={{ fill: stroke, strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: stroke, strokeWidth: 0, r: 6 }}
                />
                {showBrush && (
                  <Brush
                    dataKey="semester"
                    height={24}
                    stroke={stroke}
                    travellerWidth={8}
                    fill="#fafafa"
                    startIndex={0}
                    endIndex={chartData.length - 1}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      )}

      {/* INAD vs. traffic volume: dual-axis combination of both measures.
          Shows whether INAD development merely follows traffic growth or
          diverges from it — the actual risk signal for the business. */}
      {hasPaxData && (
        <ChartWrapper title={t('inadVsPax')} subtitle={t('inadVsPaxDesc')}>
          <div className={showBrush ? 'h-80' : 'h-72'}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                syncId="casa-trends"
                margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                {xAxis}
                <YAxis
                  yAxisId="inad"
                  tick={{ ...CHART_AXIS_TICK, fontSize: 12 }}
                  label={{
                    value: t('refusals'),
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#737373' },
                  }}
                />
                <YAxis
                  yAxisId="pax"
                  orientation="right"
                  tickFormatter={(value: number) => (value / 1_000_000).toFixed(1) + 'M'}
                  tick={{ ...CHART_AXIS_TICK, fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                    name === 'inadCount' ? t('refusals') : t('passengers'),
                  ]}
                />
                <Bar
                  yAxisId="inad"
                  dataKey="inadCount"
                  fill={barFill}
                  stroke={stroke}
                  strokeWidth={1}
                  maxBarSize={18}
                />
                <Line
                  yAxisId="pax"
                  type="monotone"
                  dataKey="paxCount"
                  stroke={CHART_REFERENCE_NEUTRAL}
                  strokeWidth={2}
                  dot={false}
                />
                {showBrush && (
                  <Brush
                    dataKey="semester"
                    height={24}
                    stroke={stroke}
                    travellerWidth={8}
                    fill="#fafafa"
                    startIndex={0}
                    endIndex={chartData.length - 1}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 border"
                style={{ backgroundColor: barFill, borderColor: stroke }}
              />
              {t('refusals')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-4 h-0.5"
                style={{ backgroundColor: CHART_REFERENCE_NEUTRAL }}
              />
              {t('passengers')}
            </span>
          </div>
        </ChartWrapper>
      )}

      {/* Year-over-year change: same half vs. previous year, so the strong
          seasonal H1/H2 pattern does not distort the comparison. */}
      {yoyData.length >= 3 && (
        <ChartWrapper title={t('yoyChange')} subtitle={t('yoyChangeDesc')}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis
                  dataKey="semester"
                  tick={CHART_AXIS_TICK}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
                  tick={{ ...CHART_AXIS_TICK, fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value) => [
                    typeof value === 'number'
                      ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
                      : '–',
                    t('yoyTooltipLabel'),
                  ]}
                />
                <ReferenceLine y={0} stroke={CHART_REFERENCE_NEUTRAL} />
                <Bar dataKey="change" maxBarSize={18} radius={[2, 2, 0, 0]} strokeWidth={1}>
                  {yoyData.map((entry) => (
                    <Cell
                      key={entry.semester}
                      fill={entry.change > 0 ? CLASSIFICATION_BAR_COLORS.sanction.fill : CLASSIFICATION_BAR_COLORS.clear.fill}
                      stroke={entry.change > 0 ? CLASSIFICATION_BAR_COLORS.sanction.stroke : CLASSIFICATION_BAR_COLORS.clear.stroke}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Semester comparison (dropdowns + swap + KPI cards)
// ---------------------------------------------------------------------------

function TrendIndicator({
  value,
  invertColors = false,
}: {
  value: number;
  invertColors?: boolean;
}) {
  if (Math.abs(value) < 0.1) {
    return <Minus className="w-4 h-4 text-neutral-400" />;
  }
  const isPositive = value > 0;
  const showRed = invertColors ? isPositive : !isPositive;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return <Icon className={`w-4 h-4 ${showRed ? 'text-red-600' : 'text-green-600'}`} />;
}

interface ComparisonCardProps {
  label: string;
  semester1: string;
  semester2: string;
  value1: string;
  value2: string;
  /** null = not comparable (e.g. one side has no PAX data) */
  trend: number | null;
  /** true when an increase is bad (INADs, density) */
  invertColors: boolean;
  noDataLabel: string;
}

function ComparisonCard({
  label,
  semester1,
  semester2,
  value1,
  value2,
  trend,
  invertColors,
  noDataLabel,
}: ComparisonCardProps) {
  const trendColor =
    trend === null
      ? 'text-neutral-400'
      : trend === 0
      ? 'text-neutral-400'
      : (trend > 0) === invertColors
      ? 'text-red-600'
      : 'text-green-600';

  return (
    <div className="bg-white border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {trend !== null ? (
            <>
              <TrendIndicator value={trend} invertColors={invertColors} />
              <span className={`text-xs font-medium ${trendColor}`}>
                {trend > 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-neutral-400">{noDataLabel}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-neutral-500">{semester1}</span>
          <span className="text-lg font-semibold text-neutral-700">{value1}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-neutral-500">{semester2}</span>
          <span className="text-2xl font-bold text-neutral-900">{value2}</span>
        </div>
      </div>
    </div>
  );
}

interface SemesterComparisonProps {
  data: TrendPoint[];
  accent: TrendAccent;
}

export function SemesterComparison({ data, accent }: SemesterComparisonProps) {
  const t = useTranslations('trends');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';
  const { focusSelect, focusButton } = ACCENTS[accent];

  const [compareSemester1, setCompareSemester1] = useState<string | null>(null);
  const [compareSemester2, setCompareSemester2] = useState<string | null>(null);

  // Default to the two most recent semesters that have PAX data, so the
  // initial view never compares against a half-imported semester (which
  // would show a misleading "-100%" PAX trend).
  const { defaultSemester1, defaultSemester2 } = useMemo(() => {
    const complete = data.filter((d) => d.paxCount > 0);
    const pool = complete.length >= 2 ? complete : data;
    return {
      defaultSemester1: pool.length >= 2 ? pool[pool.length - 2].semester : null,
      defaultSemester2: pool.length >= 1 ? pool[pool.length - 1].semester : null,
    };
  }, [data]);

  const selectedSemester1 = compareSemester1 ?? defaultSemester1;
  const selectedSemester2 = compareSemester2 ?? defaultSemester2;

  const comparison = useMemo(() => {
    const s1 = data.find((d) => d.semester === selectedSemester1);
    const s2 = data.find((d) => d.semester === selectedSemester2);
    if (!s1 || !s2) return null;

    const calcTrend = (current: number, previous: number): number | null => {
      if (previous === 0) return null;
      return ((current - previous) / previous) * 100;
    };

    const bothHavePax = s1.paxCount > 0 && s2.paxCount > 0;

    return {
      s1,
      s2,
      paxTrend: bothHavePax ? calcTrend(s2.paxCount, s1.paxCount) : null,
      inadTrend: calcTrend(s2.inadCount, s1.inadCount),
      densityTrend:
        bothHavePax && s1.density != null && s2.density != null && s1.density !== 0
          ? ((s2.density - s1.density) / s1.density) * 100
          : null,
    };
  }, [data, selectedSemester1, selectedSemester2]);

  if (data.length < 2) return null;

  const semester1Options = data.filter((d) => d.semester !== selectedSemester2);
  const semester2Options = data.filter((d) => d.semester !== selectedSemester1);

  const formatDensity = (density: number | null) =>
    density != null ? `${density.toFixed(3)}‰` : '–';

  return (
    <div className="bg-neutral-50 border border-neutral-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-neutral-900">{t('semesterComparison')}</h4>
          <p className="text-sm text-neutral-600 mt-1">{t('semesterComparisonDesc')}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            {t('referenceSemester')}
          </label>
          <Select value={selectedSemester1 || ''} onValueChange={setCompareSemester1}>
            <SelectTrigger className={`w-full ${focusSelect}`}>
              <SelectValue placeholder={t('selectSemester')} />
            </SelectTrigger>
            <SelectContent>
              {semester1Options.map((d) => (
                <SelectItem key={d.semester} value={d.semester}>
                  {d.semester} ({semesterPeriod(d.semester, t('janJun'), t('julDec'))})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => {
            setCompareSemester1(selectedSemester2);
            setCompareSemester2(selectedSemester1);
          }}
          className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${focusButton}`}
          title={t('swapSemesters')}
          aria-label={t('swapSemesters')}
        >
          <ArrowRightLeft className="w-4 h-4 text-neutral-600" aria-hidden="true" />
        </button>

        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            {t('comparisonSemester')}
          </label>
          <Select value={selectedSemester2 || ''} onValueChange={setCompareSemester2}>
            <SelectTrigger className={`w-full ${focusSelect}`}>
              <SelectValue placeholder={t('selectSemester')} />
            </SelectTrigger>
            <SelectContent>
              {semester2Options.map((d) => (
                <SelectItem key={d.semester} value={d.semester}>
                  {d.semester} ({semesterPeriod(d.semester, t('janJun'), t('julDec'))})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComparisonCard
            label={t('passengers')}
            semester1={comparison.s1.semester}
            semester2={comparison.s2.semester}
            value1={comparison.s1.paxCount > 0 ? comparison.s1.paxCount.toLocaleString(localeFormat) : '–'}
            value2={comparison.s2.paxCount > 0 ? comparison.s2.paxCount.toLocaleString(localeFormat) : '–'}
            trend={comparison.paxTrend}
            invertColors={false}
            noDataLabel={t('noPaxData')}
          />
          <ComparisonCard
            label={t('inadCases')}
            semester1={comparison.s1.semester}
            semester2={comparison.s2.semester}
            value1={comparison.s1.inadCount.toLocaleString(localeFormat)}
            value2={comparison.s2.inadCount.toLocaleString(localeFormat)}
            trend={comparison.inadTrend}
            invertColors
            noDataLabel={t('noPaxData')}
          />
          <ComparisonCard
            label={t('density')}
            semester1={comparison.s1.semester}
            semester2={comparison.s2.semester}
            value1={formatDensity(comparison.s1.density)}
            value2={formatDensity(comparison.s2.density)}
            trend={comparison.densityTrend}
            invertColors
            noDataLabel={t('noPaxData')}
          />
        </div>
      )}
    </div>
  );
}
