'use client';

import { useMemo } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Plane, MapPin, TrendingUp, Users } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartWrapper } from '@/components/ui/ChartWrapper';

export function PaxTab() {
  const t = useTranslations('pax');
  const locale = useLocale();
  const { bazlData, selectedSemester } = useAnalysisStore();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  // Calculate aggregated data for the selected semester
  const { topLastStops, topAirlines, totalPax, uniqueRoutes } = useMemo(() => {
    if (!bazlData || !selectedSemester) {
      return { topLastStops: [], topAirlines: [], totalPax: 0, uniqueRoutes: 0 };
    }

    // Filter by semester
    const startMonth = selectedSemester.half === 1 ? 1 : 7;
    const endMonth = selectedSemester.half === 1 ? 6 : 12;
    const filtered = bazlData.filter(
      (r) => r.year === selectedSemester.year && r.month >= startMonth && r.month <= endMonth
    );

    // Aggregate by Last Stop (airport)
    const byLastStop = new Map<string, number>();
    for (const record of filtered) {
      const current = byLastStop.get(record.airport) || 0;
      byLastStop.set(record.airport, current + record.pax);
    }

    // Aggregate by Airline
    const byAirline = new Map<string, number>();
    for (const record of filtered) {
      const current = byAirline.get(record.airline) || 0;
      byAirline.set(record.airline, current + record.pax);
    }

    // Sort and take top 10
    const topLastStops = Array.from(byLastStop.entries())
      .map(([name, pax]) => ({ name, pax }))
      .sort((a, b) => b.pax - a.pax)
      .slice(0, 10);

    const topAirlines = Array.from(byAirline.entries())
      .map(([name, pax]) => ({ name, pax }))
      .sort((a, b) => b.pax - a.pax)
      .slice(0, 10);

    // Total passengers
    const totalPax = filtered.reduce((sum, r) => sum + r.pax, 0);

    // Unique routes (airline + airport combinations)
    const uniqueRoutes = new Set(filtered.map((r) => `${r.airline}-${r.airport}`)).size;

    return { topLastStops, topAirlines, totalPax, uniqueRoutes };
  }, [bazlData, selectedSemester]);

  // Color palette for charts
  const colors = [
    '#DC2626', '#E53935', '#EF5350', '#F44336', '#E57373',
    '#EF9A9A', '#FFCDD2', '#B71C1C', '#C62828', '#D32F2F',
  ];

  if (!bazlData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <Plane className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">{t('noData')}</p>
        <p className="text-sm mt-1">{t('noDataHint')}</p>
      </div>
    );
  }

  if (!selectedSemester) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <Plane className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">{t('noSemester')}</p>
        <p className="text-sm mt-1">{t('noSemesterHint')}</p>
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
            {t('subtitle', { semester: selectedSemester.label })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('passengers')}
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {totalPax.toLocaleString(localeFormat)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('routes')}
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {uniqueRoutes.toLocaleString(localeFormat)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('airlines')}
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {topAirlines.length > 0 ? new Set(bazlData.map((r) => r.airline)).size : 0}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('airports')}
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {topLastStops.length > 0 ? new Set(bazlData.map((r) => r.airport)).size : 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 10 Last Stops */}
        <ChartWrapper
          title={t('top10LastStops')}
          subtitle={t('top10LastStopsSubtitle')}
        >
          {topLastStops.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topLastStops}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => value.toLocaleString(localeFormat)}
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#171717' }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value) => [typeof value === 'number' ? value.toLocaleString(localeFormat) : '–', t('passengers')]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Bar dataKey="pax" radius={[0, 2, 2, 0]}>
                    {topLastStops.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-400">
              {t('noDataAvailable')}
            </div>
          )}
        </ChartWrapper>

        {/* Top 10 Airlines */}
        <ChartWrapper
          title={t('top10Airlines')}
          subtitle={t('top10AirlinesSubtitle')}
        >
          {topAirlines.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topAirlines}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => value.toLocaleString(localeFormat)}
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#171717' }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value) => [typeof value === 'number' ? value.toLocaleString(localeFormat) : '–', t('passengers')]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Bar dataKey="pax" radius={[0, 2, 2, 0]}>
                    {topAirlines.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-400">
              {t('noDataAvailable')}
            </div>
          )}
        </ChartWrapper>
      </div>
    </div>
  );
}
