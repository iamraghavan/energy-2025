
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { getMatches } from '@/services/match-service';
import type { MatchAPI } from '@/lib/types';
import { socket } from '@/services/socket';
import { SportQuadrant } from '@/components/big-screen/sport-quadrant';

export default function BigScreenPage() {
  const [liveSports, setLiveSports] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const updateLiveSports = React.useCallback((matches: MatchAPI[]) => {
    const currentLiveSports = new Set(
      matches
        .filter((m) => m.status === 'live')
        .map((m) => m.sport.toLowerCase())
    );
    setLiveSports(Array.from(currentLiveSports));
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const matches = await getMatches();
        updateLiveSports(matches);
      } catch (error) {
        console.error('Failed to fetch initial match data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    socket.connect();
    
    // On any change, refetch all matches and update the list of live sports.
    const handleMatchChange = async () => {
        try {
            const matches = await getMatches();
            updateLiveSports(matches);
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
  
  const getGridClasses = () => {
    const count = liveSports.length;
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    // For 3 or 4 sports, use a 2x2 grid. For 3, one quadrant will be empty.
    return "grid-cols-2 grid-rows-2";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white overflow-hidden">
       <header className="py-4 px-8 flex justify-center items-center gap-6 bg-black/30">
             <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-egspgoi-logo.png?alt=media&token=b401f7dd-c3ed-4a30-84b7-8222ba965250"
              alt="EGS Pillay Group of Institutions Logo"
              width={160}
              height={42}
              className="h-12 w-auto"
            />
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-logo.png?alt=media&token=49e75a63-950b-4ed2-a0f7-075ba54ace2e"
              alt="Energy 2025 Inter-School Sports Meet Logo"
              width={160}
              height={42}
              className="h-14 w-auto"
            />
      </header>

      <main className="flex-1 grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))' }}>
        {isLoading ? (
          <div className="col-span-full row-span-full flex flex-col h-full items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Loading live data...</p>
          </div>
        ) : (
          <AnimatePresence>
            {liveSports.length > 0 ? (
              liveSports.map((sport) => (
                <motion.div
                  key={sport}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="min-h-[45vh]"
                >
                  <SportQuadrant sportName={sport} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full row-span-full flex flex-col h-full items-center justify-center text-center gap-4 p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-5xl font-bold tracking-tight">No Live Matches Currently</h1>
                <p className="text-muted-foreground text-xl">Waiting for the next match to start...</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
