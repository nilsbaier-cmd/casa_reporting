'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /login to /admin/login for backwards compatibility
export default function LegacyLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-12 h-12 border-2 border-neutral-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}
