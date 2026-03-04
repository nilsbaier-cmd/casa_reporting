'use client';

import { useMemo, useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Step3Result } from '@/lib/analysis/types';
import { getStep3Summary } from '@/lib/analysis/step3';
import { PRIORITY_LABELS } from '@/lib/analysis/constants';
import { toSafeCsvField } from '@/lib/csv';
import { useTranslations, useLocale } from 'next-intl';

// Priority order for sorting (above threshold first, then below)
const PRIORITY_ORDER: Record<string, number> = {
  HIGH_PRIORITY: 0,
  WATCH_LIST: 1,
  CLEAR: 2,
};
const EMPTY_STEP3_RESULTS: Step3Result[] = [];

function exportToCSV(data: Step3Result[], threshold: number) {
  const headers = ['Airline', 'Last Stop', 'INAD Count', 'PAX', 'Density (‰)', 'Priority'];
  const rows = data.map((row) => [
    toSafeCsvField(row.airline),
    toSafeCsvField(row.lastStop),
    row.inadCount.toString(),
    row.pax.toString(),
    toSafeCsvField(row.density?.toFixed(3) || 'N/A'),
    toSafeCsvField(PRIORITY_LABELS[row.priority]),
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.join(';')),
    '',
    `Threshold;${threshold.toFixed(3)}‰`,
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'watch' | 'clear'>('all');
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';
  const normalizedResults = step3Results ?? EMPTY_STEP3_RESULTS;
  const summary = getStep3Summary(normalizedResults, threshold || 0);

  // Sort data by priority: above threshold first (HIGH_PRIORITY, WATCH_LIST), then below (CLEAR)
  const sortedResults = useMemo(() => {
    return [...normalizedResults].sort((a, b) => {
      const orderA = PRIORITY_ORDER[a.priority] ?? 99;
      const orderB = PRIORITY_ORDER[b.priority] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      // Secondary sort by density (descending) within same priority
      return (b.density ?? 0) - (a.density ?? 0);
    });
  }, [normalizedResults]);

  const filteredResults = useMemo(() => {
    if (statusFilter === 'all') return sortedResults;
    if (statusFilter === 'critical') {
      return sortedResults.filter((row) => row.priority === 'HIGH_PRIORITY');
    }
    if (statusFilter === 'watch') {
      return sortedResults.filter((row) => row.priority === 'WATCH_LIST');
    }
    return sortedResults.filter((row) => row.priority === 'CLEAR');
  }, [sortedResults, statusFilter]);

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

  const getRowClassName = (row: Step3Result) => {
    const classes: string[] = [];

    // Background color based on priority
    switch (row.priority) {
      case 'HIGH_PRIORITY':
        classes.push('bg-red-50');
        break;
      case 'WATCH_LIST':
        classes.push('bg-orange-50');
        break;
    }

    return classes.join(' ');
  };

  if (!step3Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('noData')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="step3-status-filter" className="text-neutral-600">
            {tTable('status')}:
          </label>
          <select
            id="step3-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'critical' | 'watch' | 'clear')}
            className="border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none"
          >
            <option value="all">{tTable('all')}</option>
            <option value="critical">{tPriority('sanction')}</option>
            <option value="watch">{tPriority('watchList')}</option>
            <option value="clear">{tPriority('clear')}</option>
          </select>
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
        </div>
      </div>

      {/* Klassifizierungskriterien */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 text-sm">{t('classificationCriteria')}</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
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
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={filteredResults}
        columns={columns}
        getRowKey={(row) => `${row.airline}-${row.lastStop}`}
        rowClassName={getRowClassName}
        emptyMessage={t('noRoutes')}
        searchable
        searchableKeys={['airline', 'lastStop', 'priority']}
        paginate
        initialPageSize={25}
      />
    </div>
  );
}
