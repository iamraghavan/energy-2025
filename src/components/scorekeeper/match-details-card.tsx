'use client';

import * as React from 'react';
import type { MatchAPI } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SportIcon } from '@/components/sports/sports-icons';
import { format } from 'date-fns';

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

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <SportIcon sportName={match.sport.name} className="w-5 h-5" />
                        <span>{match.sport.name}</span>
                    </CardTitle>
                    <Badge variant={getStatusVariant()} className="capitalize">
                        {match.status}
                    </Badge>
                </div>
                <CardDescription>
                    {match.teamOne?.name || 'Team A'} vs {match.teamTwo?.name || 'Team B'}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Venue:</strong> {match.venue}</p>
                <p><strong>Court:</strong> {match.courtNumber}</p>
                {match.status !== 'scheduled' && <p><strong>Score:</strong> {match.teamOneScore} - {match.teamTwoScore}</p>}
                {match.date && <p><strong>Date:</strong> {format(new Date(match.date), 'PPP')}</p>}
            </CardContent>
        </Card>
    );
}
