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
    <div className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Super Admin!</CardTitle>
            <CardDescription>
              You have full access to all administrative features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Select an option from the sidebar to manage schools, teams, and more.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
