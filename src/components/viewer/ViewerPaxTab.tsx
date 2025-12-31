'use client';

import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import { Users, TrendingUp, Calendar, MapPin, Plane } from 'lucide-react';
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

export function ViewerPaxTab() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('viewer');
  const tPax = useTranslations('pax');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  if (!publishedData) return null;

  const { summary, trends, metadata, top10 } = publishedData;

  // Calculate average PAX per semester from trends
  const avgPax = trends.length > 0
    ? trends.reduce((sum, t) => sum + t.paxCount, 0) / trends.length
    : 0;

  // Get previous semester PAX for comparison
  const currentIndex = trends.findIndex(t => t.semester === metadata.semester);
  const prevSemester = currentIndex > 0 ? trends[currentIndex - 1] : null;
  const paxChange = prevSemester
    ? ((summary.totalPax - prevSemester.paxCount) / prevSemester.paxCount) * 100
    : null;

  // Color palette for charts (blue tones for viewer)
  const colors = [
    '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
    '#1D4ED8', '#1E40AF', '#1E3A8A', '#3730A3', '#4F46E5',
  ];

  // Prepare data for PAX trend line chart
  const trendChartData = [...trends].map(t => ({
    semester: t.semester,
    pax: t.paxCount,
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
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">{tPax('title')}</h2>
          <p className="text-sm text-neutral-500">{t('paxDescription')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('totalPax')}
            </span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {summary.totalPax.toLocaleString(localeFormat)}
          </p>
          <p className="text-sm text-neutral-500 mt-1">{metadata.semester}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('avgPax')}
            </span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {Math.round(avgPax).toLocaleString(localeFormat)}
          </p>
          <p className="text-sm text-neutral-500 mt-1">{t('perSemester')}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('paxChange')}
            </span>
          </div>
          {paxChange !== null ? (
            <>
              <p className={`text-3xl font-bold ${paxChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {paxChange >= 0 ? '+' : ''}{paxChange.toFixed(1)}%
              </p>
              <p className="text-sm text-neutral-500 mt-1">{t('vsPrevious')}</p>
            </>
          ) : (
            <p className="text-3xl font-bold text-neutral-400">–</p>
          )}
        </div>
      </div>

      {/* PAX Trend Chart */}
      <section className="bg-white border border-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-900">{t('paxTrend')}</h3>
          <p className="text-sm text-neutral-500 mt-1">{t('paxTrendDesc')}</p>
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
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      typeof value === 'number' ? value.toLocaleString(localeFormat) : '–',
                      tPax('passengers'),
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pax"
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
              {tPax('noDataAvailable')}
            </div>
          )}
        </div>
      </section>

      {/* Top 10 Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 10 Last Stops by PAX-related INADs */}
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
                {tPax('noDataAvailable')}
              </div>
            )}
          </div>
        </section>

        {/* Top 10 Airlines by PAX-related INADs */}
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
                {tPax('noDataAvailable')}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
