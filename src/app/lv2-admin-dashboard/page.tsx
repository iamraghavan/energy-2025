import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCog } from 'lucide-react';

export default function Lv2AdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
           <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserCog className="w-16 h-16 text-accent" />
            </div>
            <CardTitle className="text-3xl">L2 Admin Dashboard</CardTitle>
            <CardDescription>
              Access to standard administrative features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Welcome to the L2 Admin Dashboard.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
