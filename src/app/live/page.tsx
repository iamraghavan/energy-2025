
'use client';

import * as React from 'react';
import type { MatchAPI, Team } from '@/lib/types';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';
import { SportQuadrant } from '@/components/sports/sport-quadrant';

const DISPLAY_SPORTS = ['Badminton', 'Kabaddi', 'Volleyball', 'Table Tennis'];

export default function BigScreenPage() {
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teamsMap, setTeamsMap] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

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

        const sortedMatches = fetchedMatches.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setMatches(sortedMatches);

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
  }, [toast]);

  React.useEffect(() => {
    socket.connect();

    const handleMatchUpdate = (updatedMatch: MatchAPI) => {
      setMatches(prev => {
        const index = prev.findIndex(m => m._id === updatedMatch._id);
        if (index > -1) {
          const newMatches = [...prev];
          newMatches[index] = updatedMatch;
          return newMatches;
        }
        return [...prev, updatedMatch];
      });
    };

    const handleMatchCreated = (newMatch: MatchAPI) => {
      setMatches(prev => [newMatch, ...prev].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
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
      socket.disconnect();
    };
  }, []);

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
  
  const getMatchesForSport = (sportName: string) => {
    return matches.filter(m => m.sport.toLowerCase() === sportName.toLowerCase());
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <Header />
      <main className="flex-1 container mx-auto p-4 flex">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
            {DISPLAY_SPORTS.map(sportName => (
                <SportQuadrant 
                    key={sportName}
                    sportName={sportName}
                    matches={getMatchesForSport(sportName)}
                    teamsMap={teamsMap}
                />
            ))}
        </div>
      </main>
    </div>
  );
}
