
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClipboardList, PlusCircle, Frown, Trash2 } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMatches, updateMatch, deleteMatch } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team, PopulatedMatch } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { MatchDetailsCard } from '@/components/scorekeeper/match-details-card';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { socket } from '@/services/socket';

export default function ScorekeeperDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [matches, setMatches] = React.useState<PopulatedMatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'live');
  const [matchToDelete, setMatchToDelete] = React.useState<PopulatedMatch | null>(null);

  const { toast } = useToast();
  
  const encodedId = user ? btoa(user.id) : '';

  const fetchAndPopulateMatches = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [fetchedMatches, allTeams] = await Promise.all([
        getMatches(),
        getTeams()
      ]);

      const teamsMap = new Map<string, Team>(allTeams.map(team => [team._id, team]));
      
      const populatedMatches = fetchedMatches
        .filter(match => match.scorekeeperId === user.id) // Filter by scorekeeper ID
        .map(match => ({
          ...match,
          teamOne: teamsMap.get(match.teamA)!,
          teamTwo: teamsMap.get(match.teamB)!,
      })).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      
      setMatches(populatedMatches);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch matches',
        description: 'Could not load match data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  React.useEffect(() => {
    if(user) {
        fetchAndPopulateMatches();
    }
    socket.connect();
    
    return () => {
        socket.disconnect();
    }
  }, [fetchAndPopulateMatches, user]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/scorekeeper-dashboard/${encodedId}?tab=${value}`, { scroll: false });
  };
  
  const handleGoLive = async (matchId: string) => {
    setIsUpdating(matchId);
    try {
      const updatedMatch = await updateMatch(matchId, { status: 'live' });
      socket.emit('scoreUpdate', updatedMatch);
      toast({
        title: 'Match is Live!',
        description: 'The match has been moved to the Live tab.',
      });
      await fetchAndPopulateMatches();
      handleTabChange('live');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Operation Failed',
            description: error.message || 'Could not update the match status.',
        });
    } finally {
        setIsUpdating(null);
    }
  };

  const handleDeleteRequest = (match: PopulatedMatch) => {
    setMatchToDelete(match);
  };

  const handleDeleteConfirm = async () => {
    if (!matchToDelete) return;
    setIsUpdating(matchToDelete._id);
    try {
      await deleteMatch(matchToDelete._id);
      toast({
        title: 'Match Deleted',
        description: 'The match has been removed successfully.',
      });
      setMatchToDelete(null);
      await fetchAndPopulateMatches();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Could not delete the match.',
      });
    } finally {
      setIsUpdating(null);
    }
  };


  const scheduledMatches = matches.filter((m) => m.status === 'scheduled');
  const liveMatches = matches.filter((m) => m.status === 'live');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scorekeeper Dashboard</h1>
            <p className="text-muted-foreground">Manage live scores and match outcomes.</p>
          </div>
        </div>
        <Button asChild>
            <Link href="/scorekeeper-dashboard/create-match">
                <PlusCircle className="mr-2" />
                Create Match
            </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          <MatchList matches={liveMatches} isLoading={isLoading} emptyMessage="No live matches right now." isLiveTab onDelete={handleDeleteRequest} isUpdatingId={isUpdating} />
        </TabsContent>
        <TabsContent value="scheduled">
          <MatchList matches={scheduledMatches} isLoading={isLoading} emptyMessage="No matches are scheduled." onGoLive={handleGoLive} onDelete={handleDeleteRequest} isUpdatingId={isUpdating} />
        </TabsContent>
        <TabsContent value="completed">
          <MatchList matches={completedMatches} isLoading={isLoading} emptyMessage="No matches have been completed yet." />
        </TabsContent>
      </Tabs>
    </div>
     <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the match between <span className="font-bold">{matchToDelete?.teamOne?.name}</span> and <span className="font-bold">{matchToDelete?.teamTwo?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface MatchListProps {
  matches: PopulatedMatch[];
  isLoading: boolean;
  emptyMessage: string;
  isLiveTab?: boolean;
  onGoLive?: (matchId: string) => void;
  onDelete?: (match: PopulatedMatch) => void;
  isUpdatingId?: string | null;
}

function MatchList({ matches, isLoading, emptyMessage, isLiveTab = false, onGoLive, onDelete, isUpdatingId }: MatchListProps) {
    if (isLoading) {
        return <p className="text-center text-muted-foreground py-8">Loading matches...</p>;
    }

    if (matches.length === 0) {
        return (
            <Card className="mt-4">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                    <Frown className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {matches.map((match) => {
                const cardContent = (
                    <MatchDetailsCard 
                        match={match} 
                        onGoLive={onGoLive}
                        onDelete={onDelete}
                        isUpdating={isUpdatingId === match._id}
                    />
                );

                if (isLiveTab) {
                    return (
                        <Link href={`/scorekeeper-dashboard/live/${match._id}`} key={match._id} className="block">
                            {cardContent}
                        </Link>
                    );
                }

                return (
                    <Dialog key={match._id}>
                        <DialogTrigger asChild>
                            <div className="cursor-pointer">
                                {cardContent}
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                Match Details
                                </DialogTitle>
                                <DialogDescription>
                                Reviewing the details for the {match.sport} match.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 text-sm">
                            <p><strong>Team One:</strong> {match.teamOne?.name || 'N/A'}</p>
                            <p><strong>Team Two:</strong> {match.teamTwo?.name || 'N/A'}</p>
                            <p><strong>Score:</strong> {match.pointsA} - {match.pointsB}</p>
                            <p><strong>Date:</strong> {match.scheduledAt ? format(new Date(match.scheduledAt), 'PPP p') : 'N/A'}</p>
                            <p><strong>Venue:</strong> {match.venue}</p>
                            <p><strong>Court:</strong> {match.courtNumber}</p>
                            <p><strong>Referee:</strong> {match.refereeName}</p>
                            <p><strong>Status:</strong> <span className="capitalize">{match.status}</span></p>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            })}
        </div>
    );
}
