import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchAPI, Team } from '@/lib/types';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface MatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function MatchCard({ match, teamOne, teamTwo }: MatchCardProps) {
  const { pointsA, pointsB, status } = match;

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';
  
  const getStatusVariant = (): 'destructive' | 'secondary' => {
    switch (status) {
        case 'live': return 'destructive';
        case 'completed':
        default: return 'secondary';
    }
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold text-sm text-muted-foreground">{match.sport}</h3>
        <Badge variant={getStatusVariant()} className="capitalize">{status}</Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-11 items-center gap-2 text-center">
          {/* Team 1 */}
          <div className="col-span-5 flex flex-col items-center justify-center gap-1">
            <p className="font-semibold text-base text-foreground text-center break-words">{team1Name}</p>
            <p className="font-bold text-4xl text-primary tabular-nums tracking-tight">{pointsA}</p>
          </div>
          
          {/* Separator */}
          <div className="col-span-1 text-center">
            <span className="font-bold text-xl text-destructive">
              vs
            </span>
          </div>

          {/* Team 2 */}
          <div className="col-span-5 flex flex-col items-center justify-center gap-1">
            <p className="font-semibold text-base text-foreground text-center break-words">{team2Name}</p>
            <p className="font-bold text-4xl text-primary tabular-nums tracking-tight">{pointsB}</p>
          </div>
        </div>
      </CardContent>
       <CardFooter className="flex-col sm:flex-row text-xs text-muted-foreground gap-x-4 gap-y-1 justify-center items-center border-t pt-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{match.venue} ({match.courtNumber})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(match.scheduledAt), 'p, MMM d')}</span>
          </div>
      </CardFooter>
    </Card>
  );
}
