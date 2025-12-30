'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin by default
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center animate-sem-fade-in">
        <div className="w-12 h-12 border-2 border-neutral-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
      </div>
    </div>
  );
}
