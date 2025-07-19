
'use client';

import * as React from 'react';
import { getTeams } from '@/services/team-service';
import type { Team, MatchAPI, SportAPI, QuadrantConfig } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Loader2, RadioTower } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { getMatches } from '@/services/match-service';
import { getLayout } from '@/services/layout-service';
import { getSports } from '@/services/sport-service';

interface PopulatedMatch extends MatchAPI {
  teamOne?: Team;
  teamTwo?: Team;
}

const defaultLayout: QuadrantConfig = {
    quadrant1: null,
    quadrant2: null,
    quadrant3: null,
    quadrant4: null,
};

export default function BigScreenPage() {
  const [layoutConfig, setLayoutConfig] = React.useState<QuadrantConfig | null>(null);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  const [sportsMap, setSportsMap] = React.useState<Map<string, string>>(new Map());
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const populateMatches = React.useCallback((matchesToPopulate: MatchAPI[], teams: Map<string, Team>): PopulatedMatch[] => {
    return matchesToPopulate.map(match => ({
      ...match,
      teamOne: teams.get(match.teamA),
      teamTwo: teams.get(match.teamB),
    }));
  }, []);

  React.useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [fetchedTeams, fetchedMatches, fetchedLayout, fetchedSports] = await Promise.all([
                getTeams(), 
                getMatches(),
                getLayout().catch(() => defaultLayout),
                getSports()
            ]);
            
            const newTeamsMap = new Map<string, Team>(fetchedTeams.map((team) => [team._id, team]));
            setTeamsMap(newTeamsMap);

            const newSportsMap = new Map<string, string>(fetchedSports.map(sport => [sport.sportId, sport.name]));
            setSportsMap(newSportsMap);

            setMatches(populateMatches(fetchedMatches, newTeamsMap));
            setLayoutConfig(fetchedLayout || defaultLayout);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not load initial data. Displaying default layout.',
            });
            setLayoutConfig(defaultLayout);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchInitialData();

    if (!socket.connected) {
      socket.connect();
    }
    
    const onConnect = () => socket.emit('getLayout');
    const onCurrentLayout = (newLayout: QuadrantConfig) => setLayoutConfig(newLayout);
    const onLayoutUpdate = (newLayout: QuadrantConfig) => {
        setLayoutConfig(newLayout);
    };
    
    const handleMatchUpdate = (updatedMatch: MatchAPI) => {
        setMatches(prev => {
            const index = prev.findIndex(m => m._id === updatedMatch._id);
            const populatedUpdate = populateMatches([updatedMatch], teamsMap)[0];
            if (index > -1) {
                const newMatches = [...prev];
                newMatches[index] = populatedUpdate;
                return newMatches;
            }
            return [...prev, populatedUpdate];
        });
    };
    
    const handleMatchCreated = (newMatch: MatchAPI) => {
        const populatedNewMatch = populateMatches([newMatch], teamsMap)[0];
        setMatches(prev => [populatedNewMatch, ...prev]);
    };

    const handleMatchDeleted = ({ matchId }: { matchId: string }) => {
        setMatches(prev => prev.filter(m => m._id !== matchId));
    };

    socket.on('connect', onConnect);
    socket.on('currentLayout', onCurrentLayout);
    socket.on('layoutUpdate', onLayoutUpdate);
    socket.on('matchUpdated', handleMatchUpdate);
    socket.on('matchCreated', handleMatchCreated);
    socket.on('matchDeleted', handleMatchDeleted);
    socket.on('scoreUpdate', handleMatchUpdate);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('currentLayout', onCurrentLayout);
      socket.off('layoutUpdate', onLayoutUpdate);
      socket.off('matchUpdated', handleMatchUpdate);
      socket.off('matchCreated', handleMatchCreated);
      socket.off('matchDeleted', handleMatchDeleted);
      socket.off('scoreUpdate', handleMatchUpdate);
    };
  }, [toast, populateMatches, teamsMap]);
  
  if (isLoading || !layoutConfig) {
    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <Header />
            <main className="flex-1 container mx-auto p-4 flex">
                <div className="flex flex-col w-full items-center justify-center text-center gap-4 p-8">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-semibold">Loading Live Display...</p>
                    <p className="text-sm text-muted-foreground/50">Fetching layout from server...</p>
                </div>
            </main>
        </div>
    );
  }

  const activeSportIds = Object.values(layoutConfig).filter((sportId): sportId is string => !!sportId);
  const uniqueActiveSportIds = [...new Set(activeSportIds)];
  
  const gridCols = uniqueActiveSportIds.length > 1 ? 'grid-cols-2' : 'grid-cols-1';
  const gridRows = uniqueActiveSportIds.length > 2 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
        <Header />
        <main className="flex-1 container mx-auto p-4 flex">
            <div className={`grid ${gridCols} ${gridRows} gap-4 w-full h-full`}>
                <AnimatePresence>
                    {uniqueActiveSportIds.map((sportId, index) => {
                        const sportName = sportsMap.get(sportId);
                        if (!sportName) return null;

                        const sportMatches = matches.filter(m => m.sport.toLowerCase() === sportName.toLowerCase());
                        const liveMatches = sportMatches.filter(m => m.status === 'live').sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                        const upcomingMatches = sportMatches.filter(m => m.status === 'scheduled' || m.status === 'upcoming').sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).slice(0, 4);
                        
                        return (
                             <motion.div
                                key={`${sportId}-${index}`}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="h-full"
                             >
                                <SportQuadrant 
                                    sportName={sportName}
                                    liveMatches={liveMatches}
                                    upcomingMatches={upcomingMatches}
                                />
                             </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </main>
    </div>
  );
}


// Child component for each sport quadrant
interface SportQuadrantProps {
  sportName: string;
  liveMatches: PopulatedMatch[];
  upcomingMatches: PopulatedMatch[];
}

function SportQuadrant({ sportName, liveMatches, upcomingMatches }: SportQuadrantProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 text-primary">
        <h2 className="text-3xl font-bold uppercase tracking-wider">{sportName}</h2>
      </div>

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
    </div>
  );
}

function LiveMatchCard({ match }: { match: PopulatedMatch }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30 w-full text-center">
       {/* Team Names & Scores */}
       <div className="flex justify-between items-center">
            <h3 className="flex-1 text-lg font-bold text-white text-center truncate">{teamOneName}</h3>
            <div className="flex items-center justify-center flex-shrink-0 mx-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${match._id}-a-${match.pointsA}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-6xl font-black text-white tabular-nums tracking-tighter"
                    >
                    {match.pointsA}
                    </motion.div>
                </AnimatePresence>
                <span className="mx-4 text-gray-400 font-light text-2xl">vs</span>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${match._id}-b-${match.pointsB}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-6xl font-black text-white tabular-nums tracking-tighter"
                    >
                    {match.pointsB}
                    </motion.div>
                </AnimatePresence>
            </div>
            <h3 className="flex-1 text-lg font-bold text-white text-center truncate">{teamTwoName}</h3>
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
