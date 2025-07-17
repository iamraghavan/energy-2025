
'use client';

import type { MatchAPI, Team } from '@/lib/types';

export function BigScreenUpcomingCard({ match }: { match: { teamOne?: Team, teamTwo?: Team } & MatchAPI }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-white p-3 rounded-md text-black text-center">
        <div className="flex items-center justify-between text-lg font-semibold">
            <span className="flex-1 truncate text-right">{teamOneName}</span>
            <span className="text-muted-foreground mx-4 font-normal">vs</span>
            <span className="flex-1 truncate text-left">{teamTwoName}</span>
        </div>
    </div>
  );
}
