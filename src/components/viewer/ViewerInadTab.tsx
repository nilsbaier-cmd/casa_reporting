'use client';

import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import { FileWarning, MapPin, Plane, TrendingUp } from 'lucide-react';

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

      {/* Top 10 Lists */}
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
            <div className="space-y-3">
              {top10.lastStops.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-bold text-neutral-600">
                      {index + 1}
                    </span>
                    <span className="font-medium text-neutral-900">{item.name}</span>
                  </div>
                  <span className="font-semibold text-neutral-700">{item.count}</span>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {top10.airlines.map((item, index) => (
                <div key={item.code} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-bold text-neutral-600">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-medium text-neutral-900">{item.code}</span>
                      <span className="text-neutral-500 ml-2 text-sm">{item.name}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-neutral-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* INAD Trend Table */}
      <section className="bg-white border border-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-900">{t('inadTrend')}</h3>
          <p className="text-sm text-neutral-500 mt-1">{t('inadTrendDesc')}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('semester')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('inads')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('passengers')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('density')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {[...trends].reverse().map((trend) => (
                <tr
                  key={trend.semester}
                  className={trend.semester === metadata.semester ? 'bg-blue-50' : 'hover:bg-neutral-50'}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900">{trend.semester}</span>
                    {trend.semester === metadata.semester && (
                      <span className="ml-2 text-xs text-blue-600 font-medium">{t('current')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {trend.inadCount.toLocaleString(localeFormat)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">
                    {trend.paxCount.toLocaleString(localeFormat)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {trend.density !== null ? `${trend.density.toFixed(4)}‰` : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
