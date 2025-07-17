
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { MatchAPI, Team } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PopulatedMatch extends MatchAPI {
  teamOne: Team | undefined;
  teamTwo: Team | undefined;
}

export function BigScreenLiveCard({ match }: { match: { teamOne?: Team, teamTwo?: Team } & MatchAPI }) {
  const teamOneName = match.teamOne?.name || 'Team A';
  const teamTwoName = match.teamTwo?.name || 'Team B';

  return (
    <div className="bg-black/40 p-4 rounded-lg border-l-4 border-destructive w-full">
       <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
        <span className="font-bold text-base text-white">{match.sport}</span>
       </div>
       <div className="grid grid-cols-2 items-center gap-4">
        {/* Team A */}
        <div className="flex flex-col items-center gap-3">
            <Avatar className="w-16 h-16 border-2 border-gray-600">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={teamOneName} data-ai-hint="logo" />
                <AvatarFallback>{teamOneName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-center text-white truncate">{teamOneName}</h3>
            <AnimatePresence mode="wait">
                <motion.div
                key={match.pointsA}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl font-black text-primary tabular-nums tracking-tighter"
                >
                {match.pointsA}
                </motion.div>
            </AnimatePresence>
        </div>
        
        {/* Team B */}
        <div className="flex flex-col items-center gap-3">
             <Avatar className="w-16 h-16 border-2 border-gray-600">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={teamTwoName} data-ai-hint="logo" />
                <AvatarFallback>{teamTwoName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-center text-white truncate">{teamTwoName}</h3>
             <AnimatePresence mode="wait">
                <motion.div
                key={match.pointsB}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl font-black text-primary tabular-nums tracking-tighter"
                >
                {match.pointsB}
                </motion.div>
            </AnimatePresence>
        </div>
       </div>
    </div>
  );
}
