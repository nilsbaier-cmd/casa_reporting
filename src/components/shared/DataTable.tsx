'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
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
  searchable?: boolean;
  searchPlaceholder?: string;
  searchableKeys?: string[];
  paginate?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  filterElement?: React.ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  rowClassName,
  emptyMessage,
  searchable = false,
  searchPlaceholder,
  searchableKeys,
  paginate = false,
  initialPageSize = 25,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  filterElement,
}: DataTableProps<T>) {
  const tTable = useTranslations('table');
  const tCommon = useTranslations('common');
  const defaultEmptyMessage = emptyMessage ?? tTable('noData');

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

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

  const effectiveSearchKeys = useMemo(() => {
    if (searchableKeys && searchableKeys.length > 0) {
      return searchableKeys;
    }
    return columns.map((column) => String(column.key));
  }, [columns, searchableKeys]);

  const searchedData = useMemo(() => {
    if (!searchable) return data;

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return data;

    return data.filter((row) =>
      effectiveSearchKeys.some((key) => {
        const value = (row as Record<string, unknown>)[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(normalizedQuery);
      })
    );
  }, [data, searchable, query, effectiveSearchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return searchedData;

    return [...searchedData].sort((a, b) => {
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
  }, [searchedData, sortKey, sortDirection]);

  const totalRows = sortedData.length;
  const normalizedPageSize = pageSizeOptions.includes(pageSize) ? pageSize : pageSizeOptions[0];
  const totalPages = paginate ? Math.max(1, Math.ceil(totalRows / normalizedPageSize)) : 1;
  const currentPage = paginate ? Math.min(page, totalPages) : 1;
  const startIndex = paginate ? (currentPage - 1) * normalizedPageSize : 0;

  const visibleData = paginate
    ? sortedData.slice(startIndex, startIndex + normalizedPageSize)
    : sortedData;

  const showSearchNoResults = searchable && data.length > 0 && totalRows === 0;

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
    return <div className="text-center py-12 text-neutral-500">{defaultEmptyMessage}</div>;
  }

  return (
    <div>
      {(searchable || paginate || filterElement) && (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:max-w-sm md:flex-1">
            {searchable && (
              <>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={searchPlaceholder ?? tTable('searchPlaceholder')}
                  className="w-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
                  aria-label={searchPlaceholder ?? tCommon('search')}
                />
              </>
            )}
          </div>

          {filterElement && (
            <div className="flex items-center gap-2">
              {filterElement}
            </div>
          )}

          {paginate && (
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span>{tTable('rowsPerPage')}</span>
              <select
                value={normalizedPageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="border border-neutral-300 bg-white px-2 py-1 text-xs focus:outline-none"
                aria-label={tTable('rowsPerPage')}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {showSearchNoResults ? (
        <div className="text-center py-12 text-neutral-500">{tTable('noResults')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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

            <tbody className="divide-y divide-neutral-200">
              {visibleData.map((row, index) => (
                <tr
                  key={getRowKey(row)}
                  className={cn(
                    'hover:bg-neutral-50 transition-colors',
                    'animate-sem-fade-in opacity-0',
                    rowClassName?.(row, index, visibleData)
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
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
        <span>
          {tTable('rowCount', { count: totalRows })}
          {searchable && query.trim() ? ` / ${tTable('rowCount', { count: data.length })}` : ''}
        </span>

        {paginate && totalRows > 0 && (
          <div className="flex items-center gap-2 text-neutral-600">
            <span>
              {tTable('pageIndicator', {
                current: currentPage,
                total: totalPages,
              })}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-7 w-7 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={tTable('previousPage')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-7 w-7 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={tTable('nextPage')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
