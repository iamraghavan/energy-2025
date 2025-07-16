
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchAPI, Team } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';

interface UpcomingMatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function UpcomingMatchCard({ match, teamOne, teamTwo }: UpcomingMatchCardProps) {
  const { sport, scheduledAt } = match;

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';

  const time = new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Card className="w-full shadow-md hover:shadow-xl transition-shadow duration-300 bg-card">
        <CardHeader className="p-3 border-b bg-muted/30">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-muted-foreground">{sport}</p>
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{time}</span>
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border">
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={team1Name} data-ai-hint="logo" />
                        <AvatarFallback>{team1Name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-lg text-foreground">{team1Name}</span>
                </div>
                
                <span className="text-muted-foreground font-bold text-xl">vs</span>

                <div className="flex items-center gap-3">
                     <span className="font-bold text-lg text-foreground">{team2Name}</span>
                     <Avatar className="w-12 h-12 border">
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={team2Name} data-ai-hint="logo" />
                        <AvatarFallback>{team2Name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
