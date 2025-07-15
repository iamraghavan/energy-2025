'use client';

import * as React from 'react';
import { School } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SchoolsTable } from '@/components/admin/schools-table';

export default function SchoolsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <School className="w-8 h-8 text-primary" />
          <CardTitle className="text-3xl">Manage Schools</CardTitle>
        </div>
        <CardDescription>
          Add, view, edit, or remove participating schools from the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SchoolsTable />
      </CardContent>
    </Card>
  );
}
