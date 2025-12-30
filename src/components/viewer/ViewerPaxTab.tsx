'use client';

import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import { Users, TrendingUp, Calendar } from 'lucide-react';

export function ViewerPaxTab() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('viewer');
  const tPax = useTranslations('pax');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  if (!publishedData) return null;

  const { summary, trends, metadata } = publishedData;

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

      {/* PAX Trend Table */}
      <section className="bg-white border border-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-900">{t('paxTrend')}</h3>
          <p className="text-sm text-neutral-500 mt-1">{t('paxTrendDesc')}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('semester')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('passengers')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('inads')}
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
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {trend.paxCount.toLocaleString(localeFormat)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">
                    {trend.inadCount.toLocaleString(localeFormat)}
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
