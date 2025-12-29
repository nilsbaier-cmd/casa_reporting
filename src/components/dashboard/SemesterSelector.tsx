'use client';

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
  const {
    availableSemesters,
    selectedSemester,
    setSelectedSemester,
    inadData,
  } = useAnalysisStore();

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
            <Select
              value={selectedSemester?.label || ''}
              onValueChange={handleSemesterChange}
            >
              <SelectTrigger className="w-full border-neutral-300 focus:border-red-600 focus:ring-red-600">
                <SelectValue placeholder={t('select')} />
              </SelectTrigger>
              <SelectContent>
                {availableSemesters.map((semester) => (
                  <SelectItem key={semester.label} value={semester.label}>
                    {semester.label} ({semester.half === 1 ? t('janJun') : t('julDec')})
                  </SelectItem>
                ))}
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
