'use client';

import { useMemo } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  TrendCharts,
  SemesterComparison,
  type TrendPoint,
} from '@/components/charts/TrendCharts';

export function TrendsTab() {
  const { inadData, bazlData, availableSemesters } = useAnalysisStore();
  const t = useTranslations('trends');

  // Aggregate the raw uploads into one TrendPoint per semester (oldest first)
  const trendData = useMemo((): TrendPoint[] => {
    if (!inadData || !bazlData || availableSemesters.length === 0) {
      return [];
    }

    const sortedSemesters = [...availableSemesters].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.half - b.half;
    });

    return sortedSemesters.map((semester) => {
      const startMonth = semester.half === 1 ? 1 : 7;
      const endMonth = semester.half === 1 ? 6 : 12;

      const inadCount = inadData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= startMonth &&
          r.month <= endMonth &&
          r.included
      ).length;

      const paxCount = bazlData
        .filter(
          (r) =>
            r.year === semester.year &&
            r.month >= startMonth &&
            r.month <= endMonth
        )
        .reduce((sum, r) => sum + r.pax, 0);

      const density =
        paxCount > 0 ? Number(((inadCount / paxCount) * 1000).toFixed(4)) : null;

      return { semester: semester.label, inadCount, paxCount, density };
    });
  }, [inadData, bazlData, availableSemesters]);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">{t('title')}</h3>
          <p className="text-sm text-neutral-500 mt-1">
            {t('subtitle', {
              count: trendData.length,
              from: trendData[0]?.semester,
              to: trendData[trendData.length - 1]?.semester,
            })}
          </p>
        </div>
      </div>

      <SemesterComparison data={trendData} accent="red" />
      <TrendCharts data={trendData} accent="red" />
    </div>
  );
}
