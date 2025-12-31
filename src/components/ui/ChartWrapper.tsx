'use client';

import { useRef, useState, useCallback } from 'react';
import { Maximize2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function ChartWrapper({ children, title, subtitle, className }: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  const handleExitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

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

  // Listen for fullscreen changes
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  // Add event listener for fullscreen changes
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-white border border-neutral-200 relative group',
        isFullscreen && 'fixed inset-0 z-50 flex flex-col overflow-auto',
        className
      )}
    >
      {/* Header with title and action buttons */}
      <div className={cn(
        'flex items-start justify-between border-b border-neutral-200 px-6 py-4',
        isFullscreen && 'bg-white'
      )}>
        <div>
          <h4 className="text-lg font-bold text-neutral-900">{title}</h4>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className={cn(
          'flex items-center gap-2',
          !isFullscreen && 'opacity-0 group-hover:opacity-100 transition-opacity'
        )}>
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Als PNG herunterladen"
            aria-label="Als PNG herunterladen"
          >
            <Download className="w-4 h-4" />
          </button>
          {isFullscreen ? (
            <button
              onClick={handleExitFullscreen}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Vollbild beenden"
              aria-label="Vollbild beenden"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFullscreen}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Vollbild"
              aria-label="Vollbild"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart content */}
      <div className={cn(
        'chart-content p-6',
        isFullscreen && 'flex-1 overflow-auto'
      )}>
        {children}
      </div>
    </div>
  );
}
