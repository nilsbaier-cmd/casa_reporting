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
        Laden Sie INAD- und BAZL-Dateien hoch, um Ergebnisse zu sehen
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
      render: (row) => row.pax.toLocaleString('de-CH'),
    },
    {
      key: 'density',
      header: 'Dichte (‰)',
      sortable: true,
      align: 'right',
      render: (row) => (row.density !== null ? row.density.toFixed(3) : 'k.A.'),
    },
    {
      key: 'priority',
      header: 'Kategorie',
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
            <h3 className="font-semibold mb-2">Prüfstufe 3: Dichte-Analyse</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Berechnet die INAD-Dichte (pro 1'000 Passagiere) für jede Route und klassifiziert
              basierend auf der Abweichung vom Median-Schwellenwert.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(step3Results, threshold || 0)}
          >
            CSV Export
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            <strong>{summary.totalRoutes}</strong> Routen
          </span>
          <span className="text-red-700">
            <strong>{summary.highPriority}</strong> Sanktion
          </span>
          <span className="text-orange-700">
            <strong>{summary.watchList}</strong> Beobachtung
          </span>
          <span className="text-green-700">
            <strong>{summary.clear}</strong> Konform
          </span>
          <span className="text-slate-600">
            <strong>{summary.unreliable}</strong> Unzuverlässig
          </span>
        </div>
      </div>

      {/* Klassifizierungskriterien */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 text-sm">Klassifizierungskriterien</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <PriorityBadge priority="HIGH_PRIORITY" />
              <span className="text-muted-foreground">
                Dichte ≥ {(threshold || 0) * config.highPriorityMultiplier > 0
                  ? `${((threshold || 0) * config.highPriorityMultiplier).toFixed(3)}‰`
                  : `${config.highPriorityMultiplier}× Schwellenwert`}
                , ≥ {config.minDensity}‰, ≥ {config.highPriorityMinInad} INADs
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="WATCH_LIST" />
              <span className="text-muted-foreground">
                Dichte ≥ {threshold?.toFixed(3) || 0}‰ (Schwellenwert)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="CLEAR" />
              <span className="text-muted-foreground">
                Dichte &lt; Schwellenwert
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PriorityBadge priority="UNRELIABLE" />
              <span className="text-muted-foreground">
                PAX &lt; {config.minPax.toLocaleString('de-CH')}
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
        emptyMessage="Keine Routen in den Daten gefunden"
      />
    </div>
  );
}
