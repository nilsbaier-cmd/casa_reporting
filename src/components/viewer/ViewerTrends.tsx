'use client';

import { useState, useEffect, useMemo } from 'react';
import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
// Note: LineChart and Line are used in the density trend chart
import { TrendingUp, TrendingDown, Minus, BarChart3, Info, ArrowRightLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ViewerTrends() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('trends');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  // State for semester comparison selection
  const [compareSemester1, setCompareSemester1] = useState<string | null>(null);
  const [compareSemester2, setCompareSemester2] = useState<string | null>(null);

  // Early return for empty state - but we need to handle hooks properly
  const trends = publishedData?.trends || [];
  const hasTrends = trends.length > 0;

  // Filter trends with PAX data for density/pax charts
  const trendsWithPax = useMemo(() => trends.filter((t) => t.paxCount > 0), [trends]);

  // Initialize default comparison (current vs previous semester)
  useEffect(() => {
    if (trends.length >= 2 && !compareSemester1 && !compareSemester2) {
      // Default: compare last two semesters (previous = semester1, current = semester2)
      setCompareSemester1(trends[trends.length - 2].semester);
      setCompareSemester2(trends[trends.length - 1].semester);
    }
  }, [trends, compareSemester1, compareSemester2]);

  // Get comparison data
  const comparisonData = useMemo(() => {
    const semester1Data = trends.find(t => t.semester === compareSemester1);
    const semester2Data = trends.find(t => t.semester === compareSemester2);

    if (!semester1Data || !semester2Data) {
      return null;
    }

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      semester1: semester1Data,
      semester2: semester2Data,
      paxTrend: calcTrend(semester2Data.paxCount, semester1Data.paxCount),
      inadTrend: calcTrend(semester2Data.inadCount, semester1Data.inadCount),
      densityTrend: semester1Data.density && semester2Data.density
        ? calcTrend(semester2Data.density, semester1Data.density)
        : null,
    };
  }, [trends, compareSemester1, compareSemester2]);

  // Get available options for each dropdown (excluding the other selected value)
  const semester1Options = useMemo(() => trends.filter(t => t.semester !== compareSemester2), [trends, compareSemester2]);
  const semester2Options = useMemo(() => trends.filter(t => t.semester !== compareSemester1), [trends, compareSemester1]);

  const TrendIndicator = ({ value, invertColors = false }: { value: number; invertColors?: boolean }) => {
    if (Math.abs(value) < 0.1) {
      return <Minus className="w-4 h-4 text-neutral-400" />;
    }
    // For INAD: increase is bad (red), decrease is good (green)
    // For PAX: default colors (increase is good)
    const isPositive = value > 0;
    const showRed = invertColors ? isPositive : !isPositive;

    if (isPositive) {
      return <TrendingUp className={`w-4 h-4 ${showRed ? 'text-red-600' : 'text-green-600'}`} />;
    }
    return <TrendingDown className={`w-4 h-4 ${showRed ? 'text-red-600' : 'text-green-600'}`} />;
  };

  if (!hasTrends) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">{t('noTrendData')}</p>
        <p className="text-sm mt-1">{t('noTrendDataHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">{t('title')}</h3>
          <p className="text-sm text-neutral-500 mt-1">
            {t('subtitle', {
              count: trends.length,
              from: trends[0]?.semester,
              to: trends[trends.length - 1]?.semester,
            })}
          </p>
        </div>
      </div>

      {/* Semester Comparison Section */}
      {trends.length >= 2 && (
        <div className="bg-neutral-50 border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-neutral-900">{t('semesterComparison')}</h4>
              <p className="text-sm text-neutral-600 mt-1">
                {t('semesterComparisonDesc')}
              </p>
            </div>
          </div>

          {/* Semester Selection Dropdowns */}
          <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                {t('referenceSemester')}
              </label>
              <Select
                value={compareSemester1 || ''}
                onValueChange={setCompareSemester1}
              >
                <SelectTrigger className="w-full border-neutral-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder={t('selectSemester')} />
                </SelectTrigger>
                <SelectContent>
                  {semester1Options.map((semester) => (
                    <SelectItem key={semester.semester} value={semester.semester}>
                      {semester.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={() => {
                const temp = compareSemester1;
                setCompareSemester1(compareSemester2);
                setCompareSemester2(temp);
              }}
              className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              title={t('swapSemesters')}
              aria-label={t('swapSemesters')}
            >
              <ArrowRightLeft className="w-4 h-4 text-neutral-600" aria-hidden="true" />
            </button>

            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                {t('comparisonSemester')}
              </label>
              <Select
                value={compareSemester2 || ''}
                onValueChange={setCompareSemester2}
              >
                <SelectTrigger className="w-full border-neutral-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder={t('selectSemester')} />
                </SelectTrigger>
                <SelectContent>
                  {semester2Options.map((semester) => (
                    <SelectItem key={semester.semester} value={semester.semester}>
                      {semester.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison KPI Cards */}
          {comparisonData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Passengers Comparison */}
              <div className="bg-white border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    {t('passengers')}
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendIndicator value={comparisonData.paxTrend} />
                    <span
                      className={`text-xs font-medium ${
                        comparisonData.paxTrend > 0 ? 'text-green-600' : comparisonData.paxTrend < 0 ? 'text-red-600' : 'text-neutral-400'
                      }`}
                    >
                      {comparisonData.paxTrend > 0 ? '+' : ''}{comparisonData.paxTrend.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">{comparisonData.semester1.semester}</span>
                    <span className="text-lg font-semibold text-neutral-700">
                      {comparisonData.semester1.paxCount.toLocaleString(localeFormat)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">{comparisonData.semester2.semester}</span>
                    <span className="text-2xl font-bold text-neutral-900">
                      {comparisonData.semester2.paxCount.toLocaleString(localeFormat)}
                    </span>
                  </div>
                </div>
              </div>

              {/* INAD Cases Comparison */}
              <div className="bg-white border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    {t('inadCases')}
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendIndicator value={comparisonData.inadTrend} invertColors />
                    <span
                      className={`text-xs font-medium ${
                        comparisonData.inadTrend > 0 ? 'text-red-600' : comparisonData.inadTrend < 0 ? 'text-green-600' : 'text-neutral-400'
                      }`}
                    >
                      {comparisonData.inadTrend > 0 ? '+' : ''}{comparisonData.inadTrend.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">{comparisonData.semester1.semester}</span>
                    <span className="text-lg font-semibold text-neutral-700">
                      {comparisonData.semester1.inadCount.toLocaleString(localeFormat)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">{comparisonData.semester2.semester}</span>
                    <span className="text-2xl font-bold text-neutral-900">
                      {comparisonData.semester2.inadCount.toLocaleString(localeFormat)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Density Comparison */}
              <div className="bg-white border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    {t('density')}
                  </span>
                  {comparisonData.densityTrend !== null && (
                    <div className="flex items-center gap-1">
                      <TrendIndicator value={comparisonData.densityTrend} invertColors />
                      <span
                        className={`text-xs font-medium ${
                          comparisonData.densityTrend > 0 ? 'text-red-600' : comparisonData.densityTrend < 0 ? 'text-green-600' : 'text-neutral-400'
                        }`}
                      >
                        {comparisonData.densityTrend > 0 ? '+' : ''}{comparisonData.densityTrend.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">{comparisonData.semester1.semester}</span>
                    <span className="text-lg font-semibold text-neutral-700">
                      {comparisonData.semester1.density !== null ? `${comparisonData.semester1.density.toFixed(3)}‰` : '–'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">{comparisonData.semester2.semester}</span>
                    <span className="text-2xl font-bold text-neutral-900">
                      {comparisonData.semester2.density !== null ? `${comparisonData.semester2.density.toFixed(3)}‰` : '–'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INAD Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">{t('inadTrend')}</h4>
        <p className="text-sm text-neutral-500 mb-6">{t('inadTrendDesc')}</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="inadGradientViewer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: '#737373' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#737373' }} />
              <Tooltip
                formatter={(value) => [
                  typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                  t('refusals'),
                ]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Area
                type="monotone"
                dataKey="inadCount"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#inadGradientViewer)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Passenger Trend Chart */}
      {trendsWithPax.length > 0 && (
        <div className="bg-white border border-neutral-200 p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-1">{t('passengerTrend')}</h4>
          <p className="text-sm text-neutral-500 mb-6">{t('passengerTrendDesc')}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendsWithPax}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="paxGradientViewer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="semester"
                  tick={{ fontSize: 11, fill: '#737373' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'}
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                    t('passengers'),
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="paxCount"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#paxGradientViewer)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Density Trend Chart */}
      {trendsWithPax.length > 0 && (
        <div className="bg-white border border-neutral-200 p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-1">{t('densityTrend')}</h4>
          <p className="text-sm text-neutral-500 mb-6">{t('densityTrendDesc')}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendsWithPax}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="semester"
                  tick={{ fontSize: 11, fill: '#737373' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(value) => value.toFixed(2) + '‰'}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === 'number' ? value.toFixed(4) + '‰' : '–',
                    t('density'),
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="density"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: '#2563EB', strokeWidth: 0, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
