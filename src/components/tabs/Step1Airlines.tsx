'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import type { Step1Result } from '@/lib/analysis/types';
import { getStep1Summary } from '@/lib/analysis/step1';
import { useTranslations } from 'next-intl';

export function Step1Airlines() {
  const t = useTranslations('steps.step1');
  const tTable = useTranslations('table');
  const { step1Results, config } = useAnalysisStore();

  if (!step1Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('noData')}
      </div>
    );
  }

  const summary = getStep1Summary(step1Results);

  const columns: Column<Step1Result>[] = [
    {
      key: 'airline',
      header: tTable('airline'),
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
            <strong>{summary.totalAirlines}</strong> {t('airlinesAnalyzed')}
          </span>
          <span>
            <strong>{summary.passingAirlines}</strong> {t('aboveThreshold')}
          </span>
          <span>
            <strong>{summary.totalInads}</strong> {t('totalInads')}
          </span>
        </div>
      </div>

      <DataTable
        data={step1Results}
        columns={columns}
        getRowKey={(row) => row.airline}
        rowClassName={(row) =>
          row.passesThreshold ? 'bg-orange-50/50' : ''
        }
        emptyMessage={t('noAirlines')}
      />
    </div>
  );
}
