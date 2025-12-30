'use client';

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
import { TrendingUp, BarChart3 } from 'lucide-react';

export function ViewerTrends() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('trends');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  if (!publishedData || !publishedData.trends || publishedData.trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">{t('noTrendData')}</p>
        <p className="text-sm mt-1">{t('noTrendDataHint')}</p>
      </div>
    );
  }

  const { trends } = publishedData;

  // Filter trends with PAX data for density/pax charts
  const trendsWithPax = trends.filter((t) => t.paxCount > 0);

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
