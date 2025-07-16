import * as React from 'react';
import { Card } from '@/components/ui/card';
import type { MatchAPI, Team } from '@/lib/types';
import { Clock } from 'lucide-react';

interface MatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
  hideSportIcon?: boolean;
}

export function MatchCard({ match, teamOne, teamTwo }: MatchCardProps) {
  const { pointsA, pointsB, status } = match;

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';

  return (
    <Card className="w-full">
      <div className="p-4">
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
