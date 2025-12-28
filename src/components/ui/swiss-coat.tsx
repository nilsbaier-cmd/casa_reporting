import { cn } from '@/lib/utils';

interface SwissCoatProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SwissCoat({ className, size = 'md' }: SwissCoatProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
      aria-label="Schweizer Wappen"
      role="img"
    >
      {/* Shield background - Red */}
      <rect x="2" y="2" width="28" height="28" rx="2" fill="#D32F2F" />
      {/* White cross - horizontal bar */}
      <rect x="6" y="12" width="20" height="8" fill="white" />
      {/* White cross - vertical bar */}
      <rect x="12" y="6" width="8" height="20" fill="white" />
    </svg>
  );
}
