'use client';

import { useState, useMemo, useCallback } from 'react';
import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Users,
  AlertTriangle,
  Eye,
  CheckCircle,
  TrendingUp,
  Download,
} from 'lucide-react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { ClassificationCriteria } from './ClassificationCriteria';
import type { PublishedRoute, PublishedAirline } from '@/lib/analysis/publishTypes';

// Default config for backward compatibility with older published data
const DEFAULT_CLASSIFICATION_CONFIG = {
  minInad: 6,
  minPax: 5000,
  minDensity: 0.10,
  highPriorityMultiplier: 1.5,
  highPriorityMinInad: 10,
};

export function ViewerDashboard() {
  const { publishedData } = useViewerStore();
  const t = useTranslations('viewer');
  const tTable = useTranslations('table');
  const tPriority = useTranslations('priority');
  const tSteps = useTranslations('steps');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(3);

  if (!publishedData) return null;

  const { summary, routes, airlines, classificationConfig } = publishedData;
  const config = classificationConfig || DEFAULT_CLASSIFICATION_CONFIG;

  // Classification counts
  const criticalCount = routes.filter((r) => r.classification === 'sanction').length;
  const watchListCount = routes.filter((r) => r.classification === 'watchList').length;
  const clearCount = routes.filter((r) => r.classification === 'clear').length;

  // Get badge color based on classification - memoized for performance
  const getClassificationBadge = useCallback((classification: string) => {
    switch (classification) {
      case 'sanction':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
            {tPriority('critical')}
          </span>
        );
      case 'watchList':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
            {tPriority('watchList')}
          </span>
        );
      case 'clear':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
            {tPriority('clear')}
          </span>
        );
      case 'unreliable':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600">
            {tPriority('unreliable')}
          </span>
        );
      default:
        return null;
    }
  }, [tPriority]);

  // Get status badge for step 1 and 2 - memoized for performance
  const getStatusBadge = useCallback((aboveThreshold: boolean) => {
    return aboveThreshold ? (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
        {tTable('check')}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
        {tTable('ok')}
      </span>
    );
  }, [tTable]);

  // CSV Export function with proper escaping
  const handleExportCsv = () => {
    // Helper to escape CSV fields - handles semicolons, quotes, and newlines
    const escapeCSVField = (field: string): string => {
      if (field.includes(';') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const headers = [
      'Airline',
      'Airline Name',
      'Last Stop',
      'INADs',
      'PAX',
      'Density (permille)',
      'Classification',
    ];

    const rows = routes.map((route) => [
      escapeCSVField(route.airline),
      escapeCSVField(route.airlineName),
      escapeCSVField(route.lastStop),
      route.inadCount.toString(),
      route.pax.toString(),
      route.density !== null ? route.density.toFixed(4) : '',
      route.classification,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `casa-routes-${publishedData.metadata.semester.replace(' ', '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // DataTable columns for Step 1 (Airlines)
  const airlineColumns: Column<PublishedAirline>[] = [
    {
      key: 'airline',
      header: tTable('airline'),
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-neutral-900">{row.airline}</span>
          {row.airlineName !== row.airline && (
            <span className="text-neutral-500 ml-2 text-sm">{row.airlineName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'inadCount',
      header: tTable('inads'),
      sortable: true,
      align: 'right' as const,
      render: (row) => (
        <span className="font-medium text-neutral-900">{row.inadCount}</span>
      ),
    },
    {
      key: 'aboveThreshold',
      header: tTable('status'),
      sortable: true,
      render: (row) => getStatusBadge(row.aboveThreshold),
    },
  ];

  // DataTable columns for Step 3 (Routes with density)
  const routeColumns: Column<PublishedRoute>[] = [
    {
      key: 'airline',
      header: tTable('airline'),
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-neutral-900">{row.airline}</span>
          {row.airlineName !== row.airline && (
            <span className="text-neutral-500 ml-2 text-sm">{row.airlineName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'lastStop',
      header: tTable('lastStop'),
      sortable: true,
      render: (row) => <span className="text-neutral-900">{row.lastStop}</span>,
    },
    {
      key: 'inadCount',
      header: tTable('inads'),
      sortable: true,
      align: 'right' as const,
      render: (row) => (
        <span className="font-medium text-neutral-900">{row.inadCount}</span>
      ),
    },
    {
      key: 'pax',
      header: tTable('pax'),
      sortable: true,
      align: 'right' as const,
      render: (row) => (
        <span className="text-neutral-600">{row.pax.toLocaleString(localeFormat)}</span>
      ),
    },
    {
      key: 'density',
      header: tTable('density'),
      sortable: true,
      align: 'right' as const,
      render: (row) => (
        <span className="font-medium text-neutral-900">
          {row.density !== null ? `${row.density.toFixed(4)}‰` : '–'}
        </span>
      ),
    },
    {
      key: 'classification',
      header: tTable('status'),
      sortable: true,
      render: (row) => getClassificationBadge(row.classification),
    },
  ];

  // DataTable columns for Step 2 (Routes simplified)
  const routeStep2Columns: Column<PublishedRoute>[] = [
    {
      key: 'airline',
      header: tTable('airline'),
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-neutral-900">{row.airline}</span>
          {row.airlineName !== row.airline && (
            <span className="text-neutral-500 ml-2 text-sm">{row.airlineName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'lastStop',
      header: tTable('lastStop'),
      sortable: true,
      render: (row) => <span className="text-neutral-900">{row.lastStop}</span>,
    },
    {
      key: 'inadCount',
      header: tTable('inads'),
      sortable: true,
      align: 'right' as const,
      render: (row) => (
        <span className="font-medium text-neutral-900">{row.inadCount}</span>
      ),
    },
    {
      key: 'aboveThreshold',
      header: tTable('status'),
      sortable: false,
      render: (row) => getStatusBadge(row.inadCount >= config.minInad),
    },
  ];

  // Sort routes by classification priority then density - memoized for performance
  const sortedRoutes = useMemo(() => {
    return [...routes].sort((a, b) => {
      const classOrder: Record<string, number> = { sanction: 0, watchList: 1, unreliable: 2, clear: 3 };
      const orderA = classOrder[a.classification] ?? 4;
      const orderB = classOrder[b.classification] ?? 4;
      if (orderA !== orderB) return orderA - orderB;
      return (b.density ?? 0) - (a.density ?? 0);
    });
  }, [routes]);

  return (
    <div className="space-y-8">
      {/* Summary Metrics - 5 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-neutral-600" />
            </div>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('totalInads')}
            </span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {summary.totalInads.toLocaleString(localeFormat)}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('sanctions')}
            </span>
          </div>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('watchList')}
            </span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{watchListCount}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('compliant')}
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600">{clearCount}</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {t('medianThreshold')}
            </span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{summary.medianDensity.toFixed(4)}‰</p>
        </div>
      </div>

      {/* Analysis Steps with Tabs */}
      <section className="bg-white border border-neutral-200">
        {/* Step Tabs */}
        <div className="border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveStep(1)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeStep === 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              {tSteps('step1.tabTitle')}
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeStep === 2
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              {tSteps('step2.tabTitle')}
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeStep === 3
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              {tSteps('step3.tabTitle')}
            </button>
          </div>
        </div>

        {/* Step 1: Airlines */}
        {activeStep === 1 && (
          <>
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">{tSteps('step1.title')}</h3>
              <p className="text-sm text-neutral-500 mt-1">
                {tSteps('step1.description', { minInad: config.minInad })}
              </p>
            </div>
            <DataTable
              data={airlines}
              columns={airlineColumns}
              getRowKey={(row) => row.airline}
              rowClassName={(row) => row.aboveThreshold ? 'bg-amber-50/50' : ''}
            />
          </>
        )}

        {/* Step 2: Routes (simplified) */}
        {activeStep === 2 && (
          <>
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">{tSteps('step2.title')}</h3>
              <p className="text-sm text-neutral-500 mt-1">
                {tSteps('step2.description', { minInad: config.minInad })}
              </p>
            </div>
            <DataTable
              data={routes}
              columns={routeStep2Columns}
              getRowKey={(row) => `${row.airline}-${row.lastStop}`}
            />
          </>
        )}

        {/* Step 3: Density Analysis */}
        {activeStep === 3 && (
          <>
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{tSteps('step3.title')}</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {tSteps('step3.description')}
                  </p>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {tSteps('step3.csvExport')}
                </button>
              </div>
            </div>
            <DataTable
              data={sortedRoutes}
              columns={routeColumns}
              getRowKey={(row) => `${row.airline}-${row.lastStop}`}
              rowClassName={(row) => row.classification === 'sanction' ? 'bg-red-50/50' : ''}
            />
          </>
        )}
      </section>

      {/* Classification Criteria Section */}
      <ClassificationCriteria config={config} medianThreshold={summary.medianDensity} />
    </div>
  );
}
