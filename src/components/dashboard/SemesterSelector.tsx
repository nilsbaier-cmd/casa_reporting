'use client';

import { useMemo, useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Calendar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
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
  const locale = useLocale();
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

  const quickLabelCurrent = locale === 'fr' ? 'Le plus récent' : 'Aktuell';
  const quickLabelPrevious = locale === 'fr' ? 'Précédent' : 'Vorsemester';
  const noSearchResultsLabel = locale === 'fr' ? 'Aucun semestre trouvé' : 'Kein Semester gefunden';

  return (
    <div className="relative bg-white border-2 border-neutral-200 h-full min-h-[120px]">
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" aria-hidden="true" />
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-neutral-100 text-neutral-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-neutral-900 mb-1">{t('title')}</p>
            <div className="mb-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => latestSemester && setSelectedSemester(latestSemester)}
                  disabled={!latestSemester}
                  className="px-2.5 py-1 text-xs font-medium border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {quickLabelCurrent}
                </button>
                <button
                  type="button"
                  onClick={() => previousSemester && setSelectedSemester(previousSemester)}
                  disabled={!previousSemester}
                  className="px-2.5 py-1 text-xs font-medium border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {quickLabelPrevious}
                </button>
              </div>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={tCommon('search')}
                className="w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                aria-label={tCommon('search')}
              />
            </div>
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
                  <div className="px-2 py-1.5 text-xs text-neutral-500">{noSearchResultsLabel}</div>
                )}
              </SelectContent>
            </Select>
            {selectedSemester && (
              <p className="text-xs text-neutral-500 mt-2">
                {selectedSemester.half === 1 ? t('firstHalf') : t('secondHalf')} {selectedSemester.year}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
