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
        Laden Sie INAD- und BAZL-Dateien hoch, um Ergebnisse zu sehen
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
        <h3 className="font-semibold mb-2">Prüfstufe 1: Airline-Screening</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Identifiziert Airlines mit mindestens {config.minInad} Einreiseverweigerungen im Analysezeitraum.
          Airlines über diesem Schwellenwert werden in der Routen-Analyse weiter geprüft.
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <strong>{summary.totalAirlines}</strong> Airlines analysiert
          </span>
          <span>
            <strong>{summary.passingAirlines}</strong> über Schwellenwert
          </span>
          <span>
            <strong>{summary.totalInads}</strong> INADs total
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
        emptyMessage="Keine Airlines in den Daten gefunden"
      />
    </div>
  );
}
