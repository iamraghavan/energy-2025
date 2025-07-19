
'use client';

import type { MatchAPI, Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MatchCard } from '@/components/sports/match-card';
import { UpcomingMatchCard } from '@/components/sports/upcoming-match-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SportQuadrantProps {
  sportName: string;
  matches: MatchAPI[];
  teamsMap: Map<string, Team>;
}

export function SportQuadrant({ sportName, matches, teamsMap }: SportQuadrantProps) {
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'upcoming');

  return (
    <Card className="bg-gray-800/30 backdrop-blur-sm border border-white/10 flex flex-col h-full overflow-hidden shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-primary text-center">{sportName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-4 h-full overflow-hidden">
        {/* Live Matches Section */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm uppercase text-red-400 tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </h3>
          <Separator className="bg-white/10" />
           <ScrollArea className="flex-1 h-32 pr-3">
              <div className="space-y-2">
                {liveMatches.length > 0 ? (
                  liveMatches.map(match => (
                    <MatchCard key={match._id} match={match} teamOne={teamsMap.get(match.teamA)} teamTwo={teamsMap.get(match.teamB)} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center text-sm pt-4">No live matches.</p>
                )}
              </div>
          </ScrollArea>
        </div>
        
        {/* Upcoming Matches Section */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm uppercase text-blue-400 tracking-widest">UPCOMING</h3>
          <Separator className="bg-white/10" />
          <ScrollArea className="flex-1 h-32 pr-3">
              <div className="space-y-2">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map(match => (
                    <UpcomingMatchCard key={match._id} match={match} teamOne={teamsMap.get(match.teamA)} teamTwo={teamsMap.get(match.teamB)} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center text-sm pt-4">No upcoming matches.</p>
                )}
              </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
