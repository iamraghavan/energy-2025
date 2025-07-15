import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { School } from 'lucide-react';

export default function SchoolsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <School className="w-8 h-8 text-primary" />
          <CardTitle className="text-3xl">Manage Schools</CardTitle>
        </div>
        <CardDescription>
          Add, edit, or remove participating schools from the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          School management interface will be here.
        </p>
      </CardContent>
    </Card>
  );
}
