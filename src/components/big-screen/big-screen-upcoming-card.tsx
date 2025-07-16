'use client';

import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import type { MatchAPI, Team } from '@/lib/types';

export function BigScreenUpcomingCard({ match }: { match: { teamOne?: Team, teamTwo?: Team } & MatchAPI }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-gray-800/50 p-3 rounded-md border-l-4 border-cyan-500 text-white">
        <div className="flex items-center justify-between text-base">
            <span className="font-medium truncate">{teamOneName}</span>
            <span className="text-gray-400 mx-2">vs</span>
            <span className="font-medium truncate text-right">{teamTwoName}</span>
        </div>
      <div className="text-sm text-cyan-300 mt-2 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{format(new Date(match.scheduledAt), 'p')} @ {match.venue}</span>
      </div>
    </div>
  );
}
