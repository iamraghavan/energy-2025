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
    <div className="bg-black/40 p-3 rounded-md border-l-4 border-destructive">
       <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
        <span>{match.sport}</span>
        <span>{match.venue} - {match.courtNumber}</span>
       </div>
      <div className="flex justify-between items-center text-lg">
        <div className="flex items-center gap-3 font-semibold flex-1 truncate text-white">
            <Avatar className="w-8 h-8 border-2 border-gray-600">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={teamOneName} data-ai-hint="logo" />
                <AvatarFallback>{teamOneName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate">{teamOneName}</span>
        </div>
        <AnimatePresence mode="wait">
            <motion.div
            key={match.pointsA}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-bold text-white tabular-nums"
            >
            {match.pointsA}
            </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between items-center mt-1 text-lg">
        <div className="flex items-center gap-3 font-semibold flex-1 truncate text-white">
             <Avatar className="w-8 h-8 border-2 border-gray-600">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={teamTwoName} data-ai-hint="logo" />
                <AvatarFallback>{teamTwoName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate">{teamTwoName}</span>
        </div>
         <AnimatePresence mode="wait">
            <motion.div
            key={match.pointsB}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-bold text-white tabular-nums"
            >
            {match.pointsB}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
