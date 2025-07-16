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
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PredictionTool } from '@/components/sports/prediction-tool';

export default function SportPage() {
  const params = useParams();
  const { toast } = useToast();
  
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

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
    
    // Connect to socket and set up listeners
    socket.connect();

    function onScoreUpdate(updatedMatch: MatchAPI) {
        // Only update if the match belongs to the current sport page
        if (updatedMatch.sport.toLowerCase() === sportData?.name.toLowerCase()) {
            setMatches(prevMatches => 
                prevMatches.map(m => m._id === updatedMatch._id ? { ...m, ...updatedMatch } : m)
            );
        }
    }
    
    socket.on('scoreUpdate', onScoreUpdate);

    fetchData();
    
    // Cleanup on component unmount
    return () => {
        socket.off('scoreUpdate', onScoreUpdate);
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
  
  const participatingTeams = Array.from(teams.values()).filter(team => team.sport.name.toLowerCase() === sportData.name.toLowerCase());


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


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {sportData.name}
          </h1>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                 {renderMatchList(upcomingMatches, 'No upcoming matches scheduled.')}
              </div>
            </section>

            <Separator />

            <section id="recent-results">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Recent Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderMatchList(completedMatches, 'No recent results found.')}
              </div>
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
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <PredictionTool sport={sportData.name} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
