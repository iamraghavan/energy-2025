
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { Separator } from '@/components/ui/separator';

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

// Custom card components defined locally for this page only
// This ensures these styles do not affect other parts of the application.

function LiveMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive w-full flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center w-full">
        <h3 className="text-xl font-bold text-white truncate text-right flex-1">{teamOneName}</h3>
        <span className="mx-4 text-gray-400 font-light">vs</span>
        <h3 className="text-xl font-bold text-white truncate text-left flex-1">{teamTwoName}</h3>
      </div>
      
      <Separator className="bg-destructive/50 my-2" />

      <div className="flex items-center justify-center w-full mt-2">
        {/* Team A Score */}
        <div className="flex-1">
            <AnimatePresence mode="wait">
                <motion.div
                key={match.pointsA}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-7xl font-black text-white tabular-nums tracking-tighter"
                >
                {match.pointsA}
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="w-[1px] h-16 bg-gray-700 mx-4"></div>

        {/* Team B Score */}
        <div className="flex-1">
             <AnimatePresence mode="wait">
                <motion.div
                key={match.pointsB}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-7xl font-black text-white tabular-nums tracking-tighter"
                >
                {match.pointsB}
                </motion.div>
            </AnimatePresence>
        </div>
       </div>
    </div>
  );
}


function UpcomingMatchCard({ match }: { match: PopulatedMatch }) {
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


// Main Page Component
export default function BigScreenPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-2rem)]">
        <SportQuadrant sportName="Kabaddi" />
        <SportQuadrant sportName="Volleyball" />
        <SportQuadrant sportName="Basketball" />
        <SportQuadrant sportName="Football" />
      </main>
    </div>
  );
}

// Quadrant Component
function SportQuadrant({ sportName }: { sportName: string }) {
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const populateAndSetMatches = React.useCallback(async (fetchedMatches: MatchAPI[], allTeams: Team[]) => {
      const teamsMap = new Map<string, Team>(allTeams.map((t) => [t._id, t]));
      const sportMatches = fetchedMatches
        .filter((m) => m.sport.toLowerCase() === sportName.toLowerCase())
        .map((match) => ({
          ...match,
          teamOne: teamsMap.get(match.teamA),
          teamTwo: teamsMap.get(match.teamB),
        }));

      setMatches(sportMatches);
  }, [sportName]);


  React.useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);
        await populateAndSetMatches(fetchedMatches, fetchedTeams);
      } catch (error) {
        console.error(`Failed to fetch data for ${sportName}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();
    
    const handleMatchChange = async () => {
         try {
            const [fetchedMatches, fetchedTeams] = await Promise.all([
                getMatches(),
                getTeams(),
            ]);
            await populateAndSetMatches(fetchedMatches, fetchedTeams);
        } catch(error) {
            console.error('Failed to refetch matches on socket event', error);
        }
    };
    
    socket.on('matchUpdated', handleMatchChange);
    socket.on('matchCreated', handleMatchChange);
    socket.on('matchDeleted', handleMatchChange);
    socket.on('scoreUpdate', handleMatchChange);


    return () => {
      socket.off('matchUpdated', handleMatchChange);
      socket.off('matchCreated', handleMatchChange);
      socket.off('matchDeleted', handleMatchChange);
      socket.off('scoreUpdate', handleMatchChange);
      socket.disconnect();
    };
  }, [sportName, populateAndSetMatches]);

  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 text-primary">
        <h2 className="text-3xl font-bold uppercase tracking-wider">{sportName}</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
          {/* Live Matches */}
          <div>
            <h3 className="text-xl font-semibold text-destructive mb-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              LIVE
            </h3>
            <div className="space-y-3">
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
                      <LiveMatchCard match={match} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No live matches.</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">UPCOMING</h3>
            <div className="space-y-3">
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
                            <UpcomingMatchCard match={match} />
                        </motion.div>
                    ))
                    ) : (
                    <p className="text-center text-gray-400 py-4">No upcoming matches.</p>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
