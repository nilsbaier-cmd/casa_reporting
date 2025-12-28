'use client';

import { useAnalysisStore } from '@/stores/analysisStore';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SemesterSelector() {
  const {
    availableSemesters,
    selectedSemester,
    setSelectedSemester,
    inadData,
  } = useAnalysisStore();

  // Don't render if no data loaded yet
  if (!inadData || availableSemesters.length === 0) {
    return null;
  }

  const handleSemesterChange = (value: string) => {
    const semester = availableSemesters.find((s) => s.label === value);
    if (semester) {
      setSelectedSemester(semester);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Semester:
          </span>
          <Select
            value={selectedSemester?.label || ''}
            onValueChange={handleSemesterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {availableSemesters.map((semester) => (
                <SelectItem key={semester.label} value={semester.label}>
                  {semester.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSemester && (
            <span className="text-sm text-muted-foreground">
              ({selectedSemester.half === 1 ? 'Jan - Jun' : 'Jul - Dec'})
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
