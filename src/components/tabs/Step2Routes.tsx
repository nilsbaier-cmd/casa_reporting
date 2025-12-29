'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import type { Step2Result } from '@/lib/analysis/types';
import { getStep2Summary } from '@/lib/analysis/step2';
import { useTranslations } from 'next-intl';

export function Step2Routes() {
  const t = useTranslations('steps.step2');
  const tTable = useTranslations('table');
  const { step2Results, config } = useAnalysisStore();

  if (!step2Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('noData')}
      </div>
    );
  }

  const summary = getStep2Summary(step2Results);

  const columns: Column<Step2Result>[] = [
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
      header: tTable('inadCount'),
      sortable: true,
      align: 'right',
    },
    {
      key: 'passesThreshold',
      header: tTable('status'),
      align: 'center',
      render: (row) => (
        <Badge variant={row.passesThreshold ? 'default' : 'secondary'}>
          {row.passesThreshold ? tTable('check') : tTable('ok')}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">{t('title')}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {t('description', { minInad: config.minInad })}
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <strong>{summary.totalRoutes}</strong> {t('routesAnalyzed')}
          </span>
          <span>
            <strong>{summary.passingRoutes}</strong> {t('aboveThreshold')}
          </span>
          <span>
            <strong>{summary.totalInads}</strong> {t('totalInads')}
          </span>
        </div>
      </div>

      <DataTable
        data={step2Results}
        columns={columns}
        getRowKey={(row) => `${row.airline}-${row.lastStop}`}
        rowClassName={(row) =>
          row.passesThreshold ? 'bg-orange-50/50' : ''
        }
        emptyMessage={t('noRoutes')}
      />
    </div>
  );
}
