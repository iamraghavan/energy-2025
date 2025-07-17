
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { MatchAPI, Team } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface BigScreenLiveCardProps {
  match: { teamOne?: Team; teamTwo?: Team } & MatchAPI;
}

export function BigScreenLiveCard({ match }: BigScreenLiveCardProps) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive w-full flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center w-full">
        <h3 className="text-xl font-bold text-white truncate text-right flex-1">{teamOneName}</h3>
        <span className="mx-4 text-gray-400 font-light">vs</span>
        <h3 className="text-xl font-bold text-white truncate text-left flex-1">{teamTwoName}</h3>
      </div>
      
      <Separator className="bg-destructive/50 my-2" />

      <div className="flex items-center justify-center w-full mt-2">
        {/* Team A Score */}
        <div className="flex-1">
            <AnimatePresence mode="wait">
                <motion.div
                key={match.pointsA}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-7xl font-black text-white tabular-nums tracking-tighter"
                >
                {match.pointsA}
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="w-[1px] h-16 bg-gray-700 mx-4"></div>

        {/* Team B Score */}
        <div className="flex-1">
             <AnimatePresence mode="wait">
                <motion.div
                key={match.pointsB}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-7xl font-black text-white tabular-nums tracking-tighter"
                >
                {match.pointsB}
                </motion.div>
            </AnimatePresence>
        </div>
       </div>
    </div>
  );
}
