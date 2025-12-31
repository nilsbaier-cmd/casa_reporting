'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  rowClassName?: (row: T, index: number, allData: T[]) => string;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  rowClassName,
  emptyMessage,
}: DataTableProps<T>) {
  const tTable = useTranslations('table');
  const defaultEmptyMessage = emptyMessage ?? tTable('noData');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortKey];
      const bValue = (b as Record<string, unknown>)[sortKey];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-neutral-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-red-600" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 text-red-600" />;
    }
    return <ChevronsUpDown className="w-4 h-4 text-neutral-400" />;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        {defaultEmptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {/* Header - Swiss institutional style with black background */}
        <thead>
          <tr className="bg-neutral-900 text-white">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 font-bold text-xs uppercase tracking-wider text-left',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.className
                )}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(String(column.key))}
                    className={cn(
                      'flex items-center gap-2 hover:text-neutral-300 transition-colors',
                      column.align === 'right' && 'ml-auto flex-row-reverse',
                      column.align === 'center' && 'mx-auto'
                    )}
                    aria-label={`Sortieren nach ${column.header}`}
                  >
                    <span>{column.header}</span>
                    <SortIcon columnKey={String(column.key)} />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-neutral-200">
          {sortedData.map((row, index) => (
            <tr
              key={getRowKey(row)}
              className={cn(
                'hover:bg-neutral-50 transition-colors',
                'animate-sem-fade-in opacity-0',
                rowClassName?.(row, index, sortedData)
              )}
              style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[String(column.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table footer with row count */}
      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
        {tTable('rowCount', { count: data.length })}
      </div>
    </div>
  );
}
