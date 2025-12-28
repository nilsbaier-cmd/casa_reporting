'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Step3Result } from '@/lib/analysis/types';
import { getStep3Summary } from '@/lib/analysis/step3';
import { PRIORITY_LABELS } from '@/lib/analysis/constants';

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
  const { step3Results, threshold, config } = useAnalysisStore();

  if (!step3Results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Upload both INAD and BAZL files to see results
      </div>
    );
  }

  const summary = getStep3Summary(step3Results, threshold || 0);

  const columns: Column<Step3Result>[] = [
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
      header: 'INADs',
      sortable: true,
      align: 'right',
    },
    {
      key: 'pax',
      header: 'PAX',
      sortable: true,
      align: 'right',
      render: (row) => row.pax.toLocaleString(),
    },
    {
      key: 'density',
      header: 'Density (‰)',
      sortable: true,
      align: 'right',
      render: (row) => (row.density !== null ? row.density.toFixed(3) : 'N/A'),
    },
    {
      key: 'priority',
      header: 'Priority',
      align: 'center',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
  ];

  const getRowClassName = (row: Step3Result) => {
    switch (row.priority) {
      case 'HIGH_PRIORITY':
        return 'bg-red-50';
      case 'WATCH_LIST':
        return 'bg-orange-50';
      case 'UNRELIABLE':
        return 'bg-slate-50';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-2">Step 3: INAD Density Analysis</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Calculates INAD density (per 1,000 passengers) for each route and classifies
              priority based on deviation from the median threshold.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(step3Results, threshold || 0)}
          >
            Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            <strong>{summary.totalRoutes}</strong> routes
          </span>
          <span className="text-red-700">
            <strong>{summary.highPriority}</strong> high priority
          </span>
          <span className="text-orange-700">
            <strong>{summary.watchList}</strong> watch list
          </span>
          <span className="text-green-700">
            <strong>{summary.clear}</strong> clear
          </span>
          <span className="text-slate-600">
            <strong>{summary.unreliable}</strong> unreliable
          </span>
        </div>
      </div>

      {/* Classification criteria */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 text-sm">Classification Criteria</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <PriorityBadge priority="HIGH_PRIORITY" />
              <span className="text-muted-foreground">
                Density ≥ {(threshold || 0) * config.highPriorityMultiplier > 0
                  ? `${((threshold || 0) * config.highPriorityMultiplier).toFixed(3)}‰`
                  : `${config.highPriorityMultiplier}× threshold`}
                , ≥ {config.minDensity}‰, ≥ {config.highPriorityMinInad} INADs
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="WATCH_LIST" />
              <span className="text-muted-foreground">
                Density ≥ {threshold?.toFixed(3) || 0}‰ (threshold)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="CLEAR" />
              <span className="text-muted-foreground">
                Density &lt; threshold
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="UNRELIABLE" />
              <span className="text-muted-foreground">
                PAX &lt; {config.minPax.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={step3Results}
        columns={columns}
        getRowKey={(row) => `${row.airline}-${row.lastStop}`}
        rowClassName={getRowClassName}
        emptyMessage="No routes found in data"
      />
    </div>
  );
}
