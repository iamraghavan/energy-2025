'use client';

import * as React from 'react';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Loader2, RadioTower, Frown, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BigScreenLiveCard } from '@/components/big-screen/big-screen-live-card';
import { BigScreenUpcomingCard } from '@/components/big-screen/big-screen-upcoming-card';

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

export default function LiveMatchesPage() {
  const { toast } = useToast();
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);

        const teamsMap = new Map<string, Team>(fetchedTeams.map((team) => [team._id, team]));
        const populatedMatches = fetchedMatches.map(match => ({
          ...match,
          teamOne: teamsMap.get(match.teamA),
          teamTwo: teamsMap.get(match.teamB),
        }));
        
        setMatches(populatedMatches);
        setTeams(teamsMap);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to fetch data',
          description: 'Could not load match or team data. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();

    function onScoreUpdate(updatedMatch: MatchAPI) {
      setMatches((prevMatches) => {
          const matchIndex = prevMatches.findIndex((m) => m._id === updatedMatch._id);
          let newMatches = [...prevMatches];
          
          if (matchIndex > -1) {
              const currentMatch = newMatches[matchIndex];
              // Update the match with new data, but keep populated team info
              newMatches[matchIndex] = {
                  ...currentMatch, // Keeps teamOne, teamTwo
                  ...updatedMatch, // Overwrites with new score, status etc.
              };
          } else {
              // This is a new match not previously fetched. We'll need to find its teams.
              const teamsMap = new Map(teams.entries());
              newMatches.push({
                  ...updatedMatch,
                  teamOne: teamsMap.get(updatedMatch.teamA),
                  teamTwo: teamsMap.get(updatedMatch.teamB),
              });
          }
          return newMatches;
      });
    }

    socket.on('scoreUpdate', onScoreUpdate);

    return () => {
      socket.off('scoreUpdate', onScoreUpdate);
      socket.disconnect();
    };
  }, [toast, teams]);
  
  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">

        {isLoading ? (
          <div className="flex flex-col h-[80vh] items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Loading live data...</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            
            {/* Live Matches Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-destructive/20 rounded-full">
                        <RadioTower className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-destructive">LIVE</h1>
                        <p className="text-gray-400">All ongoing matches, updated in real-time.</p>
                    </div>
                </div>
                <div className="flex-1 bg-black/20 rounded-lg p-4 space-y-3 overflow-y-auto">
                     <AnimatePresence>
                        {liveMatches.length > 0 ? (
                        liveMatches.map((match) => (
                            <motion.div
                            key={match._id}
                            layout
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            >
                            <BigScreenLiveCard match={match} />
                            </motion.div>
                        ))
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                                <Frown className="w-16 h-16" />
                                <h2 className="text-2xl font-semibold mt-4">No Live Matches</h2>
                                <p className="max-w-sm">There are no matches being played right now.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Upcoming Matches Column */}
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                     <div className="p-3 bg-cyan-500/20 rounded-full">
                        <CalendarClock className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-cyan-400">UP NEXT</h1>
                        <p className="text-gray-400">The next few matches in the schedule.</p>
                    </div>
                </div>
                 <div className="flex-1 bg-black/20 rounded-lg p-4 space-y-3 overflow-y-auto">
                    <AnimatePresence>
                        {upcomingMatches.length > 0 ? (
                        upcomingMatches.map((match) => (
                            <motion.div
                                key={match._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                            >
                                <BigScreenUpcomingCard match={match} />
                            </motion.div>
                        ))
                        ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                            <Frown className="w-16 h-16" />
                            <h2 className="text-xl font-semibold mt-4">No Upcoming Matches</h2>
                        </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
