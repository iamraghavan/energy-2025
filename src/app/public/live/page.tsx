
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

// Main page component
export default function LiveBigScreenPage() {
  const [liveSports, setLiveSports] = React.useState<string[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fixedSports = ["Kabaddi", "Volleyball", "Basketball", "Football"];
  
  React.useEffect(() => {
    async function initialFetch() {
      setIsLoading(true);
      try {
        // Fetch teams only once
        const fetchedTeams = await getTeams();
        const teamsMap = new Map(fetchedTeams.map(t => [t._id, t]));
        setTeams(teamsMap);

        // Fetch matches to determine initial live sports
        const fetchedMatches = await getMatches();
        const currentLiveSports = Array.from(new Set(
            fetchedMatches
                .filter(m => m.status === 'live' && fixedSports.includes(m.sport))
                .map(m => m.sport)
        ));
        setLiveSports(currentLiveSports);
        
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to fetch initial data',
          description: 'Could not load essential team or match data. Please refresh.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    initialFetch();
    
    // This effect is for real-time updates of which sports are live
    const handleLiveStatusChange = async () => {
        try {
            const fetchedMatches = await getMatches();
            const currentLiveSports = Array.from(new Set(
                fetchedMatches
                    .filter(m => m.status === 'live' && fixedSports.includes(m.sport))
                    .map(m => m.sport)
            ));
            setLiveSports(currentLiveSports);
        } catch (error) {
             console.error('Failed to refetch matches for live status update', error);
        }
    }
    
    socket.connect();
    socket.on('matchUpdated', handleLiveStatusChange);
    socket.on('matchCreated', handleLiveStatusChange);
    
    return () => {
        socket.off('matchUpdated', handleLiveStatusChange);
        socket.off('matchCreated', handleLiveStatusChange);
        socket.disconnect();
    }
    
  }, [toast]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Loading Live Sports Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {fixedSports.map(sportName => (
            <SportQuadrant key={sportName} sportName={sportName} teamsMap={teams} />
        ))}
      </div>
    </div>
  );
}

// Quadrant component
interface SportQuadrantProps {
  sportName: string;
  teamsMap: Map<string, Team>;
}

function SportQuadrant({ sportName, teamsMap }: SportQuadrantProps) {
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const populateAndSetMatches = React.useCallback((fetchedMatches: MatchAPI[]) => {
      const sportMatches = fetchedMatches
        .filter((m) => m.sport.toLowerCase() === sportName.toLowerCase())
        .map((match) => ({
          ...match,
          teamOne: teamsMap.get(match.teamA),
          teamTwo: teamsMap.get(match.teamB),
        }));
      setMatches(sportMatches);
  }, [sportName, teamsMap]);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const fetchedMatches = await getMatches();
        populateAndSetMatches(fetchedMatches);
      } catch (error) {
        console.error(`Failed to fetch data for ${sportName}:`, error);
        toast({
          variant: 'destructive',
          title: `Error loading ${sportName}`,
          description: 'Could not load match data.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();
    
    // Re-fetch only matches data on any change
    const handleMatchChange = async () => {
         try {
            const fetchedMatches = await getMatches();
            populateAndSetMatches(fetchedMatches);
        } catch(error) {
            console.error('Failed to refetch matches on socket event', error);
        }
    };
    
    socket.on('matchUpdated', handleMatchChange);
    socket.on('matchCreated', handleMatchChange);
    socket.on('matchDeleted', handleMatchChange);
    
    return () => {
      socket.off('matchUpdated', handleMatchChange);
      socket.off('matchCreated', handleMatchChange);
      socket.off('matchDeleted', handleMatchChange);
      socket.disconnect();
    };
  }, [sportName, populateAndSetMatches, toast]);

  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col h-[48vh] overflow-hidden">
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
    <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive w-full">
        <div className="flex items-center justify-between w-full text-lg font-bold text-white">
            <h3 className="truncate flex-1 text-left">{teamOneName}</h3>
            <span className="mx-4 text-gray-400 font-light">vs</span>
            <h3 className="truncate flex-1 text-right">{teamTwoName}</h3>
        </div>
        <div className="flex items-center justify-between w-full mt-1 text-5xl font-black text-white">
            <AnimatePresence mode="wait">
                 <motion.div
                    key={`${match._id}-a-${match.pointsA}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-left tabular-nums tracking-tighter"
                >
                    {match.pointsA}
                </motion.div>
            </AnimatePresence>
             <AnimatePresence mode="wait">
                <motion.div
                    key={`${match._id}-b-${match.pointsB}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-right tabular-nums tracking-tighter"
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
    <div className="bg-white/90 text-black p-3 rounded-md border-l-4 border-cyan-500">
        <div className="flex items-center justify-between text-base font-semibold">
            <span className="flex-1 truncate text-left">{teamOneName}</span>
            <span className="text-gray-600 mx-2">vs</span>
            <span className="flex-1 truncate text-right">{teamTwoName}</span>
        </div>
    </div>
  );
}
