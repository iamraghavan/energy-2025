'use client';

import * as React from 'react';
import { getMatches } from '@/services/match-service';
import type { MatchAPI } from '@/lib/types';
import { socket } from '@/services/socket';
import { Header } from '@/components/layout/header';
import { Loader2, Tv } from 'lucide-react';
import { SportQuadrant } from '@/components/big-screen/sport-quadrant';

export default function BigScreenPage() {
  const [liveSports, setLiveSports] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const updateLiveSports = React.useCallback((matches: MatchAPI[]) => {
    const currentLiveSports = matches
      .filter((m) => m.status === 'live')
      .map((m) => m.sport);
    const uniqueSports = [...new Set(currentLiveSports)];
    setLiveSports(uniqueSports);
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const fetchedMatches = await getMatches();
        updateLiveSports(fetchedMatches);
      } catch (error) {
        console.error('Failed to fetch initial match data', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();
    
    // We can just refetch all matches on any update for simplicity
    // as it correctly recalculates all live sports.
    const handleMatchChange = async () => {
        try {
            const fetchedMatches = await getMatches();
            updateLiveSports(fetchedMatches);
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
  }, [updateLiveSports]);

  const gridCols = liveSports.length > 1 ? 'grid-cols-2' : 'grid-cols-1';
  const gridRows = liveSports.length > 2 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Loading live data...</p>
          </div>
        ) : liveSports.length > 0 ? (
          <div className={`flex-1 grid ${gridCols} ${gridRows} gap-4`}>
            {liveSports.map((sport) => (
              <SportQuadrant key={sport} sportName={sport} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
            <Tv className="w-24 h-24" />
            <h1 className="text-4xl font-bold mt-6">Awaiting Live Matches</h1>
            <p className="text-xl mt-2">The big screen will activate once a match goes live.</p>
          </div>
        )}
      </main>
    </div>
  );
}
