'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Maximize2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ChartWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function ChartWrapper({ children, title, subtitle, className }: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen, closeModal]);

  const handleDownloadPng = useCallback(async () => {
    if (!containerRef.current || isExporting) return;

    setIsExporting(true);

    try {
      // Dynamic import to avoid SSR issues
      const { toPng } = await import('html-to-image');

      // Find the chart container (skip the header)
      const chartContent = containerRef.current.querySelector('.chart-content') as HTMLElement;
      if (!chartContent) {
        setIsExporting(false);
        return;
      }

      const dataUrl = await toPng(chartContent, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          padding: '20px',
        },
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting chart:', err);
    } finally {
      setIsExporting(false);
    }
  }, [title, isExporting]);

  // Modal content - rendered in portal
  const modalContent = isModalOpen && isMounted && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chart-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className="relative bg-white w-[90vw] h-[90vh] max-w-7xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50">
          <div>
            <h4 id="chart-modal-title" className="text-xl font-bold text-neutral-900">{title}</h4>
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Als PNG herunterladen"
              aria-label="Als PNG herunterladen"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={closeModal}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Schliessen"
              aria-label="Modal schliessen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body - chart content */}
        <div className="flex-1 overflow-auto p-6 chart-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'bg-white border border-neutral-200 relative group',
          className
        )}
      >
        {/* Header with title and action buttons */}
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h4 className="text-lg font-bold text-neutral-900">{title}</h4>
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Als PNG herunterladen"
              aria-label="Als PNG herunterladen"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={openModal}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Vergrössern"
              aria-label="Im Modal öffnen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart content */}
        <div className="chart-content p-6">
          {children}
        </div>
      </div>

      {/* Modal portal */}
      {modalContent}
    </>
  );
}
