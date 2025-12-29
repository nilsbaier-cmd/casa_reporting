import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SwissCoatProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SwissCoat({ className, size = 'md' }: SwissCoatProps) {
  const sizes = {
    sm: { width: 24, height: 28 },
    md: { width: 32, height: 38 },
    lg: { width: 48, height: 56 },
  };

  const { width, height } = sizes[size];

  return (
    <Image
      src="/swiss-coat.svg"
      alt="Schweizer Wappen"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
