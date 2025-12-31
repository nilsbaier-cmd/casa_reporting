'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Step1Result } from '@/lib/analysis/types';
import { getStep1Summary } from '@/lib/analysis/step1';
import { useTranslations } from 'next-intl';

// CSV export with Swiss format (semicolon separator)
function exportToCSV(data: Step1Result[], minInad: number) {
  const escapeField = (field: string) => {
    if (field.includes(';') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const headers = ['Airline', 'INAD Count', 'Status'];
  const rows = data.map((row) => [
    escapeField(row.airline),
    row.inadCount.toString(),
    row.passesThreshold ? 'Check' : 'OK',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.join(';')),
    '',
    `Min INAD Threshold;${minInad}`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `casa-airlines-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

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
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-2">{t('title')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('description', { minInad: config.minInad })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(step1Results, config.minInad)}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('csvExport')}
          </Button>
        </div>
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
