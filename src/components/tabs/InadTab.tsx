'use client';

import { useMemo } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { FileWarning, MapPin, Users, Globe } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

// Refusal codes that are excluded from analysis
const EXCLUDE_CODES = ['B1n', 'B2n', 'C4n', 'C5n', 'C8', 'D1n', 'D2n', 'E', 'F1n', 'G', 'H', 'I'];

export function InadTab() {
  const { inadData, selectedSemester } = useAnalysisStore();

  // Calculate aggregated data for the selected semester
  const { topLastStops, topAirlines, totalInad, includedInad, excludedInad, byRefusalCode } = useMemo(() => {
    if (!inadData || !selectedSemester) {
      return {
        topLastStops: [],
        topAirlines: [],
        totalInad: 0,
        includedInad: 0,
        excludedInad: 0,
        byRefusalCode: [],
      };
    }

    // Filter by semester
    const startMonth = selectedSemester.half === 1 ? 1 : 7;
    const endMonth = selectedSemester.half === 1 ? 6 : 12;
    const filtered = inadData.filter(
      (r) => r.year === selectedSemester.year && r.month >= startMonth && r.month <= endMonth
    );

    // Count included vs excluded
    const included = filtered.filter((r) => r.included);
    const excluded = filtered.filter((r) => !r.included);

    // Aggregate by Last Stop (only included)
    const byLastStop = new Map<string, number>();
    for (const record of included) {
      const current = byLastStop.get(record.lastStop) || 0;
      byLastStop.set(record.lastStop, current + 1);
    }

    // Aggregate by Airline (only included)
    const byAirline = new Map<string, number>();
    for (const record of included) {
      const current = byAirline.get(record.airline) || 0;
      byAirline.set(record.airline, current + 1);
    }

    // Aggregate by refusal code (all records)
    const refusalCodes = new Map<string, number>();
    for (const record of filtered) {
      const code = record.refusalCode || 'Unbekannt';
      const current = refusalCodes.get(code) || 0;
      refusalCodes.set(code, current + 1);
    }

    // Sort and take top 10
    const topLastStops = Array.from(byLastStop.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topAirlines = Array.from(byAirline.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top refusal codes
    const byRefusalCode = Array.from(refusalCodes.entries())
      .map(([code, count]) => ({
        name: code,
        value: count,
        excluded: EXCLUDE_CODES.includes(code),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      topLastStops,
      topAirlines,
      totalInad: filtered.length,
      includedInad: included.length,
      excludedInad: excluded.length,
      byRefusalCode,
    };
  }, [inadData, selectedSemester]);

  // Color palette for charts
  const redColors = [
    '#DC2626', '#E53935', '#EF5350', '#F44336', '#E57373',
    '#EF9A9A', '#FFCDD2', '#B71C1C', '#C62828', '#D32F2F',
  ];

  const pieColors = ['#DC2626', '#737373'];

  if (!inadData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <FileWarning className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">Keine INAD-Daten geladen</p>
        <p className="text-sm mt-1">Bitte laden Sie eine INAD-Datei hoch</p>
      </div>
    );
  }

  if (!selectedSemester) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <FileWarning className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">Kein Semester ausgewählt</p>
        <p className="text-sm mt-1">Bitte wählen Sie ein Semester für die Analyse</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">INAD-Daten Übersicht</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Einreiseverweigerungen für {selectedSemester.label}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Total INAD
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {totalInad.toLocaleString('de-CH')}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Berücksichtigt
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {includedInad.toLocaleString('de-CH')}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Ausgeschlossen
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-500">
            {excludedInad.toLocaleString('de-CH')}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Last Stops
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {topLastStops.length > 0 ? new Set(inadData.filter(r => r.included).map((r) => r.lastStop)).size : 0}
          </p>
        </div>
      </div>

      {/* Included vs Excluded Pie Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          INAD-Verteilung
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          Berücksichtigte vs. ausgeschlossene Fälle
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Berücksichtigt', value: includedInad },
                    { name: 'Ausgeschlossen', value: excludedInad },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [(value as number).toLocaleString('de-CH'), 'Fälle']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-600" />
              <div>
                <p className="font-medium text-neutral-900">Berücksichtigt</p>
                <p className="text-sm text-neutral-500">
                  {includedInad.toLocaleString('de-CH')} Fälle werden in der Analyse berücksichtigt
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-neutral-500" />
              <div>
                <p className="font-medium text-neutral-900">Ausgeschlossen</p>
                <p className="text-sm text-neutral-500">
                  {excludedInad.toLocaleString('de-CH')} Fälle (administrative Gründe)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 10 Last Stops */}
        <div className="bg-white border border-neutral-200 p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-1">
            Top 10 Abflugorte
          </h4>
          <p className="text-sm text-neutral-500 mb-6">
            Nach Anzahl INAD-Fälle (berücksichtigt)
          </p>
          {topLastStops.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topLastStops}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#171717' }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString('de-CH'), 'INAD-Fälle']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {topLastStops.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={redColors[index % redColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-400">
              Keine Daten verfügbar
            </div>
          )}
        </div>

        {/* Top 10 Airlines */}
        <div className="bg-white border border-neutral-200 p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-1">
            Top 10 Airlines
          </h4>
          <p className="text-sm text-neutral-500 mb-6">
            Nach Anzahl INAD-Fälle (berücksichtigt)
          </p>
          {topAirlines.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topAirlines}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#171717' }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString('de-CH'), 'INAD-Fälle']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e5e5',
                      borderRadius: 0,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {topAirlines.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={redColors[index % redColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-400">
              Keine Daten verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Refusal Codes */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          Häufigste Verweigerungsgründe
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          Top 10 EVGrund-Codes
        </p>
        {byRefusalCode.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byRefusalCode}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#171717' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <Tooltip
                  formatter={(value: number, name, props) => [
                    `${value.toLocaleString('de-CH')} Fälle${props.payload.excluded ? ' (ausgeschlossen)' : ''}`,
                    'Anzahl',
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                  }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {byRefusalCode.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.excluded ? '#a3a3a3' : '#DC2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-neutral-400">
            Keine Daten verfügbar
          </div>
        )}
        <p className="text-xs text-neutral-500 mt-4">
          Graue Balken zeigen ausgeschlossene Codes an (administrative Gründe)
        </p>
      </div>
    </div>
  );
}
