'use client';

import { useMemo, useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SemesterSelector() {
  const t = useTranslations('semester');
  const tCommon = useTranslations('common');
  const {
    availableSemesters,
    selectedSemester,
    setSelectedSemester,
    inadData,
  } = useAnalysisStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSemesters = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return availableSemesters;
    return availableSemesters.filter((semester) => {
      const halfLabel = semester.half === 1 ? t('janJun') : t('julDec');
      const combined = `${semester.label} ${halfLabel}`.toLowerCase();
      return combined.includes(normalized);
    });
  }, [availableSemesters, searchQuery, t]);

  // Show placeholder if no data loaded yet
  if (!inadData || availableSemesters.length === 0) {
    return (
      <div className="relative bg-white border-2 border-neutral-200 h-full min-h-[120px]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" aria-hidden="true" />
        <div className="p-6 flex items-start gap-4">
          <div className="p-3 bg-neutral-100 text-neutral-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-neutral-900 mb-1">{t('title')}</p>
            <p className="text-sm text-neutral-500">{t('placeholder')}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSemesterChange = (value: string) => {
    const semester = availableSemesters.find((s) => s.label === value);
    if (semester) {
      setSelectedSemester(semester);
    }
  };

  const latestSemester = availableSemesters[0] ?? null;
  const previousSemester = availableSemesters[1] ?? null;
  const latestFirstHalf = availableSemesters.find((semester) => semester.half === 1) ?? null;
  const latestSecondHalf = availableSemesters.find((semester) => semester.half === 2) ?? null;
  const quickActions = [
    { key: 'current', label: t('quickCurrent'), semester: latestSemester },
    { key: 'previous', label: t('quickPrevious'), semester: previousSemester },
    { key: 'half1', label: t('quickFirstHalf'), semester: latestFirstHalf },
    { key: 'half2', label: t('quickSecondHalf'), semester: latestSecondHalf },
  ].filter(
    (action, index, actions) =>
      action.semester &&
      actions.findIndex((candidate) => candidate.semester?.label === action.semester?.label) === index
  );
  const selectedSemesterDescription = selectedSemester
    ? `${selectedSemester.label} · ${selectedSemester.half === 1 ? t('firstHalf') : t('secondHalf')} ${selectedSemester.year}`
    : null;

  return (
    <div className="relative bg-white border-2 border-neutral-200 min-h-[120px]">
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" aria-hidden="true" />
      <div className="p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neutral-100 text-neutral-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-neutral-900 mb-1">{t('title')}</p>
                <p className="text-sm text-neutral-500">
                  {selectedSemesterDescription ?? t('placeholder')}
                </p>
              </div>
            </div>
            {selectedSemesterDescription && (
              <div className="inline-flex w-fit items-center border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600">
                {selectedSemesterDescription}
              </div>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.7fr)_minmax(260px,1fr)] xl:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                {t('quickAccess')}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => {
                  const isActive = selectedSemester?.label === action.semester?.label;

                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => action.semester && setSelectedSemester(action.semester)}
                      className={`px-3 py-2 text-xs font-medium border transition-colors ${
                        isActive
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="semester-search"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
              >
                {tCommon('search')}
              </label>
              <input
                id="semester-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={tCommon('search')}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                aria-label={tCommon('search')}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                {t('select')}
              </p>
              <Select
                value={selectedSemester?.label || ''}
                onValueChange={handleSemesterChange}
              >
                <SelectTrigger className="w-full border-neutral-300 focus:border-red-600 focus:ring-red-600">
                  <SelectValue placeholder={t('select')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSemesters.map((semester) => (
                    <SelectItem key={semester.label} value={semester.label}>
                      {semester.label} ({semester.half === 1 ? t('janJun') : t('julDec')})
                    </SelectItem>
                  ))}
                  {filteredSemesters.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-neutral-500">{t('noSearchResults')}</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSemester && (
            <p className="text-xs text-neutral-500">
              {selectedSemester.half === 1 ? t('firstHalf') : t('secondHalf')} {selectedSemester.year}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
