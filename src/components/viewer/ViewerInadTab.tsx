'use client';

import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import { FileWarning, MapPin, Plane, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from 'recharts';
import { ChartWrapper } from '@/components/ui/ChartWrapper';

export function ViewerInadTab() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('viewer');
  const tInad = useTranslations('inad');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  if (!publishedData) return null;

  const { summary, top10, trends, metadata, routes } = publishedData;

  // Get previous semester for comparison
  const currentIndex = trends.findIndex(t => t.semester === metadata.semester);
  const prevSemester = currentIndex > 0 ? trends[currentIndex - 1] : null;
  const inadChange = prevSemester
    ? ((summary.totalInads - prevSemester.inadCount) / prevSemester.inadCount) * 100
    : null;

  // Color palette for charts (blue tones for viewer portal)
  const colors = [
    '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
    '#1D4ED8', '#1E40AF', '#1E3A8A', '#3730A3', '#4F46E5',
  ];

  // Pie chart colors for included/excluded distribution
  const pieColors = ['#DC2626', '#737373'];

  // Prepare data for INAD trend line chart
  const trendChartData = [...trends].map(t => ({
    semester: t.semester,
    inads: t.inadCount,
    density: t.density,
  }));

  // Prepare top 10 data for bar charts
  const top10LastStopsData = top10.lastStops.map(item => ({
    name: item.name,
    count: item.count,
  }));

  const top10AirlinesData = top10.airlines.map(item => ({
    name: item.code,
    count: item.count,
    fullName: item.name,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <FileWarning className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">{tInad('title')}</h2>
          <p className="text-sm text-neutral-500">{t('inadDescription')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileWarning className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('totalInads')}
            </span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {summary.totalInads.toLocaleString(localeFormat)}
          </p>
          <p className="text-sm text-neutral-500 mt-1">{metadata.semester}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('inadChange')}
            </span>
          </div>
          {inadChange !== null ? (
            <>
              <p className={`text-3xl font-bold ${inadChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {inadChange >= 0 ? '+' : ''}{inadChange.toFixed(1)}%
              </p>
              <p className="text-sm text-neutral-500 mt-1">{t('vsPrevious')}</p>
            </>
          ) : (
            <p className="text-3xl font-bold text-neutral-400">–</p>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Plane className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('airlinesTotal')}
            </span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {summary.airlinesAnalyzed}
          </p>
          <p className="text-sm text-neutral-500 mt-1">{t('withInads')}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('routesTotal')}
            </span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {summary.routesAnalyzed}
          </p>
          <p className="text-sm text-neutral-500 mt-1">{t('analyzed')}</p>
        </div>
      </div>

      {/* Included vs Excluded Distribution Pie Chart */}
      <ChartWrapper title={tInad('distribution')} subtitle={tInad('distributionSubtitle')}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: tInad('includedLabel'), value: summary.includedInads ?? summary.totalInads },
                    { name: tInad('excludedLabel'), value: summary.excludedInads ?? 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                    tInad('cases'),
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-600" />
              <div>
                <p className="font-medium text-neutral-900">{tInad('includedLabel')}</p>
                <p className="text-sm text-neutral-500">
                  {tInad('includedDescription', { count: (summary.includedInads ?? summary.totalInads).toLocaleString(localeFormat) })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-neutral-500" />
              <div>
                <p className="font-medium text-neutral-900">{tInad('excludedLabel')}</p>
                <p className="text-sm text-neutral-500">
                  {tInad('excludedDescription', { count: (summary.excludedInads ?? 0).toLocaleString(localeFormat) })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ChartWrapper>

      {/* INAD Trend Chart */}
      <ChartWrapper title={t('inadTrend')} subtitle={t('inadTrendDesc')}>
        {trendChartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="semester"
                  tick={{ fontSize: 11, fill: '#171717' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                    name === 'inads' ? t('inads') : t('density'),
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inads"
                  stroke="#DC2626"
                  strokeWidth={2}
                  dot={{ fill: '#DC2626', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-neutral-400">
            {tInad('noDataAvailable')}
          </div>
        )}
      </ChartWrapper>

      {/* Density Trend Chart */}
      <ChartWrapper title={t('densityTrend')} subtitle={t('densityTrendDesc')}>
        {trendChartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="semester"
                  tick={{ fontSize: 11, fill: '#171717' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#737373' }}
                  tickFormatter={(value) => `${value.toFixed(4)}‰`}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === 'number' ? `${value.toFixed(4)}‰` : '–',
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
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-neutral-400">
            {tInad('noDataAvailable')}
          </div>
        )}
      </ChartWrapper>

      {/* Top 10 Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Last Stops */}
        <ChartWrapper title={t('top10LastStops')} subtitle={t('top10LastStopsDesc')}>
          {top10LastStopsData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10LastStopsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#171717' }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value) => [
                      typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                      t('inads'),
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {top10LastStopsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-400">
              {tInad('noDataAvailable')}
            </div>
          )}
        </ChartWrapper>

        {/* Top 10 Airlines */}
        <ChartWrapper title={t('top10Airlines')} subtitle={t('top10AirlinesDesc')}>
          {top10AirlinesData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10AirlinesData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#171717' }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [
                      typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                      (props as { payload?: { fullName?: string } }).payload?.fullName || t('inads'),
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {top10AirlinesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-400">
              {tInad('noDataAvailable')}
            </div>
          )}
        </ChartWrapper>
      </div>
    </div>
  );
}
