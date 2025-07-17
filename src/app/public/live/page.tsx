
'use client';

import * as React from 'react';
import { Loader2, Frown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PopulatedMatch extends MatchAPI {
  teamOne?: Team;
  teamTwo?: Team;
}

// ====================================================================
// New Card Components (Local to this page)
// ====================================================================

// Variation 2: Professional Live Card
function LiveMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 w-full h-full flex items-center justify-center text-center shadow-lg">
      <div className="flex w-full items-stretch justify-center gap-4">
        {/* Team A Panel */}
        <div className="flex-1 bg-primary/80 rounded-lg p-4 flex flex-col justify-center items-center gap-2 text-primary-foreground">
          <h3 className="text-xl md:text-2xl font-bold truncate w-full">{teamOneName}</h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={`a-${match.pointsA}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter"
            >
              {match.pointsA}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* VS Separator */}
        <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-400">VS</span>
        </div>

        {/* Team B Panel */}
        <div className="flex-1 bg-gray-700/80 rounded-lg p-4 flex flex-col justify-center items-center gap-2">
            <h3 className="text-xl md:text-2xl font-bold truncate w-full">{teamTwoName}</h3>
            <AnimatePresence mode="wait">
                 <motion.div
                    key={`b-${match.pointsB}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter"
                >
                    {match.pointsB}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Variation 2: Professional Upcoming Card
function UpcomingMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-md border-l-4 border-cyan-500 text-white shadow-md">
        <div className='flex justify-end mb-2'>
            <Badge variant="outline" className="border-cyan-500 text-cyan-400">COMING UP</Badge>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold">
            <span className="flex-1 truncate text-left">{teamOneName}</span>
            <span className="text-muted-foreground mx-4 font-normal">vs</span>
            <span className="flex-1 truncate text-right">{teamTwoName}</span>
        </div>
    </div>
  );
}

// ====================================================================
// Quadrant Component
// ====================================================================

interface SportQuadrantProps {
  sportName: string;
}

function SportQuadrant({ sportName }: SportQuadrantProps) {
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

  const liveMatch = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    [0]; // Get only the most recent live match

  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 2); // Get next 2 upcoming

  return (
    <div className="bg-black/20 border border-primary/20 rounded-lg p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 text-primary">
        <h2 className="text-3xl font-bold uppercase tracking-wider">{sportName}</h2>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Live Match */}
          <div className="flex-1 min-h-[60%]">
             <AnimatePresence>
              {liveMatch ? (
                  <motion.div
                    key={liveMatch._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <LiveMatchCard match={liveMatch} />
                  </motion.div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 bg-gray-900/50 rounded-lg">
                    <Frown className="w-16 h-16" />
                    <h2 className="text-2xl font-semibold mt-4">No Live Match</h2>
                    <p>Waiting for the next match to begin.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <Separator className="bg-primary/20" />

          {/* Upcoming Matches */}
          <div className="space-y-3">
            <AnimatePresence>
                {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                    <motion.div
                        key={match._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        <UpcomingMatchCard match={match} />
                    </motion.div>
                ))
                ) : (
                <p className="text-center text-gray-500 py-2">No upcoming matches.</p>
                )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}


// ====================================================================
// Main Page Component
// ====================================================================
const sportsToShow = ['Kabaddi', 'Volleyball', 'Basketball', 'Football'];

export default function PublicLivePage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
            <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {sportsToShow.map(sport => (
                    <SportQuadrant key={sport} sportName={sport} />
                ))}
            </main>
        </div>
    );
}
