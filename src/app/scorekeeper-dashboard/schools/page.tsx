
'use client';

import * as React from 'react';
import { School, ArrowLeft } from 'lucide-react';

import { SchoolsTable } from '@/components/admin/schools-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function SchoolsPage() {
    const { user } = useAuth();
    const dashboardUrl = user ? `/scorekeeper-dashboard/${btoa(user.id)}` : '/login';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href={dashboardUrl}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
            </Link>
        </Button>
        <div className="flex items-center gap-3">
            <School className="w-8 h-8 text-primary" />
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Schools</h1>
                <p className="text-muted-foreground">
                    Add, view, edit, or remove participating schools from the system.
                </p>
            </div>
        </div>
      </div>
      <SchoolsTable />
    </div>
  );
}
