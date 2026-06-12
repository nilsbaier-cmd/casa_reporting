'use client';

import { useMemo } from 'react';
import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations } from 'next-intl';
import { BarChart3 } from 'lucide-react';
import {
  TrendCharts,
  SemesterComparison,
  type TrendPoint,
} from '@/components/charts/TrendCharts';

const EMPTY_TRENDS: TrendPoint[] = [];

export function ViewerTrends() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('trends');

  // Published trends already match the TrendPoint shape
  const trends = useMemo(
    (): TrendPoint[] => publishedData?.trends ?? EMPTY_TRENDS,
    [publishedData]
  );

  if (trends.length === 0) {
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
              count: trends.length,
              from: trends[0]?.semester,
              to: trends[trends.length - 1]?.semester,
            })}
          </p>
        </div>
      </div>

      <SemesterComparison data={trends} accent="blue" />
      <TrendCharts data={trends} accent="blue" />
    </div>
  );
}
