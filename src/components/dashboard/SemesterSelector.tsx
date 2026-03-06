'use client';

import { useState, useMemo } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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

  // Filter semesters by search query — must be before early return (Rules of Hooks)
  const filteredSemesters = useMemo(() => {
    if (!searchQuery.trim()) return availableSemesters;
    const q = searchQuery.toLowerCase();
    return availableSemesters.filter((s) => {
      const halfLabel = s.half === 1 ? 'jan jun h1' : 'jul dez dec h2';
      return s.label.toLowerCase().includes(q) || halfLabel.includes(q) || String(s.year).includes(q);
    });
  }, [availableSemesters, searchQuery]);

  // Show placeholder if no data loaded yet
  if (!inadData || availableSemesters.length === 0) {
    return (
      <div className="relative bg-white border-2 border-neutral-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" aria-hidden="true" />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-neutral-100 text-neutral-400">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="font-bold text-neutral-900">{t('title')}</p>
          </div>
          <p className="text-sm text-neutral-500">{t('placeholder')}</p>
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

  // availableSemesters is sorted DESCENDING: index 0 = newest, last = oldest
  const currentIndex = selectedSemester
    ? availableSemesters.findIndex((s) => s.label === selectedSemester.label)
    : -1;

  // ◀ = older = higher index; ▶ = newer = lower index
  const canGoOlder = currentIndex >= 0 && currentIndex < availableSemesters.length - 1;
  const canGoNewer = currentIndex > 0;

  const handleGoOlder = () => {
    if (canGoOlder) {
      setSelectedSemester(availableSemesters[currentIndex + 1]);
    }
  };

  const handleGoNewer = () => {
    if (canGoNewer) {
      setSelectedSemester(availableSemesters[currentIndex - 1]);
    }
  };

  // Quick access: most recent semester ≤ today's date
  // Array is desc, so first match from the start is the newest that qualifies
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentHalf = now.getMonth() < 6 ? 1 : 2;
  const currentSemester = availableSemesters
    .find((s) => s.year < currentYear || (s.year === currentYear && s.half <= currentHalf))
    ?? availableSemesters[0];

  // Quick access: one semester older than current selection (higher index = older)
  const previousSemester = currentIndex >= 0 && currentIndex < availableSemesters.length - 1
    ? availableSemesters[currentIndex + 1]
    : null;

  return (
    <div className="relative bg-white border-2 border-neutral-200">
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" aria-hidden="true" />
      <div className="p-5">
        {/* Title row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-neutral-100 text-neutral-600">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="font-bold text-neutral-900">{t('title')}</p>
        </div>

        {/* Controls row - all on one line */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick access buttons */}
          <button
            onClick={() => setSelectedSemester(currentSemester)}
            className={`h-9 px-3 text-xs font-medium border transition-colors ${
              selectedSemester?.label === currentSemester.label
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            {t('current')}
          </button>

          {previousSemester && (
            <button
              onClick={() => setSelectedSemester(previousSemester)}
              className={`h-9 px-3 text-xs font-medium border transition-colors ${
                selectedSemester?.label === previousSemester.label
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
              }`}
            >
              {t('previousPeriod')}
            </button>
          )}

          {/* ◀ older / ▶ newer navigation */}
          <button
            onClick={handleGoOlder}
            disabled={!canGoOlder}
            title={t('previousSemester')}
            className="h-9 w-9 flex items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoNewer}
            disabled={!canGoNewer}
            title={t('nextSemester')}
            className="h-9 w-9 flex items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-9 pl-8 pr-3 text-sm border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 w-40 transition-colors"
            />
          </div>

          {/* Semester dropdown */}
          <Select
            value={selectedSemester?.label || ''}
            onValueChange={handleSemesterChange}
          >
            <SelectTrigger className="h-9 w-auto min-w-[160px] border-neutral-300 focus:border-red-600 focus:ring-red-600">
              <SelectValue placeholder={t('select')} />
            </SelectTrigger>
            <SelectContent>
              {filteredSemesters.map((semester) => (
                <SelectItem key={semester.label} value={semester.label}>
                  {semester.label} ({semester.half === 1 ? t('janJun') : t('julDec')})
                </SelectItem>
              ))}
              {filteredSemesters.length === 0 && searchQuery && (
                <div className="px-2 py-1.5 text-sm text-neutral-500">—</div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
