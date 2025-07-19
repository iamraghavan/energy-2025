
'use client';

import { notFound, useParams } from 'next/navigation';
import * as React from 'react';

import { sports } from '@/lib/data';
import type { MatchAPI, Team } from '@/lib/types';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import { socket } from '@/services/socket';

import { Header } from '@/components/layout/header';
import { MatchCard } from '@/components/sports/match-card';
import { UpcomingMatchCard } from '@/components/sports/upcoming-match-card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const RESULTS_PER_PAGE = 4;

export default function SportPage() {
  const params = useParams();
  const { toast } = useToast();
  
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const [visibleResults, setVisibleResults] = React.useState(RESULTS_PER_PAGE);

  const sportSlug = params.sport as string;
  const sportData = sports.find((s) => s.slug === sportSlug);

  React.useEffect(() => {
    if (!sportData) {
      notFound();
      return;
    }
    
    async function fetchData() {
      setIsLoading(true);
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
            getMatches(),
            getTeams()
        ]);

        const teamsMap = new Map(fetchedTeams.map(t => [t._id, t]));
        setTeams(teamsMap);
        
        const filteredMatches = fetchedMatches.filter(m => m.sport.toLowerCase() === sportData.name.toLowerCase());
        setMatches(filteredMatches.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()));

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to fetch data',
          description: 'Could not load data for this sport. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    socket.connect();

    function onMatchCreated(newMatch: MatchAPI) {
        if (newMatch.sport.toLowerCase() === sportData?.name.toLowerCase()) {
            setMatches(prevMatches => [newMatch, ...prevMatches].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()));
        }
    }

    function onMatchUpdated(updatedMatch: MatchAPI) {
        if (updatedMatch.sport.toLowerCase() === sportData?.name.toLowerCase()) {
            setMatches(prevMatches => 
                prevMatches.map(m => m._id === updatedMatch._id ? { ...updatedMatch } : m)
            );
        }
    }

    function onMatchDeleted({ matchId }: { matchId: string }) {
        setMatches(prevMatches => prevMatches.filter(m => m._id !== matchId));
    }
    
    socket.on('matchCreated', onMatchCreated);
    socket.on('matchUpdated', onMatchUpdated);
    socket.on('matchDeleted', onMatchDeleted);
    socket.on('scoreUpdate', onMatchUpdated);

    // Cleanup on component unmount
    return () => {
        socket.off('matchCreated', onMatchCreated);
        socket.off('matchUpdated', onMatchUpdated);
        socket.off('matchDeleted', onMatchDeleted);
        socket.off('scoreUpdate', onMatchUpdated);
        socket.disconnect();
    }

  }, [sportData, toast]);


  if (!sportData) {
    // This will be caught by the useEffect, but it's good practice for clarity.
    return null;
  }
  
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'scheduled' || m.status === 'upcoming');
  const completedMatches = matches.filter((m) => m.status === 'completed');
  
  const participatingTeams = Array.from(teams.values()).filter(team => team.sport && sportData && team.sport.name.toLowerCase() === sportData.name.toLowerCase());


  const renderMatchList = (matchList: MatchAPI[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="md:col-span-2 lg:col-span-4 flex justify-center items-center p-6 bg-card rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading matches...</span>
        </div>
      );
    }
    if (matchList.length === 0) {
      return (
        <div className="md:col-span-2 lg:col-span-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">{emptyMessage}</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return matchList.map((match) => (
      <MatchCard 
        key={match._id} 
        match={match} 
        teamOne={teams.get(match.teamA)}
        teamTwo={teams.get(match.teamB)}
      />
    ));
  };

  const renderUpcomingMatchList = (matchList: MatchAPI[], emptyMessage: string) => {
    if (isLoading) {
        return (
            <div className="md:col-span-2 lg:col-span-4 flex justify-center items-center p-6 bg-card rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading matches...</span>
            </div>
        );
    }
    if (matchList.length === 0) {
        return (
            <div className="md:col-span-2 lg:col-span-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">{emptyMessage}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return matchList.map((match) => (
      <UpcomingMatchCard
        key={match._id}
        match={match}
        teamOne={teams.get(match.teamA)}
        teamTwo={teams.get(match.teamB)}
      />
    ));
  };
  
  const renderCompletedMatches = () => {
    if (isLoading) {
        return (
            <div className="md:col-span-2 lg:col-span-4 flex justify-center items-center p-6 bg-card rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading matches...</span>
            </div>
        );
    }
    if (completedMatches.length === 0) {
        return (
            <div className="md:col-span-2 lg:col-span-4">
                <Card><CardContent className="p-6 text-center text-muted-foreground">No recent results found.</CardContent></Card>
            </div>
        );
    }

    return completedMatches.slice(0, visibleResults).map((match) => {
      const teamOne = teams.get(match.teamA);
      const teamTwo = teams.get(match.teamB);
      return (
        <Dialog key={match._id}>
          <DialogTrigger asChild>
            <div className="cursor-pointer">
              <MatchCard match={match} teamOne={teamOne} teamTwo={teamTwo} />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Match Result
              </DialogTitle>
              <DialogDescription>
                Final details for the {match.sport} match.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
                <p><strong>Team One:</strong> {teamOne?.name || 'N/A'}</p>
                <p><strong>Team Two:</strong> {teamTwo?.name || 'N/A'}</p>
                <p><strong>Final Score:</strong> {match.pointsA} - {match.pointsB}</p>
                <p><strong>Result:</strong> {match.result || 'N/A'}</p>
                <p><strong>Date:</strong> {match.scheduledAt ? format(new Date(match.scheduledAt), 'PPP p') : 'N/A'}</p>
                <p><strong>Venue:</strong> {match.venue} ({match.courtNumber})</p>
                <p><strong>Referee:</strong> {match.refereeName}</p>
            </div>
          </DialogContent>
        </Dialog>
      );
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {sportData.name}
          </h1>
        </section>

        <div className="space-y-8">
            <section id="live-matches">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Live</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderMatchList(liveMatches, 'No live matches right now.')}
              </div>
            </section>
            
            <Separator />

            <section id="upcoming-matches">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderUpcomingMatchList(upcomingMatches, 'No upcoming matches scheduled.')}
              </div>
            </section>

            <Separator />

            <section id="recent-results">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Recent Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderCompletedMatches()}
              </div>
               {completedMatches.length > visibleResults && (
                <div className="mt-6 text-center">
                  <Button onClick={() => setVisibleResults(prev => prev + RESULTS_PER_PAGE)}>
                    Load More Results
                  </Button>
                </div>
              )}
            </section>

            <Separator />

            <section id="participating-schools">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <Users className="w-8 h-8 text-accent-foreground" />
                    Participating Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                     <div className="flex justify-center items-center p-6">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : participatingTeams.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team Name</TableHead>
                          <TableHead>School Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participatingTeams.map((team) => (
                          <TableRow key={team._id}>
                            <TableCell className="font-medium">{team.name}</TableCell>
                            <TableCell>{team.school.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                     <p className="text-muted-foreground text-center">No participating teams listed for {sportData.name} yet.</p>
                  )}
                </CardContent>
              </Card>
            </section>
        </div>
      </main>
    </div>
  );
}
