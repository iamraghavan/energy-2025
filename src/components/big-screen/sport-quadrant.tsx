
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SportQuadrantProps {
  sportName: string;
}

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

export function SportQuadrant({ sportName }: SportQuadrantProps) {
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
    
    // Re-fetch all data on any change to simplify state management
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

// Sub-component for Live Match display
function LiveMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-black/40 p-3 rounded-md border-l-4 border-destructive">
      <div className="flex justify-between items-center text-lg">
        <div className="flex items-center gap-3 font-semibold flex-1 truncate">
            <Avatar className="w-8 h-8 border-2 border-gray-600">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={teamOneName} data-ai-hint="logo" />
                <AvatarFallback>{teamOneName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate">{teamOneName}</span>
        </div>
        <AnimatePresence mode="wait">
            <motion.div
            key={match.pointsA}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-bold text-white tabular-nums"
            >
            {match.pointsA}
            </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between items-center mt-1 text-lg">
        <div className="flex items-center gap-3 font-semibold flex-1 truncate">
             <Avatar className="w-8 h-8 border-2 border-gray-600">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={teamTwoName} data-ai-hint="logo" />
                <AvatarFallback>{teamTwoName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate">{teamTwoName}</span>
        </div>
         <AnimatePresence mode="wait">
            <motion.div
            key={match.pointsB}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-bold text-white tabular-nums"
            >
            {match.pointsB}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-component for Upcoming Match display
function UpcomingMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-gray-800/50 p-3 rounded-md border-l-4 border-cyan-500">
        <div className="flex items-center justify-between text-base">
            <span className="font-medium truncate">{teamOneName}</span>
            <span className="text-gray-400 mx-2">vs</span>
            <span className="font-medium truncate text-right">{teamTwoName}</span>
        </div>
    </div>
  );
}
