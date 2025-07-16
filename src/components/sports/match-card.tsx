import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchAPI, Team } from '@/lib/types';
import { SportIcon } from './sports-icons';
import { Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function MatchCard({ match, teamOne, teamTwo }: MatchCardProps) {
  const { sport, pointsA, pointsB, status, scheduledAt } = match;

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';

  const time = new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SportIcon sportName={sport} className="w-4 h-4" />
            <span className="truncate">{sport}</span>
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
          <div className="col-span-5 flex flex-col items-center gap-2">
            <Avatar className="w-12 h-12 border">
              <AvatarImage src={`https://placehold.co/100x100.png`} alt={team1Name} data-ai-hint="logo" />
              <AvatarFallback>{team1Name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground truncate">{team1Name}</p>
              {status !== 'scheduled' && status !== 'upcoming' && <p className="font-bold text-xl text-primary tabular-nums tracking-tight">{pointsA}</p>}
            </div>
          </div>
          
          {/* Separator */}
          <div className="col-span-1 text-center">
            <span className="font-semibold text-lg text-muted-foreground">
              {(status === 'scheduled' || status === 'upcoming') ? 'vs' : '-'}
            </span>
          </div>

          {/* Team 2 */}
          <div className="col-span-5 flex flex-col items-center gap-2">
            <Avatar className="w-12 h-12 border">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={team2Name} data-ai-hint="logo" />
                <AvatarFallback>{team2Name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground truncate">{team2Name}</p>
              {status !== 'scheduled' && status !== 'upcoming' && <p className="font-bold text-xl text-primary tabular-nums tracking-tight">{pointsB}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
