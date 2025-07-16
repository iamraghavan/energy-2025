'use client';

import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ScorekeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthorized } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAuthorized(['scorekeeper'])) {
    router.replace('/login');
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Redirecting...</p>
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
