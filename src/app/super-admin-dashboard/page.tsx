import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Super Admin!</h1>
        <p className="text-muted-foreground">
          You have full access to all administrative features. Here's a quick overview.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Manage Schools</CardTitle>
              <School className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardDescription>
              Add, edit, or remove participating schools from the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/super-admin-dashboard/schools">
                <PlusCircle className="mr-2" />
                Add New School
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle>Manage Teams</CardTitle>
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardDescription>
              View and manage teams for each school and sport.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild>
              <Link href="/super-admin-dashboard/teams">
                 View Teams
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
