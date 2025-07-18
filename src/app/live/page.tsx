
'use client';

import * as React from 'react';
import { getTeams } from '@/services/team-service';
import type { Team } from '@/lib/types';
import { socket, type QuadrantConfig } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Loader2, RadioTower } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

import type { MatchAPI } from '@/lib/types';
import { getMatches } from '@/services/match-service';

// Default layout if nothing is received from the admin panel
const defaultLayout: QuadrantConfig = {
    quadrants: ["Kabaddi", "Volleyball", "Football", "Cricket"],
};

export default function BigScreenPage() {
  const [layoutConfig, setLayoutConfig] = React.useState<QuadrantConfig>(defaultLayout);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  const [isLoadingTeams, setIsLoadingTeams] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchInitialData() {
        try {
            const fetchedTeams = await getTeams();
            const newTeamsMap = new Map<string, Team>(fetchedTeams.map((team) => [team._id, team]));
            setTeamsMap(newTeamsMap);
        } catch (error) {
            console.error("Failed to fetch initial team data", error);
            toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not load team data. Some information may be missing.',
            });
        } finally {
            setIsLoadingTeams(false);
        }
    }
    
    fetchInitialData();

    // Establish and manage socket connection
    if (!socket.connected) {
      socket.connect();
    }

    function onLayoutUpdate(newLayout: QuadrantConfig) {
      setLayoutConfig(newLayout);
    }
    
    socket.on('layoutUpdate', onLayoutUpdate);
    
    return () => {
      socket.off('layoutUpdate', onLayoutUpdate);
      // Optional: Disconnect if this is the only page using the socket
      // and you want to clean up resources when the user navigates away.
      // socket.disconnect();
    };
  }, [toast]);
  
  const activeSports = layoutConfig.quadrants.filter((q): q is string => q !== null && q !== 'none');
  const gridCols = activeSports.length > 1 ? 'grid-cols-2' : 'grid-cols-1';
  const gridRows = activeSports.length > 2 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
        <Header />
        <main className="flex-1 container mx-auto p-4 flex">
            {isLoadingTeams ? (
                <div className="flex flex-col w-full items-center justify-center text-center gap-4 p-8">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-semibold">Loading Live Display...</p>
                </div>
            ) : (
                <div className={`grid ${gridCols} ${gridRows} gap-4 w-full h-full`}>
                    {activeSports.map((sportName) => (
                        <SportQuadrant key={sportName} sportName={sportName} teamsMap={teamsMap} />
                    ))}
                </div>
            )}
        </main>
    </div>
  );
}


// Child component for each sport quadrant
interface SportQuadrantProps {
  sportName: string;
  teamsMap: Map<string, Team>;
}

function SportQuadrant({ sportName, teamsMap }: SportQuadrantProps) {
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const populateMatches = React.useCallback((fetchedMatches: MatchAPI[]) => {
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
        populateMatches(fetchedMatches);
      } catch (error) {
        console.error(`Failed to fetch data for ${sportName}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    if (!socket.connected) {
        socket.connect();
    }
    
    const handleMatchUpdate = (updatedMatch: MatchAPI) => {
        if (updatedMatch.sport.toLowerCase() === sportName.toLowerCase()) {
            setMatches(prev => 
                prev.map(m => m._id === updatedMatch._id ? { ...m, teamOne: teamsMap.get(updatedMatch.teamA), teamTwo: teamsMap.get(updatedMatch.teamB), ...updatedMatch } : m)
            );
        }
    };
    
    const handleMatchCreated = (newMatch: MatchAPI) => {
        if (newMatch.sport.toLowerCase() === sportName.toLowerCase()) {
             const populatedMatch = {
                ...newMatch,
                teamOne: teamsMap.get(newMatch.teamA),
                teamTwo: teamsMap.get(newMatch.teamB),
            };
            setMatches(prev => [populatedMatch, ...prev].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()));
        }
    };
    
    const handleMatchDeleted = ({ matchId }: { matchId: string }) => {
        setMatches(prev => prev.filter(m => m._id !== matchId));
    };
    
    socket.on('matchUpdated', handleMatchUpdate);
    socket.on('matchCreated', handleMatchCreated);
    socket.on('matchDeleted', handleMatchDeleted);
    socket.on('scoreUpdate', handleMatchUpdate);

    return () => {
      socket.off('matchUpdated', handleMatchUpdate);
      socket.off('matchCreated', handleMatchCreated);
      socket.off('matchDeleted', handleMatchDeleted);
      socket.off('scoreUpdate', handleMatchUpdate);
    };
  }, [sportName, teamsMap, populateMatches]);

  const liveMatches = matches.filter((m) => m.status === 'live').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const upcomingMatches = matches.filter((m) => m.status === 'scheduled' || m.status === 'upcoming').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).slice(0, 4);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col h-full overflow-hidden">
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
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-destructive mb-2 flex items-center gap-2">
              <RadioTower className="w-6 h-6" />
              LIVE
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {liveMatches.length > 0 ? (
                  liveMatches.map((match) => (
                    <motion.div
                      key={match._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <LiveMatchCard match={match} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4 text-sm">No live matches.</p>
                )}
              </AnimatePresence>
            </div>
          </div>
            
          <Separator className="bg-white/10" />

          {/* Upcoming Matches */}
          <div className="mt-2">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">UP NEXT</h3>
            <div className="space-y-3">
                <AnimatePresence>
                    {upcomingMatches.length > 0 ? (
                    upcomingMatches.map((match) => (
                        <motion.div
                            key={match._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <UpcomingMatchCard match={match} />
                        </motion.div>
                    ))
                    ) : (
                    <p className="text-center text-gray-400 py-4 text-sm">No upcoming matches.</p>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30 w-full text-center">
       {/* Team Names */}
      <div className="flex justify-between items-center text-lg font-bold text-white mb-2">
          <h3 className="flex-1 text-center truncate">{teamOneName}</h3>
          <span className="mx-4 text-gray-400 font-light text-sm">vs</span>
          <h3 className="flex-1 text-center truncate">{teamTwoName}</h3>
      </div>
      {/* Scores */}
       <div className="flex justify-between items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${match._id}-a-${match.pointsA}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-6xl font-black text-white tabular-nums tracking-tighter"
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
                    className="flex-1 text-6xl font-black text-white tabular-nums tracking-tighter"
                >
                {match.pointsB}
                </motion.div>
            </AnimatePresence>
       </div>
    </div>
  );
}

function UpcomingMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-gray-800/50 p-3 rounded-md border-l-4 border-cyan-500 text-center">
        <div className="flex items-center justify-between text-base font-semibold">
            <span className="flex-1 truncate text-center">{teamOneName}</span>
            <span className="text-muted-foreground mx-4 font-normal text-sm">vs</span>
            <span className="flex-1 truncate text-center">{teamTwoName}</span>
        </div>
    </div>
  );
}

    