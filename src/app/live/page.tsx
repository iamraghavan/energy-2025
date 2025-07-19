
'use client';

import * as React from 'react';
import Image from 'next/image';
import { getTeams } from '@/services/team-service';
import type { Team, MatchAPI, PopulatedMatch } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMatches } from '@/services/match-service';
import { CountdownTimer } from '@/components/common/countdown-timer';

export default function BigScreenPage() {
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const populateMatches = React.useCallback((matchesToPopulate: MatchAPI[], teams: Map<string, Team>): PopulatedMatch[] => {
    return matchesToPopulate
      .map(match => ({
        ...match,
        teamOne: teams.get(match.teamA),
        teamTwo: teams.get(match.teamB),
      }))
      .filter(m => m.teamOne && m.teamTwo) as PopulatedMatch[];
  }, []);

  React.useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [fetchedTeams, fetchedMatches] = await Promise.all([
                getTeams(), 
                getMatches(),
            ]);
            
            const newTeamsMap = new Map<string, Team>(fetchedTeams.map((team) => [team._id, team]));
            setTeamsMap(newTeamsMap);

            const sortedMatches = fetchedMatches.sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
            setMatches(populateMatches(sortedMatches, newTeamsMap));

        } catch (error) {
            console.error("Failed to fetch initial data", error);
            toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not load initial data. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchInitialData();
  }, [toast, populateMatches]);

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    
    const handleMatchUpdate = (updatedMatch: MatchAPI) => {
        setMatches(prev => {
            const currentTeamsMap = new Map(teamsMap);
            const index = prev.findIndex(m => m._id === updatedMatch._id);
            const populatedUpdate = populateMatches([updatedMatch], currentTeamsMap)[0];
            if (index > -1) {
                const newMatches = [...prev];
                newMatches[index] = populatedUpdate;
                return newMatches;
            }
            return [...prev, populatedUpdate];
        });
    };
    
    const handleMatchCreated = (newMatch: MatchAPI) => {
        const currentTeamsMap = new Map(teamsMap);
        const populatedNewMatch = populateMatches([newMatch], currentTeamsMap)[0];
        setMatches(prev => [populatedNewMatch, ...prev].sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
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
  }, [teamsMap, populateMatches]);
  
  if (isLoading) {
    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <Header />
            <main className="flex-1 container mx-auto p-4 flex">
                <div className="flex flex-col w-full items-center justify-center text-center gap-4 p-8">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-semibold">Loading Live Display...</p>
                    <p className="text-sm text-muted-foreground/50">Fetching matches from server...</p>
                </div>
            </main>
        </div>
    );
  }
  
  const liveMatches = matches.filter(m => m.status === 'live').sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'upcoming').sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const nextMatch = upcomingMatches[0];

  const renderLayout = () => {
    const liveCount = liveMatches.length;

    if (liveCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-white/50 gap-8">
          <Image 
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-logo.png?alt=media&token=49e75a63-950b-4ed2-a0f7-075ba54ace2e"
              alt="Energy 2025 Logo"
              width={200}
              height={200}
              className="opacity-20"
              priority
              data-ai-hint="logo"
          />
          <h2 className="text-3xl font-bold">No Matches Are Currently Live</h2>
          {nextMatch ? (
              <div>
                  <p className="text-xl mb-4">Next match starts in:</p>
                  <CountdownTimer targetDate={nextMatch.scheduledAt} />
              </div>
          ) : (
              <p className="text-xl">Check back soon for upcoming matches!</p>
          )}
        </div>
      );
    }

    if (liveCount === 1) {
        return <SportQuadrant match={liveMatches[0]} isFullScreen />;
    }
    
    if (liveCount === 2) {
        return (
            <div className="grid md:grid-cols-2 gap-4 w-full h-full">
                <SportQuadrant match={liveMatches[0]} />
                <SportQuadrant match={liveMatches[1]} />
            </div>
        );
    }
    
    if (liveCount === 3) {
        return (
            <div className="grid md:grid-cols-2 md:grid-rows-2 gap-4 w-full h-full">
                <div className="md:row-span-2">
                    <SportQuadrant match={liveMatches[0]} isFullScreen={false} />
                </div>
                <SportQuadrant match={liveMatches[1]} />
                <SportQuadrant match={liveMatches[2]} />
            </div>
        );
    }

    // For 4 or more matches
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 w-full h-full">
            {liveMatches.slice(0, 4).map(match => (
                <SportQuadrant key={match._id} match={match} />
            ))}
        </div>
    );
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
        <Header />
        <main className="flex-1 container mx-auto p-4 flex">
           <AnimatePresence>
                <motion.div
                    key={liveMatches.length}
                    className="w-full h-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                >
                    {renderLayout()}
                </motion.div>
            </AnimatePresence>
        </main>
    </div>
  );
}


// Child component for each sport quadrant
interface SportQuadrantProps {
  match: PopulatedMatch;
  isFullScreen?: boolean;
}

function SportQuadrant({ match, isFullScreen = false }: SportQuadrantProps) {
  if (!match || !match.teamOne || !match.teamTwo) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col h-full overflow-hidden items-center justify-center">
        <p className="text-muted-foreground">Waiting for match data...</p>
      </div>
    );
  }

  const teamOneName = match.teamOne.name;
  const teamTwoName = match.teamTwo.name;

  const titleSize = isFullScreen ? 'text-4xl md:text-5xl' : 'text-3xl';
  const scoreSize = isFullScreen ? 'text-8xl md:text-9xl' : 'text-7xl';
  const teamNameSize = isFullScreen ? 'text-3xl md:text-4xl' : 'text-2xl';

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex flex-col h-full overflow-hidden shadow-lg">
      <div className="text-center mb-4 pb-2 border-b border-white/10">
        <h2 className={`${titleSize} font-bold uppercase tracking-wider text-primary`}>{match.sport}</h2>
      </div>

      <div className="flex-1 grid grid-cols-11 items-center justify-center gap-2">
        {/* Team One */}
        <div className="col-span-5 flex flex-col items-center justify-center gap-4 text-center">
            <h3 className={`${teamNameSize} font-bold text-white text-balance h-24 flex items-center`}>{teamOneName}</h3>
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${match._id}-a-${match.pointsA}`}
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`${scoreSize} font-black text-white tabular-nums tracking-tighter`}
                >
                {match.pointsA}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="col-span-1 flex items-center justify-center">
            <span className="font-light text-4xl text-gray-400">vs</span>
        </div>
        
        {/* Team Two */}
        <div className="col-span-5 flex flex-col items-center justify-center gap-4 text-center">
            <h3 className={`${teamNameSize} font-bold text-white text-balance h-24 flex items-center`}>{teamTwoName}</h3>
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${match._id}-b-${match.pointsB}`}
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`${scoreSize} font-black text-white tabular-nums tracking-tighter`}
                >
                {match.pointsB}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
