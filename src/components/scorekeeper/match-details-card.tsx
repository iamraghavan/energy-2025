'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, User, Shield } from 'lucide-react';

import type { MatchAPI } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SportIcon } from '@/components/sports/sports-icons';

interface MatchDetailsCardProps {
    match: MatchAPI;
}

export function MatchDetailsCard({ match }: MatchDetailsCardProps) {

    const getStatusVariant = (): 'destructive' | 'secondary' | 'default' => {
        switch (match.status) {
            case 'live':
                return 'destructive';
            case 'completed':
                return 'secondary';
            case 'scheduled':
            default:
                return 'default';
        }
    }

    const teamOneName = match.teamOne?.name || 'Team A';
    const teamTwoName = match.teamTwo?.name || 'Team B';

    return (
        <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <SportIcon sportName={match.sport?.name} className="w-5 h-5 text-primary" />
                        <span className="font-bold">{match.sport?.name || 'Sport'}</span>
                    </CardTitle>
                    <Badge variant={getStatusVariant()} className="capitalize">
                        {match.status}
                    </Badge>
                </div>
                <CardDescription className="font-semibold text-base !mt-2 truncate">
                    {teamOneName} vs {teamTwoName}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3 flex-1">
                {match.status !== 'scheduled' && (
                     <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <p><strong>Score:</strong> {match.teamOneScore} - {match.teamTwoScore}</p>
                    </div>
                )}
                 <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <p>{match.date ? format(new Date(match.date), 'PPP') : 'Date not set'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <p>{match.venue} ({match.courtNumber})</p>
                </div>
                 <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <p>Referee: {match.refereeName}</p>
                </div>
            </CardContent>
        </Card>
    );
}
