import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function TeamsPage() {
  return (
    <Card>
      <CardHeader>
         <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <CardTitle className="text-3xl">Manage Teams</CardTitle>
        </div>
        <CardDescription>
          View and manage teams for each school and sport.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          Team management interface will be here.
        </p>
      </CardContent>
    </Card>
  );
}
