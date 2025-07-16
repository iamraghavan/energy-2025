
'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CreateMatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthorized } = useAuth();

  useEffect(() => {
    // We only want to run this check after the initial loading is complete.
    if (!isLoading) {
      if (!user || !isAuthorized(['scorekeeper'])) {
        router.replace('/login');
      }
    }
  }, [isLoading, user, isAuthorized, router]);


  if (isLoading || !user || !isAuthorized(['scorekeeper'])) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Verifying Access...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
