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
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
      aria-label="Schweizer Wappen"
      role="img"
    >
      {/* Shield shape - classic heraldic form */}
      <path
        d="M16 0 L496 0 L496 224 Q496 400 256 512 Q16 400 16 224 Z"
        fill="#D32F2F"
      />
      {/* White cross - horizontal bar */}
      <rect x="96" y="192" width="320" height="128" fill="white" />
      {/* White cross - vertical bar */}
      <rect x="192" y="96" width="128" height="320" fill="white" />
    </svg>
  );
}
