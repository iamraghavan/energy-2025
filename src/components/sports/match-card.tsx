import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UIMatch } from '@/lib/types';
import { SportIcon } from './sports-icons';
import { Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MatchCardProps {
  match: UIMatch;
}

export function MatchCard({ match }: MatchCardProps) {
  const { sport, team1, team2, status, time } = match;

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
          {status === 'finished' && <Badge variant="secondary">Finished</Badge>}
          {status === 'upcoming' && time && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{time}</span>
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-11 items-center gap-2 text-center">
          {/* Team 1 */}
          <div className="col-span-5 flex flex-col items-center gap-2">
            <Avatar className="w-10 h-10 border">
              {team1.logo && <AvatarImage src={team1.logo} alt={team1.name} data-ai-hint="logo" />}
              <AvatarFallback>{team1.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground truncate">{team1.name}</p>
              {status !== 'upcoming' && <p className="font-bold text-xl text-primary tabular-nums tracking-tight">{team1.score}</p>}
            </div>
          </div>
          
          {/* Separator */}
          <div className="col-span-1 text-center">
            <span className="font-semibold text-lg text-muted-foreground">
              {status === 'upcoming' ? 'vs' : '-'}
            </span>
          </div>

          {/* Team 2 */}
          <div className="col-span-5 flex flex-col items-center gap-2">
            <Avatar className="w-10 h-10 border">
                {team2.logo && <AvatarImage src={team2.logo} alt={team2.name} data-ai-hint="logo" />}
                <AvatarFallback>{team2.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground truncate">{team2.name}</p>
              {status !== 'upcoming' && <p className="font-bold text-xl text-primary tabular-nums tracking-tight">{team2.score}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
