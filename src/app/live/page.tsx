'use client';

import * as React from 'react';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { MatchCard } from '@/components/sports/match-card';
import { Loader2, RadioTower, Frown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LiveMatchesPage() {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams(),
        ]);

        const teamsMap = new Map<string, Team>(fetchedTeams.map((team) => [team._id, team]));
        setTeams(teamsMap);

        const currentLiveMatches = fetchedMatches
          .filter((m) => m.status === 'live')
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
        setLiveMatches(currentLiveMatches);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to fetch data',
          description: 'Could not load match or team data. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    socket.connect();

    function onScoreUpdate(updatedMatch: MatchAPI) {
      setLiveMatches((prevMatches) => {
        const matchExists = prevMatches.some(m => m._id === updatedMatch._id);

        if (updatedMatch.status === 'live') {
          if (matchExists) {
            // Update existing live match
            return prevMatches.map(m => m._id === updatedMatch._id ? { ...m, ...updatedMatch } : m);
          } else {
            // Add new live match
            return [...prevMatches, updatedMatch].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
          }
        } else {
          // Remove match if it's no longer live
          return prevMatches.filter(m => m._id !== updatedMatch._id);
        }
      });
    }

    socket.on('scoreUpdate', onScoreUpdate);

    return () => {
      socket.off('scoreUpdate', onScoreUpdate);
      socket.disconnect();
    };
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-destructive/10 rounded-full">
            <RadioTower className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Live Matches</h1>
            <p className="text-muted-foreground">All ongoing matches, updated in real-time.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Loading live matches...</p>
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                teamOne={teams.get(match.teamA)}
                teamTwo={teams.get(match.teamB)}
              />
            ))}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4">
              <Frown className="w-16 h-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">No Live Matches</h2>
              <p className="text-muted-foreground max-w-sm">
                There are no matches being played right now. Check back soon or see the homepage for upcoming matches.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
