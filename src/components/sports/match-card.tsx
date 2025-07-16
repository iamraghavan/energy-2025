import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchAPI, Team } from '@/lib/types';
import { Clock } from 'lucide-react';

interface MatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
  hideSportIcon?: boolean;
}

export function MatchCard({ match, teamOne, teamTwo, hideSportIcon = false }: MatchCardProps) {
  const { sport, pointsA, pointsB, status, scheduledAt } = match;

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';

  const time = new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Card className="w-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!hideSportIcon && <span className="truncate font-semibold">{sport}</span>}
          </div>
          {status === 'live' && (
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                <span className="text-xs font-semibold text-destructive uppercase">Live</span>
            </div>
          )}
          {status === 'completed' && <Badge variant="secondary">Finished</Badge>}
          {(status === 'scheduled' || status === 'upcoming') && time && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{time}</span>
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-11 items-center gap-2 text-center">
          {/* Team 1 */}
          <div className="col-span-5 flex flex-col items-center justify-center gap-1">
            <p className="font-semibold text-base text-foreground truncate">{team1Name}</p>
            {status !== 'scheduled' && status !== 'upcoming' && (
              <p className="font-bold text-4xl text-primary tabular-nums tracking-tight">{pointsA}</p>
            )}
          </div>
          
          {/* Separator */}
          <div className="col-span-1 text-center">
            <span className="font-semibold text-lg text-muted-foreground">
              {(status === 'scheduled' || status === 'upcoming') ? 'vs' : '-'}
            </span>
          </div>

          {/* Team 2 */}
          <div className="col-span-5 flex flex-col items-center justify-center gap-1">
            <p className="font-semibold text-base text-foreground truncate">{team2Name}</p>
            {status !== 'scheduled' && status !== 'upcoming' && (
              <p className="font-bold text-4xl text-primary tabular-nums tracking-tight">{pointsB}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
