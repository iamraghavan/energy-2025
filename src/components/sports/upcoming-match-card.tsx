import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { MatchAPI, Team } from '@/lib/types';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

interface UpcomingMatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function UpcomingMatchCard({ match, teamOne, teamTwo }: UpcomingMatchCardProps) {
  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-muted-foreground">{match.sport}</h3>
            <Badge variant="outline" className="capitalize">Upcoming</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
            <p className="font-semibold text-center text-foreground">{team1Name}</p>
            <span className="text-sm font-bold text-destructive">vs</span>
            <p className="font-semibold text-center text-foreground">{team2Name}</p>
        </div>
         <div className="text-center text-xs text-muted-foreground mt-4 space-y-1">
            <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(match.scheduledAt), 'p, MMM d')}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>{match.venue} ({match.courtNumber})</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
