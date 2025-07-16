import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MatchAPI, Team } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '../ui/badge';

interface LiveMatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function LiveMatchCard({ match, teamOne, teamTwo }: LiveMatchCardProps) {
  const { sport, pointsA, pointsB, venue, courtNumber } = match;

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';

  return (
    <Card className="w-full shadow-lg border-primary/20 bg-card">
        <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center text-lg md:text-xl">
                 <Badge variant="destructive" className="text-base">LIVE</Badge>
                <span className="font-semibold text-muted-foreground">{sport}</span>
                <span className="text-sm text-muted-foreground">{venue} - {courtNumber}</span>
            </CardTitle>
        </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 items-center gap-4 text-center">
          {/* Team 1 */}
          <div className="flex flex-col items-center justify-center gap-3 p-4 bg-secondary/50 rounded-lg">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2">
              <AvatarImage src={`https://placehold.co/100x100.png`} alt={team1Name} data-ai-hint="logo" />
              <AvatarFallback>{team1Name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center line-clamp-2">{team1Name}</h3>
            <p className="font-bold text-7xl md:text-8xl text-primary tabular-nums tracking-tighter">{pointsA}</p>
          </div>
          
          {/* Team 2 */}
          <div className="flex flex-col items-center justify-center gap-3 p-4 bg-secondary/50 rounded-lg">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={team2Name} data-ai-hint="logo" />
                <AvatarFallback>{team2Name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center line-clamp-2">{team2Name}</h3>
            <p className="font-bold text-7xl md:text-8xl text-primary tabular-nums tracking-tighter">{pointsB}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
