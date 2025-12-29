'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { TrendingUp, TrendingDown, Minus, BarChart3, Info } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SemesterData {
  semester: string;
  year: number;
  half: 1 | 2;
  pax: number;
  inad: number;
  density: number;
}

export function TrendsTab() {
  const { inadData, bazlData, availableSemesters } = useAnalysisStore();
  const t = useTranslations('trends');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  // State for semester comparison selection
  const [compareSemester1, setCompareSemester1] = useState<string | null>(null);
  const [compareSemester2, setCompareSemester2] = useState<string | null>(null);

  // Calculate time series data for all semesters
  const trendData = useMemo((): SemesterData[] => {
    if (!inadData || !bazlData || availableSemesters.length === 0) {
      return [];
    }

    // Sort semesters chronologically (oldest first)
    const sortedSemesters = [...availableSemesters].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.half - b.half;
    });

    return sortedSemesters.map((semester) => {
      const startMonth = semester.half === 1 ? 1 : 7;
      const endMonth = semester.half === 1 ? 6 : 12;

      // Filter INAD data
      const semesterInad = inadData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= startMonth &&
          r.month <= endMonth &&
          r.included
      );

      // Filter BAZL data
      const semesterBazl = bazlData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= startMonth &&
          r.month <= endMonth
      );

      const inadCount = semesterInad.length;
      const paxCount = semesterBazl.reduce((sum, r) => sum + r.pax, 0);
      const density = paxCount > 0 ? (inadCount / paxCount) * 1000 : 0;

      return {
        semester: semester.label,
        year: semester.year,
        half: semester.half,
        pax: paxCount,
        inad: inadCount,
        density: Number(density.toFixed(4)),
      };
    });
  }, [inadData, bazlData, availableSemesters]);

  // Initialize default comparison (current vs previous semester)
  useEffect(() => {
    if (trendData.length >= 2 && !compareSemester1 && !compareSemester2) {
      // Default: compare last two semesters (previous = semester1, current = semester2)
      setCompareSemester1(trendData[trendData.length - 2].semester);
      setCompareSemester2(trendData[trendData.length - 1].semester);
    }
  }, [trendData, compareSemester1, compareSemester2]);

  // Filter data for PAX/Density charts (only show semesters with PAX data)
  const paxTrendData = useMemo(() => {
    return trendData.filter(d => d.pax > 0);
  }, [trendData]);

  // Get comparison data
  const comparisonData = useMemo(() => {
    const semester1Data = trendData.find(d => d.semester === compareSemester1);
    const semester2Data = trendData.find(d => d.semester === compareSemester2);

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
      paxTrend: calcTrend(semester2Data.pax, semester1Data.pax),
      inadTrend: calcTrend(semester2Data.inad, semester1Data.inad),
      densityTrend: calcTrend(semester2Data.density, semester1Data.density),
    };
  }, [trendData, compareSemester1, compareSemester2]);

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) {
      return <Minus className="w-4 h-4 text-neutral-400" />;
    }
    if (value > 0) {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    }
    return <TrendingDown className="w-4 h-4 text-green-600" />;
  };

  if (!inadData || !bazlData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">{t('noData')}</p>
        <p className="text-sm mt-1">{t('noDataHint')}</p>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">{t('noTrendData')}</p>
        <p className="text-sm mt-1">{t('noTrendDataHint')}</p>
      </div>
    );
  }

  // Get latest values for overall trend display
  const latest = trendData[trendData.length - 1];

  // Get available options for each dropdown (excluding the other selected value)
  const semester1Options = trendData.filter(d => d.semester !== compareSemester2);
  const semester2Options = trendData.filter(d => d.semester !== compareSemester1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">{t('title')}</h3>
          <p className="text-sm text-neutral-500 mt-1">
            {t('subtitle', { count: trendData.length, from: trendData[0]?.semester, to: latest?.semester })}
          </p>
        </div>
      </div>

      {/* Semester Comparison Section */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
              {t('referenceSemester')}
            </label>
            <Select
              value={compareSemester1 || ''}
              onValueChange={setCompareSemester1}
            >
              <SelectTrigger className="w-full border-neutral-300 focus:border-red-600 focus:ring-red-600">
                <SelectValue placeholder={t('selectSemester')} />
              </SelectTrigger>
              <SelectContent>
                {semester1Options.map((semester) => (
                  <SelectItem key={semester.semester} value={semester.semester}>
                    {semester.semester} ({semester.half === 1 ? t('janJun') : t('julDec')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
              {t('comparisonSemester')}
            </label>
            <Select
              value={compareSemester2 || ''}
              onValueChange={setCompareSemester2}
            >
              <SelectTrigger className="w-full border-neutral-300 focus:border-red-600 focus:ring-red-600">
                <SelectValue placeholder={t('selectSemester')} />
              </SelectTrigger>
              <SelectContent>
                {semester2Options.map((semester) => (
                  <SelectItem key={semester.semester} value={semester.semester}>
                    {semester.semester} ({semester.half === 1 ? t('janJun') : t('julDec')})
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
                      comparisonData.paxTrend > 0 ? 'text-red-600' : comparisonData.paxTrend < 0 ? 'text-green-600' : 'text-neutral-400'
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
                    {comparisonData.semester1.pax.toLocaleString(localeFormat)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-neutral-500">{comparisonData.semester2.semester}</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {comparisonData.semester2.pax.toLocaleString(localeFormat)}
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
                  <TrendIndicator value={comparisonData.inadTrend} />
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
                    {comparisonData.semester1.inad.toLocaleString(localeFormat)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-neutral-500">{comparisonData.semester2.semester}</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {comparisonData.semester2.inad.toLocaleString(localeFormat)}
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
                <div className="flex items-center gap-1">
                  <TrendIndicator value={comparisonData.densityTrend} />
                  <span
                    className={`text-xs font-medium ${
                      comparisonData.densityTrend > 0 ? 'text-red-600' : comparisonData.densityTrend < 0 ? 'text-green-600' : 'text-neutral-400'
                    }`}
                  >
                    {comparisonData.densityTrend > 0 ? '+' : ''}{comparisonData.densityTrend.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-neutral-500">{comparisonData.semester1.semester}</span>
                  <span className="text-lg font-semibold text-neutral-700">
                    {comparisonData.semester1.density.toFixed(3)}‰
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-neutral-500">{comparisonData.semester2.semester}</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {comparisonData.semester2.density.toFixed(3)}‰
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Passenger Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          {t('passengerTrend')}
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          {t('passengerTrendDesc')}
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={paxTrendData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="paxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
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
                formatter={(value) => [typeof value === 'number' ? value.toLocaleString(localeFormat) : '–', t('passengers')]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Area
                type="monotone"
                dataKey="pax"
                stroke="#DC2626"
                strokeWidth={2}
                fill="url(#paxGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INAD Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          {t('inadTrend')}
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          {t('inadTrendDesc')}
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="inadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
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
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <Tooltip
                formatter={(value) => [typeof value === 'number' ? value.toLocaleString(localeFormat) : '–', t('refusals')]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Area
                type="monotone"
                dataKey="inad"
                stroke="#DC2626"
                strokeWidth={2}
                fill="url(#inadGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Density Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          {t('densityTrend')}
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          {t('densityTrendDesc')}
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={paxTrendData}
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
                formatter={(value) => [typeof value === 'number' ? value.toFixed(4) + '‰' : '–', t('density')]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Line
                type="monotone"
                dataKey="density"
                stroke="#DC2626"
                strokeWidth={3}
                dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#DC2626', strokeWidth: 0, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
