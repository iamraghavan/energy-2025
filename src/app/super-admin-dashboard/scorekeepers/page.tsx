
'use client';

import * as React from 'react';
import { UserPlus } from 'lucide-react';
import { ScorekeepersTable } from '@/components/admin/scorekeepers-table';

export default function ScorekeepersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-primary" />
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Manage Scorekeepers</h1>
            <p className="text-muted-foreground">
                Add, view, or remove scorekeeper accounts from the system.
            </p>
        </div>
      </div>
      <ScorekeepersTable />
    </div>
  );
}
