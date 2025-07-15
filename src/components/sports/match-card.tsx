import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Match } from '@/lib/types';
import { SportIcon } from './sports-icons';
import { Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MatchCardProps {
  match: Match;
}

const TeamDisplay = ({ name, logo }: { name: string; logo?: string }) => (
  <div className="flex items-center gap-4">
    <Avatar className="w-12 h-12 border">
      {logo && <AvatarImage src={logo} alt={name} data-ai-hint="logo" />}
      <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <span className="font-semibold text-lg text-foreground truncate">
      {name}
    </span>
  </div>
);

export function MatchCard({ match }: MatchCardProps) {
  const { sport, team1, team2, status, time } = match;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SportIcon sportName={sport} className="w-4 h-4" />
            <span>{sport}</span>
          </div>
          {status === 'live' && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="text-xs font-semibold text-destructive">LIVE</span>
            </div>
          )}
          {status === 'finished' && <Badge variant="secondary">Finished</Badge>}
          {status === 'upcoming' && time && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{time}</span>
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-10 items-center gap-4">
          <div className="col-span-4">
            <TeamDisplay name={team1.name} logo={team1.logo} />
          </div>
          
          <div className="col-span-2 text-center">
            {status !== 'upcoming' ? (
              <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-3xl text-foreground tabular-nums tracking-tight">{team1.score}</span>
                  <span className="font-bold text-2xl text-muted-foreground">-</span>
                  <span className="font-bold text-3xl text-foreground tabular-nums tracking-tight">{team2.score}</span>
              </div>
            ) : (
               <span className="font-semibold text-xl text-muted-foreground">vs</span>
            )}
          </div>

          <div className="col-span-4 flex justify-end">
            <div className="flex items-center gap-4 flex-row-reverse">
                <Avatar className="w-12 h-12 border">
                {team2.logo && <AvatarImage src={team2.logo} alt={team2.name} data-ai-hint="logo" />}
                <AvatarFallback>{team2.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-lg text-foreground truncate text-right">
                {team2.name}
                </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
