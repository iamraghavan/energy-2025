'use client';

import { Header } from '@/components/layout/header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ScorekeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user.role === 'scorekeeper') {
          setIsAuthorized(true);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    // You can render a loading spinner here while checking auth
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
