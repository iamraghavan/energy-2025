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
  <div className="flex flex-col items-center gap-2 w-28">
    <Avatar className="w-12 h-12">
      {logo && <AvatarImage src={logo} alt={name} data-ai-hint="logo" />}
      <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <span className="font-semibold text-sm text-center truncate w-full">
      {name}
    </span>
  </div>
);

export function MatchCard({ match }: MatchCardProps) {
  const { sport, team1, team2, status, time } = match;

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
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

        <div className="flex items-center justify-between">
          <TeamDisplay name={team1.name} logo={team1.logo} />
          
          <div className="text-center px-2">
            {status !== 'upcoming' ? (
              <span className="font-bold text-3xl text-foreground tabular-nums tracking-tight">
                {team1.score} - {team2.score}
              </span>
            ) : (
               <span className="font-semibold text-xl text-muted-foreground">vs</span>
            )}
          </div>

          <TeamDisplay name={team2.name} logo={team2.logo} />
        </div>
      </CardContent>
    </Card>
  );
}
