'use client';

import * as React from 'react';
import { School } from 'lucide-react';

import { SchoolsTable } from '@/components/admin/schools-table';

export default function SchoolsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <School className="w-8 h-8 text-primary" />
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Manage Schools</h1>
            <p className="text-muted-foreground">
                Add, view, edit, or remove participating schools from the system.
            </p>
        </div>
      </div>
      <SchoolsTable />
    </div>
  );
}
