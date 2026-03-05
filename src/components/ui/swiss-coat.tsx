import Image from 'next/image';

interface SwissCoatProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SwissCoat({ className, size = 'md' }: SwissCoatProps) {
  const sizes = {
    sm: { width: 22, height: 24 },
    md: { width: 27, height: 30 },
    lg: { width: 40, height: 44 },
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
