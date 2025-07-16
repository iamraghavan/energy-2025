'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft, Minus, Plus, Trophy } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMatches, updateMatch } from '@/services/match-service';
import { getTeamById } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { SportIcon } from '@/components/sports/sports-icons';
import { socket } from '@/services/socket';

export default function LiveMatchPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  
  const [match, setMatch] = React.useState<MatchAPI | null>(null);
  const [teamOne, setTeamOne] = React.useState<Team | null>(null);
  const [teamTwo, setTeamTwo] = React.useState<Team | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { toast } = useToast();

  const fetchMatchDetails = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const allMatches = await getMatches();
      const currentMatch = allMatches.find(m => m._id === matchId);
      if (currentMatch) {
          setMatch(currentMatch);
          const [fetchedTeamOne, fetchedTeamTwo] = await Promise.all([
            getTeamById(currentMatch.teamA),
            getTeamById(currentMatch.teamB),
          ]);
          setTeamOne(fetchedTeamOne);
          setTeamTwo(fetchedTeamTwo);
      } else {
          toast({ variant: 'destructive', title: 'Match not found' });
          router.push('/scorekeeper-dashboard');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to fetch match details' });
    } finally {
      setIsLoading(false);
    }
  }, [matchId, router, toast]);

  React.useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      socket.connect();
    }
    return () => {
      socket.disconnect();
    }
  }, [matchId, fetchMatchDetails]);

  const handleScoreChange = async (team: 'teamOne' | 'teamTwo', delta: number) => {
    if (!match) return;

    const newScore = team === 'teamOne' 
        ? match.teamOneScore + delta 
        : match.teamTwoScore + delta;
    
    if (newScore < 0) return;

    const updatedField = team === 'teamOne' ? 'teamOneScore' : 'teamTwoScore';

    const newMatchState = { ...match, [updatedField]: newScore };
    setMatch(newMatchState);

    try {
        const payload = { [updatedField]: newScore };
        const updatedMatch = await updateMatch(match._id, payload);
        socket.emit('scoreUpdate', updatedMatch);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not sync score with the server. Please check your connection.',
        });
        // Revert optimistic update on failure
        setMatch(match);
    }
  };
  
  const handleEndMatch = async () => {
      if (!match) return;
      setIsSubmitting(true);
      try {
          const payload = { status: 'completed' as const };
          const updatedMatch = await updateMatch(match._id, payload);
          socket.emit('scoreUpdate', updatedMatch);
          toast({ title: 'Match Completed!', description: 'The final scores have been saved.' });
          router.push(`/scorekeeper-dashboard?tab=completed`);
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Operation Failed',
              description: error.message || 'Could not end the match.',
          });
      } finally {
          setIsSubmitting(false);
      }
  }


  if (isLoading || !match || !teamOne || !teamTwo) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4 text-muted-foreground">Loading match details...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/scorekeeper-dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Live Scorekeeping</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    <SportIcon sportName={match.sport} className="w-4 h-4" />
                    {match.sport} Match
                </p>
            </div>
        </div>
        <Card className="w-full">
            <CardHeader className="text-center">
                 <CardTitle className="text-2xl md:text-4xl font-extrabold tracking-tight">
                    {teamOne.name} vs {teamTwo.name}
                </CardTitle>
                <CardDescription>
                    Venue: {match.venue} ({match.courtNumber}) | Referee: {match.refereeName}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center p-6">
                {/* Team One Score */}
                <div className="flex flex-col items-center gap-4 p-6 bg-secondary rounded-lg">
                    <h3 className="text-2xl font-bold text-center">{teamOne.name}</h3>
                    <p className="text-7xl font-bold text-primary tabular-nums">{match.teamOneScore}</p>
                    <div className="flex gap-4">
                         <Button size="icon" variant="outline" onClick={() => handleScoreChange('teamOne', -1)}>
                            <Minus className="h-6 w-6" />
                        </Button>
                        <Button size="icon" onClick={() => handleScoreChange('teamOne', 1)}>
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Team Two Score */}
                <div className="flex flex-col items-center gap-4 p-6 bg-secondary rounded-lg">
                    <h3 className="text-2xl font-bold text-center">{teamTwo.name}</h3>
                    <p className="text-7xl font-bold text-primary tabular-nums">{match.teamTwoScore}</p>
                    <div className="flex gap-4">
                        <Button size="icon" variant="outline" onClick={() => handleScoreChange('teamTwo', -1)}>
                            <Minus className="h-6 w-6" />
                        </Button>
                        <Button size="icon" onClick={() => handleScoreChange('teamTwo', 1)}>
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center p-6">
                <Button size="lg" variant="destructive" onClick={handleEndMatch} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Ending Match...
                        </>
                    ) : (
                        <>
                            <Trophy className="mr-2 h-4 w-4" />
                            End Match & Finalize Score
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
