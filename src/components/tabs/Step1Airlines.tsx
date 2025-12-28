'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import type { Step1Result } from '@/lib/analysis/types';
import { getStep1Summary } from '@/lib/analysis/step1';

export function Step1Airlines() {
  const { step1Results, config } = useAnalysisStore();

  if (!step1Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Upload both INAD and BAZL files to see results
      </div>
    );
  }

  const summary = getStep1Summary(step1Results);

  const columns: Column<Step1Result>[] = [
    {
      key: 'airline',
      header: 'Airline',
      sortable: true,
    },
    {
      key: 'inadCount',
      header: 'INAD Count',
      sortable: true,
      align: 'right',
    },
    {
      key: 'passesThreshold',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={row.passesThreshold ? 'default' : 'secondary'}>
          {row.passesThreshold ? 'Review' : 'OK'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Step 1: Airline Screening</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Identifies airlines with {config.minInad} or more INAD cases in the analysis period.
          Airlines meeting this threshold proceed to route-level analysis.
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <strong>{summary.totalAirlines}</strong> airlines analyzed
          </span>
          <span>
            <strong>{summary.passingAirlines}</strong> above threshold
          </span>
          <span>
            <strong>{summary.totalInads}</strong> total INADs
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
        emptyMessage="No airlines found in data"
      />
    </div>
  );
}
