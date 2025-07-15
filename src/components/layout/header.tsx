'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface UserData {
  username: string;
  role: string;
}

export function Header() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'superadmin') return '/super-admin-dashboard';
    if (user?.role === 'lv2admin') return '/lv2-admin-dashboard';
    return '/';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-egspgoi-logo.png?alt=media&token=b401f7dd-c3ed-4a30-84b7-8222ba965250"
              alt="EGS Pillay Group of Institutions Logo"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-logo.png?alt=media&token=49e75a63-950b-4ed2-a0f7-075ba54ace2e"
              alt="Energy 2025 Logo"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
