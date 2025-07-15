'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { TeamsTable } from '@/components/admin/teams-table';

export default function TeamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Manage Teams</h1>
            <p className="text-muted-foreground">
                Add, view, edit, or remove teams for each school and sport.
            </p>
        </div>
      </div>
      <TeamsTable />
    </div>
  );
}
