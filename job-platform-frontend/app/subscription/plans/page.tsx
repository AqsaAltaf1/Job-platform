'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function SubscriptionPlans() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to pricing page
    router.push('/pricing');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to pricing page...</p>
      </div>
    </div>
  );
}