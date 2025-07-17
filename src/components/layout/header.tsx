
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, Instagram, Facebook, Linkedin, Twitter, Youtube, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const navLinks = [
  { href: '/live', label: 'Live Matches' },
  { href: '/#upcoming-matches', label: 'Upcoming Matches' },
  { href: 'https://www.youtube.com', label: 'YouTube Live', target: '_blank' },
];

const socialLinks = [
    { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
    { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
    { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
    { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
    { href: 'https://youtube.com', label: 'YouTube', icon: Youtube },
]

export function Header() {
  const { user, logout } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const getDashboardLink = () => {
    if (!user) return '/login';
    const encodedId = btoa(user.id);
    switch (user.role) {
      case 'superadmin': return '/super-admin-dashboard';
      case 'lv2admin': return '/lv2-admin-dashboard';
      case 'scorekeeper': return `/scorekeeper-dashboard/${encodedId}`;
      default: return '/';
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-4">
             <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-egspgoi-logo.png?alt=media&token=b401f7dd-c3ed-4a30-84b7-8222ba965250"
              alt="EGS Pillay Group of Institutions Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-logo.png?alt=media&token=49e75a63-950b-4ed2-a0f7-075ba54ace2e"
              alt="Energy 2025 Inter-School Sports Meet Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} target={link.target} className="text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
                {socialLinks.map(social => (
                     <Button key={social.label} variant="ghost" size="icon" asChild>
                        <Link href={social.href} target="_blank" aria-label={social.label}>
                            <social.icon className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                ))}
            </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
          )}

           <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                     <div className="flex flex-col h-full">
                        <nav className="flex flex-col gap-4 text-lg font-medium mt-8">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    target={link.target} 
                                    className="text-muted-foreground transition-colors hover:text-primary"
                                    onClick={() => setIsSheetOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto pt-4">
                            <p className="mb-2 font-semibold text-muted-foreground">Follow Us</p>
                             <div className="flex items-center gap-2">
                                {socialLinks.map(social => (
                                    <Button key={social.label} variant="ghost" size="icon" asChild>
                                        <Link href={social.href} target="_blank" aria-label={social.label}>
                                            <social.icon className="h-5 w-5 text-muted-foreground" />
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                     </div>
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}
