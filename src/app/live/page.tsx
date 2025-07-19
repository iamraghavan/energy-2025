'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { Header } from '@/components/layout/header';

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

// Sub-component for Live Match display
function LiveMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-destructive/10 border-l-4 border-destructive p-3 rounded-lg w-full">
      <div className="flex items-center justify-between text-white font-semibold text-lg">
        {/* Team A */}
        <div className="flex-1 text-center truncate pr-2">
            <p className="text-wrap: balance;">{teamOneName}</p>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-md">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`a-${match.pointsA}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold tabular-nums"
                    >
                    {match.pointsA}
                </motion.div>
            </AnimatePresence>
            <span className="text-2xl text-gray-400">vs</span>
             <AnimatePresence mode="wait">
                <motion.div
                    key={`b-${match.pointsB}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold tabular-nums"
                    >
                    {match.pointsB}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Team B */}
         <div className="flex-1 text-center truncate pl-2">
            <p className="text-wrap: balance;">{teamTwoName}</p>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Upcoming Match display
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


interface SportQuadrantProps {
  sportName: string;
  matches: PopulatedMatch[];
  isLoading: boolean;
}

function SportQuadrant({ sportName, matches, isLoading }: SportQuadrantProps) {
  const liveMatches = matches
    .filter((m) => m.status === 'live' && m.sport.toLowerCase() === sportName.toLowerCase())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const upcomingMatches = matches
    .filter((m) => (m.status === 'scheduled' || m.status === 'upcoming') && m.sport.toLowerCase() === sportName.toLowerCase())
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


export default function BigScreenPage() {
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  const populateMatch = React.useCallback((match: MatchAPI, teams: Map<string, Team>): PopulatedMatch => {
    return {
      ...match,
      teamOne: teams.get(match.teamA),
      teamTwo: teams.get(match.teamB),
    };
  }, []);
  
  // Initial data fetch
  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);
        const newTeamsMap = new Map<string, Team>(fetchedTeams.map((t) => [t._id, t]));
        setTeamsMap(newTeamsMap);
        
        const populated = fetchedMatches.map(m => populateMatch(m, newTeamsMap));
        setMatches(populated);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [populateMatch]);


  // Socket listeners for real-time updates
  React.useEffect(() => {
    socket.connect();
    
    function onMatchCreated(newMatch: MatchAPI) {
        setMatches(prevMatches => [...prevMatches, populateMatch(newMatch, teamsMap)]);
    }

    function onMatchUpdated(updatedMatch: MatchAPI) {
      setMatches(prevMatches => 
        prevMatches.map(m => m._id === updatedMatch._id ? populateMatch(updatedMatch, teamsMap) : m)
      );
    }
    
    function onMatchDeleted({ matchId }: { matchId: string }) {
        setMatches(prevMatches => prevMatches.filter(m => m._id !== matchId));
    }
    
    socket.on('matchCreated', onMatchCreated);
    socket.on('matchUpdated', onMatchUpdated);
    socket.on('matchDeleted', onMatchDeleted);
    socket.on('scoreUpdate', onMatchUpdated); // Keep for compatibility

    return () => {
      socket.off('matchCreated', onMatchCreated);
      socket.off('matchUpdated', onMatchUpdated);
      socket.off('matchDeleted', onMatchDeleted);
      socket.off('scoreUpdate', onMatchUpdated);
      socket.disconnect();
    };
  }, [teamsMap, populateMatch]);


  const sportsToShow = ["Badminton", "Kabaddi", "Volleyball", "Table Tennis"];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
       <Header />
      <main className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 h-[calc(100vh-6rem)] mt-4">
        {sportsToShow.map(sport => (
           <SportQuadrant 
                key={sport} 
                sportName={sport} 
                matches={matches}
                isLoading={isLoading}
            />
        ))}
      </main>
    </div>
  );
}
