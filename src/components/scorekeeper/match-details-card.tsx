
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, User, Shield, RadioTower, Loader2, MoreVertical, Trash2 } from 'lucide-react';

import type { PopulatedMatch } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface MatchDetailsCardProps {
    match: PopulatedMatch;
    onGoLive?: (matchId: string) => void;
    onDelete?: (match: PopulatedMatch) => void;
    isUpdating?: boolean;
}

export function MatchDetailsCard({ match, onGoLive, onDelete, isUpdating }: MatchDetailsCardProps) {
    const getStatusVariant = (): 'destructive' | 'secondary' | 'default' => {
        switch (match.status) {
            case 'live': return 'destructive';
            case 'completed': return 'secondary';
            case 'scheduled':
            default: return 'default';
        }
    };

    const teamOneName = match.teamOne?.name || 'N/A';
    const teamTwoName = match.teamTwo?.name || 'N/A';

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    return (
        <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="font-bold">{match.sport}</span>
                        </CardTitle>
                        <Badge variant={getStatusVariant()} className="capitalize mt-1">
                            {match.status}
                        </Badge>
                    </div>
                    {onDelete && match.status !== 'completed' && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleActionClick}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={handleActionClick}>
                                <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => onDelete(match)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                 <CardDescription className="font-semibold text-base !mt-2 truncate pt-2 border-t">
                    {teamOneName} vs {teamTwoName}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3 flex-1">
                {match.status !== 'scheduled' && (
                    <div className="flex items-center gap-2 font-semibold">
                        <Shield className="w-4 h-4 text-primary" />
                        <p>Score: {match.pointsA} - {match.pointsB}</p>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <p>{match.scheduledAt ? format(new Date(match.scheduledAt), 'PPP p') : 'Date not set'}</p>
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
            {onGoLive && match.status === 'scheduled' && (
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent dialog from opening
                            onGoLive(match._id);
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RadioTower className="mr-2 h-4 w-4" />
                        )}
                        Go Live
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
