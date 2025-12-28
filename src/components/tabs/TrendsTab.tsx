'use client';

import { useMemo } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface SemesterData {
  semester: string;
  year: number;
  half: 1 | 2;
  pax: number;
  inad: number;
  density: number;
}

export function TrendsTab() {
  const { inadData, bazlData, availableSemesters } = useAnalysisStore();

  // Calculate time series data for all semesters
  const trendData = useMemo((): SemesterData[] => {
    if (!inadData || !bazlData || availableSemesters.length === 0) {
      return [];
    }

    // Sort semesters chronologically (oldest first)
    const sortedSemesters = [...availableSemesters].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.half - b.half;
    });

    return sortedSemesters.map((semester) => {
      const startMonth = semester.half === 1 ? 1 : 7;
      const endMonth = semester.half === 1 ? 6 : 12;

      // Filter INAD data
      const semesterInad = inadData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= startMonth &&
          r.month <= endMonth &&
          r.included
      );

      // Filter BAZL data
      const semesterBazl = bazlData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= startMonth &&
          r.month <= endMonth
      );

      const inadCount = semesterInad.length;
      const paxCount = semesterBazl.reduce((sum, r) => sum + r.pax, 0);
      const density = paxCount > 0 ? (inadCount / paxCount) * 1000 : 0;

      return {
        semester: semester.label,
        year: semester.year,
        half: semester.half,
        pax: paxCount,
        inad: inadCount,
        density: Number(density.toFixed(4)),
      };
    });
  }, [inadData, bazlData, availableSemesters]);

  // Filter data for PAX/Density charts (only show semesters with PAX data)
  const paxTrendData = useMemo(() => {
    return trendData.filter(d => d.pax > 0);
  }, [trendData]);

  // Calculate trend indicators
  const { paxTrend, inadTrend, densityTrend } = useMemo(() => {
    if (trendData.length < 2) {
      return { paxTrend: 0, inadTrend: 0, densityTrend: 0 };
    }

    const lastTwo = trendData.slice(-2);
    const prev = lastTwo[0];
    const curr = lastTwo[1];

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      paxTrend: calcTrend(curr.pax, prev.pax),
      inadTrend: calcTrend(curr.inad, prev.inad),
      densityTrend: calcTrend(curr.density, prev.density),
    };
  }, [trendData]);

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) {
      return <Minus className="w-4 h-4 text-neutral-400" />;
    }
    if (value > 0) {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    }
    return <TrendingDown className="w-4 h-4 text-green-600" />;
  };

  if (!inadData || !bazlData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">Keine Daten geladen</p>
        <p className="text-sm mt-1">Bitte laden Sie INAD- und BAZL-Dateien hoch</p>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
        <p className="text-lg font-medium">Keine Trenddaten verfügbar</p>
        <p className="text-sm mt-1">Mindestens ein Semester mit Daten erforderlich</p>
      </div>
    );
  }

  // Get latest values
  const latest = trendData[trendData.length - 1];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">Trend-Analyse</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Entwicklung über {trendData.length} Semester ({trendData[0]?.semester} - {latest?.semester})
          </p>
        </div>
      </div>

      {/* KPI Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Passagiere (aktuell)
            </span>
            <div className="flex items-center gap-1">
              <TrendIndicator value={paxTrend} />
              <span
                className={`text-xs font-medium ${
                  paxTrend > 0 ? 'text-red-600' : paxTrend < 0 ? 'text-green-600' : 'text-neutral-400'
                }`}
              >
                {paxTrend > 0 ? '+' : ''}{paxTrend.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {latest?.pax.toLocaleString('de-CH') || '-'}
          </p>
          <p className="text-xs text-neutral-500 mt-1">{latest?.semester}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              INAD-Fälle (aktuell)
            </span>
            <div className="flex items-center gap-1">
              <TrendIndicator value={inadTrend} />
              <span
                className={`text-xs font-medium ${
                  inadTrend > 0 ? 'text-red-600' : inadTrend < 0 ? 'text-green-600' : 'text-neutral-400'
                }`}
              >
                {inadTrend > 0 ? '+' : ''}{inadTrend.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {latest?.inad.toLocaleString('de-CH') || '-'}
          </p>
          <p className="text-xs text-neutral-500 mt-1">{latest?.semester}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Dichte (aktuell)
            </span>
            <div className="flex items-center gap-1">
              <TrendIndicator value={densityTrend} />
              <span
                className={`text-xs font-medium ${
                  densityTrend > 0 ? 'text-red-600' : densityTrend < 0 ? 'text-green-600' : 'text-neutral-400'
                }`}
              >
                {densityTrend > 0 ? '+' : ''}{densityTrend.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {latest?.density.toFixed(3) || '-'}‰
          </p>
          <p className="text-xs text-neutral-500 mt-1">{latest?.semester}</p>
        </div>
      </div>

      {/* Passenger Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          Passagierentwicklung
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          Anzahl Passagiere pro Semester (nur Semester mit BAZL-Daten)
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={paxTrendData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="paxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: '#737373' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'}
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <Tooltip
                formatter={(value) => [typeof value === 'number' ? value.toLocaleString('de-CH') : '–', 'Passagiere']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Area
                type="monotone"
                dataKey="pax"
                stroke="#DC2626"
                strokeWidth={2}
                fill="url(#paxGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INAD Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          INAD-Entwicklung
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          Anzahl Einreiseverweigerungen pro Semester (berücksichtigt)
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="inadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: '#737373' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <Tooltip
                formatter={(value) => [typeof value === 'number' ? value.toLocaleString('de-CH') : '–', 'Einreiseverweigerungen']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Area
                type="monotone"
                dataKey="inad"
                stroke="#DC2626"
                strokeWidth={2}
                fill="url(#inadGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Density Trend Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-900 mb-1">
          Dichte-Entwicklung
        </h4>
        <p className="text-sm text-neutral-500 mb-6">
          Einreiseverweigerungen pro 1'000 Passagiere (‰) pro Semester (nur Semester mit BAZL-Daten)
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={paxTrendData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="semester"
                tick={{ fontSize: 11, fill: '#737373' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(value) => value.toFixed(2) + '‰'}
                tick={{ fontSize: 12, fill: '#737373' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(value) => [typeof value === 'number' ? value.toFixed(4) + '‰' : '–', 'Dichte']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Line
                type="monotone"
                dataKey="density"
                stroke="#DC2626"
                strokeWidth={3}
                dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#DC2626', strokeWidth: 0, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
