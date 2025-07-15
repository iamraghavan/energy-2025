
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { School, Users, Home, PanelLeft } from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="offcanvas">
          <SidebarContent>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2">
                 <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-egspgoi-logo.png?alt=media&token=b401f7dd-c3ed-4a30-84b7-8222ba965250"
                    alt="ScoreCast Logo"
                    width={32}
                    height={32}
                 />
                 <span className="font-semibold text-lg">ScoreCast</span>
              </Link>
            </SidebarHeader>

            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/super-admin-dashboard')}
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
                  isActive={isActive('/super-admin-dashboard/schools')}
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
                <span className="text-xs text-muted-foreground">v1.0.0</span>
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
           </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
