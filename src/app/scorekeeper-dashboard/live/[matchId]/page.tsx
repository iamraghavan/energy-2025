
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Minus, Plus, Trophy } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

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
import type { MatchAPI, Team, UpdateMatchPayload } from '@/lib/types';
import { socket } from '@/services/socket';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function LiveMatchPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const matchId = params.matchId as string;
  
  const [match, setMatch] = React.useState<MatchAPI | null>(null);
  const [teamOne, setTeamOne] = React.useState<Team | null>(null);
  const [teamTwo, setTeamTwo] = React.useState<Team | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = React.useState(false);
  const [matchResult, setMatchResult] = React.useState<{ message: string; payload: UpdateMatchPayload } | null>(null);

  
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
          if(user) {
            const encodedId = btoa(user.id);
            router.push(`/scorekeeper-dashboard/${encodedId}`);
          } else {
             router.push('/login');
          }
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to fetch match details' });
    } finally {
      setIsLoading(false);
    }
  }, [matchId, router, toast, user]);

  React.useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      socket.connect();
    }
    
    const handleMatchUpdate = (updatedMatch: MatchAPI) => {
        if (updatedMatch._id === matchId) {
            setMatch(prevMatch => ({ ...prevMatch, ...updatedMatch }));
        }
    };
    
    socket.on('matchUpdated', handleMatchUpdate);
    socket.on('scoreUpdate', handleMatchUpdate);

    return () => {
      socket.off('matchUpdated', handleMatchUpdate);
      socket.off('scoreUpdate', handleMatchUpdate);
      socket.disconnect();
    }
  }, [matchId, fetchMatchDetails]);

  const handleScoreChange = async (team: 'A' | 'B', delta: number) => {
    if (!match) return;

    const currentScore = team === 'A' ? match.pointsA : match.pointsB;
    const newScore = Math.max(0, currentScore + delta);
    
    const updatedField = team === 'A' ? 'pointsA' : 'pointsB';

    const previousMatchState = { ...match };
    const newMatchState = { ...match, [updatedField]: newScore };
    setMatch(newMatchState);

    try {
        const payload = { [updatedField]: newScore };
        const updatedMatch = await updateMatch(match._id, payload);
        socket.emit('matchUpdated', updatedMatch); 
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not sync score with the server. Please check your connection.',
        });
        setMatch(previousMatchState); 
    }
  };
  
  const handleEndMatchRequest = () => {
    if (!match || !teamOne || !teamTwo) return;

    const payload: UpdateMatchPayload = { status: 'completed' };
    let message = '';

    if (match.pointsA > match.pointsB) {
      payload.winnerTeam = match.teamA;
      payload.result = `${teamOne.name} Wins`;
      message = `${teamOne.name} will be declared the winner.`;
    } else if (match.pointsB > match.pointsA) {
      payload.winnerTeam = match.teamB;
      payload.result = `${teamTwo.name} Wins`;
      message = `${teamTwo.name} will be declared the winner.`;
    } else {
      payload.result = 'Draw';
      message = 'The match will be recorded as a draw.';
    }

    setMatchResult({ message, payload });
    setIsEndMatchDialogOpen(true);
  };
  
  const confirmEndMatch = async () => {
      if (!match || !user || !matchResult) return;
      setIsSubmitting(true);
      
      try {
          const updatedMatch = await updateMatch(match._id, matchResult.payload);
          socket.emit('matchUpdated', updatedMatch);
          toast({ title: 'Match Completed!', description: 'The final scores have been saved.' });
          const encodedId = btoa(user.id);
          router.push(`/scorekeeper-dashboard/${encodedId}?tab=completed`);
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Operation Failed',
              description: error.message || 'Could not end the match.',
          });
      } finally {
          setIsSubmitting(false);
          setIsEndMatchDialogOpen(false);
      }
  }

  const dashboardUrl = user ? `/scorekeeper-dashboard/${btoa(user.id)}?tab=live` : '/login';

  if (isLoading || !match || !teamOne || !teamTwo) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading match details...</p>
        </div>
      );
  }

  return (
    <>
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={dashboardUrl}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Live Scorekeeping</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    {match.sport} Match | {format(new Date(match.scheduledAt), 'PPP p')}
                </p>
            </div>
        </div>
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center bg-muted/30 p-4 border-b">
                 <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
                    {teamOne.name} vs {teamTwo.name}
                </CardTitle>
                <CardDescription>
                    Venue: {match.venue} ({match.courtNumber}) | Referee: {match.refereeName}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center p-4 md:p-6">
                {/* Team A Score */}
                <div className="flex flex-col items-center gap-3 p-4 bg-secondary rounded-lg">
                    <h3 className="text-xl md:text-2xl font-bold text-center text-primary-foreground bg-primary w-full p-2 rounded-t-md">{teamOne.name}</h3>
                    <p className="text-6xl md:text-8xl font-bold text-primary tabular-nums tracking-tighter my-4">{match.pointsA}</p>
                    <div className="flex gap-4">
                         <Button size="lg" variant="outline" onClick={() => handleScoreChange('A', -1)}>
                            <Minus className="h-6 w-6" />
                        </Button>
                        <Button size="lg" onClick={() => handleScoreChange('A', 1)}>
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Team B Score */}
                <div className="flex flex-col items-center gap-3 p-4 bg-secondary rounded-lg">
                     <h3 className="text-xl md:text-2xl font-bold text-center text-primary-foreground bg-primary w-full p-2 rounded-t-md">{teamTwo.name}</h3>
                    <p className="text-6xl md:text-8xl font-bold text-primary tabular-nums tracking-tighter my-4">{match.pointsB}</p>
                    <div className="flex gap-4">
                        <Button size="lg" variant="outline" onClick={() => handleScoreChange('B', -1)}>
                            <Minus className="h-6 w-6" />
                        </Button>
                        <Button size="lg" onClick={() => handleScoreChange('B', 1)}>
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center p-4 md:p-6 border-t">
                <Button size="lg" variant="destructive" onClick={handleEndMatchRequest} disabled={isSubmitting}>
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
    <AlertDialog open={isEndMatchDialogOpen} onOpenChange={setIsEndMatchDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Finalize Match Result?</AlertDialogTitle>
            <AlertDialogDescription>
                The final score is <span className="font-bold">{teamOne.name}: {match.pointsA}</span> - <span className="font-bold">{teamTwo.name}: {match.pointsB}</span>.
                <br />
                {matchResult?.message}
                <br />
                <br />
                This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndMatch} disabled={isSubmitting}>
                 {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Trophy className="mr-2 h-4 w-4" />
                )}
                Confirm & Finalize
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
