'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import type { Step2Result } from '@/lib/analysis/types';
import { getStep2Summary } from '@/lib/analysis/step2';

export function Step2Routes() {
  const { step2Results, config } = useAnalysisStore();

  if (!step2Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Upload both INAD and BAZL files to see results
      </div>
    );
  }

  const summary = getStep2Summary(step2Results);

  const columns: Column<Step2Result>[] = [
    {
      key: 'airline',
      header: 'Airline',
      sortable: true,
    },
    {
      key: 'lastStop',
      header: 'Last Stop',
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
        <h3 className="font-semibold mb-2">Step 2: Route Screening</h3>
        <p className="text-sm text-muted-foreground mb-3">
          For airlines identified in Step 1, analyzes individual routes (airline + last stop airport).
          Routes with {config.minInad} or more INADs proceed to density analysis.
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <strong>{summary.totalRoutes}</strong> routes analyzed
          </span>
          <span>
            <strong>{summary.passingRoutes}</strong> above threshold
          </span>
          <span>
            <strong>{summary.totalInads}</strong> total INADs
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
        emptyMessage="No routes found in data"
      />
    </div>
  );
}
