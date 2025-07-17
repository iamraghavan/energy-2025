
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { School, Users, Home, Loader2, UserPlus, User, LogOut } from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

function SuperAdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
           <SidebarContent className="flex flex-col">
            <SidebarHeader>
              <Link href="/" className="flex items-center justify-center p-2">
                 <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-logo.png?alt=media&token=49e75a63-950b-4ed2-a0f7-075ba54ace2e"
                    alt="Energy 2025 Logo"
                    width={80}
                    height={80}
                 />
              </Link>
            </SidebarHeader>

            <SidebarMenu className="flex-1">
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/super-admin-dashboard') && pathname === '/super-admin-dashboard'}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  tooltip={{
                    children: 'Dashboard',
                  }}
                >
                  <Link href="/super-admin-dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/super-admin-dashboard/scorekeepers')}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  tooltip={{
                    children: 'Scorekeepers',
                  }}
                >
                  <Link href="/super-admin-dashboard/scorekeepers">
                    <UserPlus />
                    <span>Scorekeepers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/super-admin-dashboard/schools')}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  tooltip={{
                    children: 'Schools',
                  }}
                >
                  <Link href="/super-admin-dashboard/schools">
                    <School />
                    <span>Schools</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/super-admin-dashboard/teams')}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  tooltip={{
                    children: 'Teams',
                  }}
                >
                  <Link href="/super-admin-dashboard/teams">
                    <Users />
                    <span>Teams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarFooter>
                <span className="text-xs text-muted-foreground text-center">v1.0.0</span>
            </SidebarFooter>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-col">
           <header className="flex h-16 items-center justify-between border-b px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="hidden font-semibold md:block">
                        {pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
                    </div>
                </div>
                {user && (
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
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
           </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function ProtectedSuperAdminLayout({
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

  if (!user || !isAuthorized(['superadmin'])) {
    router.replace('/login');
     return (
       <div className="flex h-screen items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return <SuperAdminDashboardLayout>{children}</SuperAdminDashboardLayout>;
}
