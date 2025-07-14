import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Match } from '@/lib/types';
import { SportIcon } from './sport-icon';
import { Clock } from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const { sport, team1, team2, status, time } = match;

  return (
    <Card className="w-full hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SportIcon sportName={sport} className="w-4 h-4" />
            <span>{sport}</span>
          </div>
          {status === 'live' && <Badge variant="destructive" className="animate-pulse">LIVE</Badge>}
          {status === 'finished' && <Badge variant="secondary">Finished</Badge>}
          {status === 'upcoming' && time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start w-2/5">
            <span className="font-medium text-lg text-right truncate">{team1.name}</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-3xl text-foreground">
              {status !== 'upcoming' ? `${team1.score} - ${team2.score}` : 'vs'}
            </span>
          </div>
          <div className="flex flex-col items-end w-2/5">
            <span className="font-medium text-lg text-left truncate">{team2.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
