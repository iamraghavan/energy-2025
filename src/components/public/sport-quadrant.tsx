'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatchCard } from '@/components/sports/match-card';
// import { SportIcon } from '@/components/sports/sports-icons';
import type { MatchAPI, Team } from '@/lib/types';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { socket } from '@/services/socket';
import { Separator } from '../ui/separator';

interface SportQuadrantProps {
  sportName: string;
}

export function SportQuadrant({ sportName }: SportQuadrantProps) {
  const { toast } = useToast();
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);

        const teamsMap = new Map(fetchedTeams.map((t) => [t._id, t]));
        setTeams(teamsMap);

        const sportMatches = fetchedMatches.filter(
          (m) => m.sport.toLowerCase() === sportName.toLowerCase()
        );
        setMatches(
          sportMatches.sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
          )
        );
      } catch (error) {
        toast({
          variant: 'destructive',
          title: `Failed to fetch ${sportName} data`,
          description:
            'Could not load match or team data. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // --- Real-time WebSocket Logic ---
    socket.connect();

    function onScoreUpdate(updatedMatch: MatchAPI) {
      // Only process updates relevant to this quadrant's sport
      if (updatedMatch.sport.toLowerCase() === sportName.toLowerCase()) {
         setMatches((prevMatches) => {
           const matchExists = prevMatches.some(m => m._id === updatedMatch._id);
           
           if (matchExists) {
             // If match exists, update it
             return prevMatches.map(m => m._id === updatedMatch._id ? updatedMatch : m);
           } else {
             // If it's a new match for this sport, add it
             return [...prevMatches, updatedMatch];
           }
        });
      }
    }

    socket.on('scoreUpdate', onScoreUpdate);

    // Cleanup on component unmount
    return () => {
      socket.off('scoreUpdate', onScoreUpdate);
      socket.disconnect();
    };
  }, [sportName, toast]);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
    .slice(0, 3); // Limit to next 3 upcoming matches

  return (
    <Card className="h-full flex flex-col bg-slate-900/80 border-slate-700 text-white shadow-2xl backdrop-blur-sm">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-4xl font-extrabold flex items-center gap-3 text-white tracking-wider">
          {/* <SportIcon sportName={sportName} className="w-10 h-10 text-amber-400" /> */}
          {sportName.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-red-500 flex items-center gap-2">
                 <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                LIVE
              </h3>
              <div className="space-y-3">
                {liveMatches.length > 0 ? (
                  liveMatches.map((match) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      teamOne={teams.get(match.teamA)}
                      teamTwo={teams.get(match.teamB)}
                    />
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">
                    No live matches right now.
                  </p>
                )}
              </div>
            </div>
            
            <Separator className="bg-slate-700" />

            <div>
              <h3 className="text-2xl font-bold mb-2 text-cyan-400">UPCOMING</h3>
              <div className="space-y-3">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      teamOne={teams.get(match.teamA)}
                      teamTwo={teams.get(match.teamB)}
                    />
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">
                    No upcoming matches scheduled.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
