
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Clock, Loader2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { SportIcon } from '../sports/sports-icons';
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

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);

        const teamsMap = new Map<string, Team>(fetchedTeams.map((t) => [t._id, t]));
        const sportMatches = fetchedMatches
          .filter((m) => m.sport.toLowerCase() === sportName.toLowerCase())
          .map((match) => ({
            ...match,
            teamOne: teamsMap.get(match.teamA),
            teamTwo: teamsMap.get(match.teamB),
          }));

        setMatches(sportMatches);
      } catch (error) {
        console.error(`Failed to fetch data for ${sportName}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();

    function onScoreUpdate(updatedMatch: MatchAPI) {
      setMatches((prevMatches) => {
        const matchExists = prevMatches.some((m) => m._id === updatedMatch._id);
        if (matchExists) {
          // Update existing match
          return prevMatches.map((m) =>
            m._id === updatedMatch._id ? { ...m, ...updatedMatch } : m
          );
        } else {
          // It's a new match for this sport, add it (unlikely but safe)
          if (updatedMatch.sport.toLowerCase() === sportName.toLowerCase()) {
             const newPopulatedMatch = {
                ...updatedMatch,
                teamOne: undefined, // We might need to fetch this if it's a new match entirely
                teamTwo: undefined,
             };
             // A full team fetch might be needed here in a more complex scenario
             return [...prevMatches, newPopulatedMatch];
          }
        }
        return prevMatches;
      });
    }

    socket.on('scoreUpdate', onScoreUpdate);

    return () => {
      socket.off('scoreUpdate', onScoreUpdate);
      socket.disconnect();
    };
  }, [sportName]);

  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 text-primary">
        <SportIcon sportName={sportName} className="w-8 h-8" />
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
      <div className="text-sm text-cyan-300 mt-2 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{format(new Date(match.scheduledAt), 'p')} @ {match.venue}</span>
      </div>
    </div>
  );
}
