
'use client';

import * as React from 'react';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { LiveMatchCard } from '@/components/sports/live-match-card';
import { UpcomingMatchCard } from '@/components/sports/upcoming-match-card'; // New component
import { Loader2, RadioTower, Frown, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LiveMatchesPage() {
  const { toast } = useToast();
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
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
        setMatches(fetchedMatches);

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
      setMatches(prevMatches => {
        const matchIndex = prevMatches.findIndex(m => m._id === updatedMatch._id);
        if (matchIndex > -1) {
          // If match exists, update it. This handles score updates and status changes (e.g. live -> completed)
          const newMatches = [...prevMatches];
          newMatches[matchIndex] = { ...newMatches[matchIndex], ...updatedMatch };
          return newMatches;
        }
        // If the match is new (e.g., just created), add it to the list
        return [...prevMatches, updatedMatch];
      });
    }

    socket.on('scoreUpdate', onScoreUpdate);

    return () => {
      socket.off('scoreUpdate', onScoreUpdate);
      socket.disconnect();
    };
  }, [toast]);
  
  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 2);

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
            <p className="text-muted-foreground">All ongoing matches, updated in real-time for the big screen.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Loading live matches...</p>
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveMatches.map((match) => (
              <LiveMatchCard
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
                There are no matches being played right now. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-12" />

        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
                <CalendarClock className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Up Next</h2>
                <p className="text-muted-foreground">The next two matches in the schedule.</p>
            </div>
        </div>
        
         {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMatches.map((match) => (
              <UpcomingMatchCard
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
              <h2 className="text-2xl font-semibold">No Upcoming Matches</h2>
              <p className="text-muted-foreground max-w-sm">
                All scheduled matches are complete or live.
              </p>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
