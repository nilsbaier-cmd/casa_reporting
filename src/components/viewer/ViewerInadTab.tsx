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
} from 'recharts';

export function ViewerInadTab() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('viewer');
  const tInad = useTranslations('inad');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  if (!publishedData) return null;

  const { summary, top10, trends, metadata } = publishedData;

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

      {/* INAD Trend Chart */}
      <section className="bg-white border border-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-900">{t('inadTrend')}</h3>
          <p className="text-sm text-neutral-500 mt-1">{t('inadTrendDesc')}</p>
        </div>
        <div className="p-6">
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
        </div>
      </section>

      {/* Density Trend Chart */}
      <section className="bg-white border border-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-900">{t('densityTrend')}</h3>
          <p className="text-sm text-neutral-500 mt-1">{t('densityTrendDesc')}</p>
        </div>
        <div className="p-6">
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
        </div>
      </section>

      {/* Top 10 Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Last Stops */}
        <section className="bg-white border border-neutral-200">
          <div className="border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-neutral-600" />
              <h3 className="text-lg font-bold text-neutral-900">{t('top10LastStops')}</h3>
            </div>
            <p className="text-sm text-neutral-500 mt-1">{t('top10LastStopsDesc')}</p>
          </div>
          <div className="p-6">
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
          </div>
        </section>

        {/* Top 10 Airlines */}
        <section className="bg-white border border-neutral-200">
          <div className="border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-neutral-600" />
              <h3 className="text-lg font-bold text-neutral-900">{t('top10Airlines')}</h3>
            </div>
            <p className="text-sm text-neutral-500 mt-1">{t('top10AirlinesDesc')}</p>
          </div>
          <div className="p-6">
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
          </div>
        </section>
      </div>
    </div>
  );
}
