'use client';

import { useMemo } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Step3Result } from '@/lib/analysis/types';
import { getStep3Summary } from '@/lib/analysis/step3';
import { PRIORITY_LABELS } from '@/lib/analysis/constants';
import { useTranslations, useLocale } from 'next-intl';

// Priority order for sorting (above threshold first, then below)
const PRIORITY_ORDER: Record<string, number> = {
  HIGH_PRIORITY: 0,
  WATCH_LIST: 1,
  CLEAR: 2,
  UNRELIABLE: 3,
};

function exportToCSV(data: Step3Result[], threshold: number) {
  const headers = ['Airline', 'Last Stop', 'INAD Count', 'PAX', 'Density (‰)', 'Priority'];
  const rows = data.map((row) => [
    row.airline,
    row.lastStop,
    row.inadCount.toString(),
    row.pax.toString(),
    row.density?.toFixed(3) || 'N/A',
    PRIORITY_LABELS[row.priority],
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    `Threshold,${threshold.toFixed(3)}‰`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `inad_analysis_step3_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function Step3Density() {
  const t = useTranslations('steps.step3');
  const tTable = useTranslations('table');
  const tPriority = useTranslations('priority');
  const locale = useLocale();
  const { step3Results, threshold, config } = useAnalysisStore();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  if (!step3Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('noData')}
      </div>
    );
  }

  const summary = getStep3Summary(step3Results, threshold || 0);

  // Sort data by priority: above threshold first (HIGH_PRIORITY, WATCH_LIST), then below (CLEAR, UNRELIABLE)
  const sortedResults = useMemo(() => {
    return [...step3Results].sort((a, b) => {
      const orderA = PRIORITY_ORDER[a.priority] ?? 99;
      const orderB = PRIORITY_ORDER[b.priority] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      // Secondary sort by density (descending) within same priority
      return (b.density ?? 0) - (a.density ?? 0);
    });
  }, [step3Results]);

  // Find the index of the last "above threshold" row (HIGH_PRIORITY or WATCH_LIST)
  const lastAboveThresholdIndex = useMemo(() => {
    for (let i = sortedResults.length - 1; i >= 0; i--) {
      if (sortedResults[i].priority === 'HIGH_PRIORITY' || sortedResults[i].priority === 'WATCH_LIST') {
        return i;
      }
    }
    return -1;
  }, [sortedResults]);

  const columns: Column<Step3Result>[] = [
    {
      key: 'airline',
      header: tTable('airline'),
      sortable: true,
    },
    {
      key: 'lastStop',
      header: tTable('lastStop'),
      sortable: true,
    },
    {
      key: 'inadCount',
      header: tTable('inads'),
      sortable: true,
      align: 'right',
    },
    {
      key: 'pax',
      header: tTable('pax'),
      sortable: true,
      align: 'right',
      render: (row) => row.pax.toLocaleString(localeFormat),
    },
    {
      key: 'density',
      header: t('densityUnit'),
      sortable: true,
      align: 'right',
      render: (row) => (row.density !== null ? row.density.toFixed(3) : t('notAvailable')),
    },
    {
      key: 'priority',
      header: tTable('category'),
      align: 'center',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
  ];

  const getRowClassName = (row: Step3Result, index: number) => {
    const classes: string[] = [];

    // Background color based on priority
    switch (row.priority) {
      case 'HIGH_PRIORITY':
        classes.push('bg-red-50');
        break;
      case 'WATCH_LIST':
        classes.push('bg-orange-50');
        break;
      case 'UNRELIABLE':
        classes.push('bg-slate-50');
        break;
    }

    // Add separator line after the last above-threshold row
    if (index === lastAboveThresholdIndex && lastAboveThresholdIndex >= 0) {
      classes.push('border-b-4 border-b-red-600');
    }

    return classes.join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-2">{t('title')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('description')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(step3Results, threshold || 0)}
          >
            {t('csvExport')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            <strong>{summary.totalRoutes}</strong> {t('routes')}
          </span>
          <span className="text-red-700">
            <strong>{summary.highPriority}</strong> {tPriority('sanction')}
          </span>
          <span className="text-orange-700">
            <strong>{summary.watchList}</strong> {tPriority('watchList')}
          </span>
          <span className="text-green-700">
            <strong>{summary.clear}</strong> {tPriority('clear')}
          </span>
          <span className="text-slate-600">
            <strong>{summary.unreliable}</strong> {tPriority('unreliable')}
          </span>
        </div>
      </div>

      {/* Klassifizierungskriterien */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 text-sm">{t('classificationCriteria')}</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <PriorityBadge priority="HIGH_PRIORITY" />
              <span className="text-muted-foreground">
                {t('densityUnit')} ≥ {(threshold || 0) * config.highPriorityMultiplier > 0
                  ? `${((threshold || 0) * config.highPriorityMultiplier).toFixed(3)}‰`
                  : `${config.highPriorityMultiplier}× Threshold`}
                , ≥ {config.minDensity}‰, ≥ {config.highPriorityMinInad} INADs
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="WATCH_LIST" />
              <span className="text-muted-foreground">
                {t('densityUnit')} ≥ {threshold?.toFixed(3) || 0}‰ (Threshold)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="CLEAR" />
              <span className="text-muted-foreground">
                {t('densityUnit')} &lt; Threshold
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="UNRELIABLE" />
              <span className="text-muted-foreground">
                PAX &lt; {config.minPax.toLocaleString(localeFormat)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={sortedResults}
        columns={columns}
        getRowKey={(row) => `${row.airline}-${row.lastStop}`}
        rowClassName={getRowClassName}
        emptyMessage={t('noRoutes')}
      />
    </div>
  );
}
