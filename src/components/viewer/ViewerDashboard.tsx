'use client';

import { useState } from 'react';
import { useViewerStore } from '@/stores/viewerStore';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Users,
  AlertTriangle,
  Eye,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Plane,
  MapPin,
} from 'lucide-react';

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

  const { summary, routes, airlines, top10 } = publishedData;

  // Classification counts
  const criticalCount = routes.filter((r) => r.classification === 'sanction').length;
  const watchListCount = routes.filter((r) => r.classification === 'watchList').length;
  const clearCount = routes.filter((r) => r.classification === 'clear').length;

  // Get badge color based on classification
  const getClassificationBadge = (classification: string) => {
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
  };

  // Get status badge for step 1 and 2
  const getStatusBadge = (aboveThreshold: boolean) => {
    return aboveThreshold ? (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
        {tTable('check')}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
        {tTable('ok')}
      </span>
    );
  };

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
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeStep === 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              <Plane className="w-4 h-4" />
              {tSteps('step1.tabTitle')}
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeStep === 2
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              <MapPin className="w-4 h-4" />
              {tSteps('step2.tabTitle')}
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                activeStep === 3
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              <BarChart3 className="w-4 h-4" />
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
                {tSteps('step1.description', { minInad: 6 })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('airline')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('inads')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {airlines
                    .sort((a, b) => b.inadCount - a.inadCount)
                    .map((airline) => (
                      <tr
                        key={airline.airline}
                        className={cn(
                          'hover:bg-neutral-50',
                          airline.aboveThreshold && 'bg-amber-50/50'
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-neutral-900">{airline.airline}</span>
                          <span className="text-neutral-500 ml-2 text-sm">{airline.airlineName}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-neutral-900">
                          {airline.inadCount}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(airline.aboveThreshold)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Step 2: Routes (simplified) */}
        {activeStep === 2 && (
          <>
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">{tSteps('step2.title')}</h3>
              <p className="text-sm text-neutral-500 mt-1">
                {tSteps('step2.description', { minInad: 6 })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('airline')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('lastStop')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('inads')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {routes
                    .sort((a, b) => b.inadCount - a.inadCount)
                    .map((route, index) => (
                      <tr
                        key={`${route.airline}-${route.lastStop}-${index}`}
                        className="hover:bg-neutral-50"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-neutral-900">{route.airline}</span>
                          <span className="text-neutral-500 ml-2 text-sm">{route.airlineName}</span>
                        </td>
                        <td className="px-4 py-3 text-neutral-900">{route.lastStop}</td>
                        <td className="px-4 py-3 text-right font-medium text-neutral-900">
                          {route.inadCount}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(route.inadCount >= 6)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Step 3: Density Analysis */}
        {activeStep === 3 && (
          <>
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">{tSteps('step3.title')}</h3>
              <p className="text-sm text-neutral-500 mt-1">
                {tSteps('step3.description')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('airline')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('lastStop')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('inads')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('pax')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('density')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {tTable('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {routes
                    .sort((a, b) => {
                      const classOrder = { sanction: 0, watchList: 1, unreliable: 2, clear: 3 };
                      const orderA = classOrder[a.classification] ?? 4;
                      const orderB = classOrder[b.classification] ?? 4;
                      if (orderA !== orderB) return orderA - orderB;
                      return (b.density ?? 0) - (a.density ?? 0);
                    })
                    .map((route, index) => (
                      <tr
                        key={`${route.airline}-${route.lastStop}-${index}`}
                        className={cn(
                          'hover:bg-neutral-50',
                          route.classification === 'sanction' && 'bg-red-50/50'
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-neutral-900">{route.airline}</span>
                          <span className="text-neutral-500 ml-2 text-sm">{route.airlineName}</span>
                        </td>
                        <td className="px-4 py-3 text-neutral-900">{route.lastStop}</td>
                        <td className="px-4 py-3 text-right font-medium text-neutral-900">
                          {route.inadCount}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-600">
                          {route.pax.toLocaleString(localeFormat)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-neutral-900">
                          {route.density !== null ? `${route.density.toFixed(4)}‰` : '–'}
                        </td>
                        <td className="px-4 py-3">{getClassificationBadge(route.classification)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Top 10 Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Last Stops */}
        <div className="bg-white border border-neutral-200 p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-4">{t('top10LastStops')}</h4>
          <div className="space-y-3">
            {top10.lastStops.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-medium text-neutral-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-neutral-900">{item.name}</span>
                </div>
                <span className="text-neutral-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Airlines */}
        <div className="bg-white border border-neutral-200 p-6">
          <h4 className="text-lg font-bold text-neutral-900 mb-4">{t('top10Airlines')}</h4>
          <div className="space-y-3">
            {top10.airlines.map((item, index) => (
              <div key={item.code} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-medium text-neutral-600">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-neutral-900">{item.code}</span>
                    <span className="text-neutral-500 ml-2 text-sm">{item.name}</span>
                  </div>
                </div>
                <span className="text-neutral-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
