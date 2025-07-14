import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Super Admin Dashboard</CardTitle>
            <CardDescription>
              Full access to all administrative features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Welcome to the Super Admin Dashboard. You have the highest level of permissions.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
