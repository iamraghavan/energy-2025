
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import type { MatchAPI, Team } from '@/lib/types';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import { socket } from '@/services/socket';
import { SportIcon } from '@/components/sports/sports-icons';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface SportQuadrantProps {
  sportName: string;
}

export function SportQuadrant({ sportName }: SportQuadrantProps) {
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);

        const teamsMap = new Map<string, Team>(
          fetchedTeams.map((team) => [team._id, team])
        );
        setTeams(teamsMap);

        const filteredMatches = fetchedMatches
          .filter((m) => m.sport.toLowerCase() === sportName.toLowerCase())
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
          );

        setMatches(filteredMatches);
      } catch (err) {
        console.error(`Failed to fetch data for ${sportName}:`, err);
        setError(`Could not load data for ${sportName}.`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();

    function onScoreUpdate(updatedMatch: MatchAPI) {
      if (updatedMatch.sport.toLowerCase() === sportName.toLowerCase()) {
        setMatches((prevMatches) =>
          prevMatches.map((m) =>
            m._id === updatedMatch._id ? { ...m, ...updatedMatch } : m
          )
        );
      }
    }

    socket.on('scoreUpdate', onScoreUpdate);

    return () => {
      socket.off('scoreUpdate', onScoreUpdate);
      socket.disconnect();
    };
  }, [sportName]);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'scheduled');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center border-r-2 border-b-2 border-gray-700 bg-gray-800/50 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }
  
  if (error) {
      return (
           <div className="flex flex-col items-center justify-center border-r-2 border-b-2 border-gray-700 bg-red-900/50 p-4">
                <h2 className="text-2xl font-bold text-red-300">{error}</h2>
            </div>
      )
  }

  return (
    <div className="flex flex-col border-r-2 border-b-2 border-gray-700 bg-gray-800/50 p-4 lg:p-6 overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <SportIcon sportName={sportName} className="w-10 h-10 text-indigo-400" />
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight uppercase">
          {sportName}
        </h1>
      </div>

      <div className="flex-grow flex flex-col gap-6">
        {/* Live Matches Section */}
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold text-red-500 mb-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            LIVE
          </h2>
          <div className="space-y-3">
            {liveMatches.length > 0 ? (
              liveMatches.map((match) => (
                <LiveMatchCard key={match._id} match={match} teams={teams} />
              ))
            ) : (
              <p className="text-lg text-gray-400">No live matches.</p>
            )}
          </div>
        </div>

        <Separator className="bg-gray-600" />

        {/* Upcoming Matches Section */}
        <div className="flex-grow overflow-y-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">UPCOMING</h2>
          <div className="space-y-3 pr-2">
             {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <UpcomingMatchCard
                  key={match._id}
                  match={match}
                  teams={teams}
                />
              ))
            ) : (
              <p className="text-lg text-gray-400">No upcoming matches.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveMatchCard({ match, teams }: { match: MatchAPI, teams: Map<string, Team> }) {
  const teamOne = teams.get(match.teamA);
  const teamTwo = teams.get(match.teamB);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-center w-2/5">
          <p className="text-xl lg:text-2xl font-bold truncate">{teamOne?.name || 'Team A'}</p>
        </div>
        <div className="text-center w-1/5">
            <p className="text-lg font-mono text-gray-400">vs</p>
        </div>
        <div className="text-center w-2/5">
          <p className="text-xl lg:text-2xl font-bold truncate">{teamTwo?.name || 'Team B'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
         <motion.div
            key={match.pointsA}
            initial={{ scale: 1.2, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center w-2/5"
          >
            <p className="text-5xl lg:text-7xl font-bold text-yellow-400 tabular-nums">{match.pointsA}</p>
         </motion.div>
        <div className="text-center w-1/5">
           <p className="text-4xl text-gray-500">-</p>
        </div>
        <motion.div
            key={match.pointsB}
            initial={{ scale: 1.2, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center w-2/5"
          >
            <p className="text-5xl lg:text-7xl font-bold text-yellow-400 tabular-nums">{match.pointsB}</p>
        </motion.div>
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">{match.venue} ({match.courtNumber})</p>
    </div>
  );
}

function UpcomingMatchCard({ match, teams }: { match: MatchAPI, teams: Map<string, Team> }) {
  const teamOne = teams.get(match.teamA);
  const teamTwo = teams.get(match.teamB);

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between text-base">
      <div className="w-2/5 font-semibold truncate text-left">{teamOne?.name || 'Team A'}</div>
      <div className="w-1/5 text-center text-indigo-300 font-mono">
        {format(new Date(match.scheduledAt), 'HH:mm')}
      </div>
      <div className="w-2/5 font-semibold truncate text-right">{teamTwo?.name || 'Team B'}</div>
    </div>
  );
}
