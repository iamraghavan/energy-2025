
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

// This page now acts as a redirector.
// It ensures the user is logged in and then forwards them to their specific dashboard.
export default function ScorekeeperRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      if (user && user.role === 'scorekeeper') {
        const encodedId = btoa(user.id);
        router.replace(`/scorekeeper-dashboard/${encodedId}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-2">Redirecting to your dashboard...</p>
    </div>
  );
}
