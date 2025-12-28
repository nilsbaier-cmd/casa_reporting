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
        Laden Sie INAD- und BAZL-Dateien hoch, um Ergebnisse zu sehen
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
      header: 'Anzahl INAD',
      sortable: true,
      align: 'right',
    },
    {
      key: 'passesThreshold',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={row.passesThreshold ? 'default' : 'secondary'}>
          {row.passesThreshold ? 'Prüfen' : 'OK'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Prüfstufe 2: Routen-Screening</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Für Airlines aus Prüfstufe 1: Analyse einzelner Routen (Airline + Last Stop).
          Routen mit mindestens {config.minInad} Einreiseverweigerungen werden in der Dichte-Analyse geprüft.
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <strong>{summary.totalRoutes}</strong> Routen analysiert
          </span>
          <span>
            <strong>{summary.passingRoutes}</strong> über Schwellenwert
          </span>
          <span>
            <strong>{summary.totalInads}</strong> INADs total
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
        emptyMessage="Keine Routen in den Daten gefunden"
      />
    </div>
  );
}
