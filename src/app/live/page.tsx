
'use client';

import * as React from 'react';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import type { MatchAPI, Team } from '@/lib/types';
import { socket } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Loader2, RadioTower, Frown, CalendarClock, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function LiveMatchesPage() {
  const { toast } = useToast();
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const vibrantColors = [
    'bg-red-500/10', 'bg-blue-500/10', 'bg-green-500/10', 'bg-yellow-500/10', 'bg-purple-500/10', 'bg-pink-500/10'
  ];

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
          const newMatches = [...prevMatches];
          newMatches[matchIndex] = { ...newMatches[matchIndex], ...updatedMatch };
          return newMatches;
        }
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <RadioTower className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">Live Matches</h1>
            <p className="text-gray-500 dark:text-gray-400">All ongoing matches, updated in real-time for the big screen.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Loading live matches...</p>
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {liveMatches.map((match, index) => {
              const teamOne = teams.get(match.teamA);
              const teamTwo = teams.get(match.teamB);
              const team1Name = teamOne?.name || 'Team A';
              const team2Name = teamTwo?.name || 'Team B';
              const team1Color = vibrantColors[index % vibrantColors.length];
              const team2Color = vibrantColors[(index + 1) % vibrantColors.length];
              return (
                <div key={match._id} className="w-full shadow-2xl bg-card dark:bg-gray-800/50 overflow-hidden rounded-2xl border border-primary/10">
                    <div className="pb-2 bg-muted/30 dark:bg-gray-900/30 border-b p-4">
                        <div className="flex justify-between items-center text-lg md:text-xl">
                            <Badge variant="destructive" className="text-base px-4 py-1 font-bold tracking-wider">LIVE</Badge>
                            <div className="text-right">
                                <p className="font-semibold text-muted-foreground">{match.sport}</p>
                                <p className="text-sm text-muted-foreground">{match.venue} - {match.courtNumber}</p>
                            </div>
                        </div>
                    </div>
                  <div className="p-0">
                    <div className="grid grid-cols-2 items-stretch text-center">
                      {/* Team 1 */}
                      <div className={`flex flex-col items-center justify-between gap-4 p-6 ${team1Color} border-r`}>
                        <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white dark:border-gray-800 shadow-lg">
                          <AvatarImage src={`https://placehold.co/100x100.png`} alt={team1Name} data-ai-hint="logo" />
                          <AvatarFallback>{team1Name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-3xl font-bold text-foreground text-center min-h-[84px] flex items-center">{team1Name}</h3>
                        <p className="font-black text-9xl text-primary dark:text-yellow-400 tabular-nums tracking-tighter">{match.pointsA}</p>
                      </div>
                      
                      {/* Team 2 */}
                      <div className={`flex flex-col items-center justify-between gap-4 p-6 ${team2Color}`}>
                        <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white dark:border-gray-800 shadow-lg">
                            <AvatarImage src={`https://placehold.co/100x100.png`} alt={team2Name} data-ai-hint="logo" />
                            <AvatarFallback>{team2Name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-3xl font-bold text-foreground text-center min-h-[84px] flex items-center">{team2Name}</h3>
                        <p className="font-black text-9xl text-primary dark:text-green-400 tabular-nums tracking-tighter">{match.pointsB}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="mt-4 bg-card">
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
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CalendarClock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">Up Next</h2>
                <p className="text-gray-500 dark:text-gray-400">The next two matches in the schedule.</p>
            </div>
        </div>
        
         {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMatches.map((match) => {
               const teamOne = teams.get(match.teamA);
               const teamTwo = teams.get(match.teamB);
               const team1Name = teamOne?.name || 'Team A';
               const team2Name = teamTwo?.name || 'Team B';
               const time = format(new Date(match.scheduledAt), 'p');
              return (
                 <div key={match._id} className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg">
                    <div className="p-3 border-b bg-muted/30">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-muted-foreground">{match.sport}</p>
                            <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{time}</span>
                            </Badge>
                        </div>
                    </div>
                    <div className="p-4">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="w-12 h-12 border-2">
                                    <AvatarImage src={`https://placehold.co/100x100.png`} alt={team1Name} data-ai-hint="logo" />
                                    <AvatarFallback>{team1Name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-lg text-foreground">{team1Name}</span>
                            </div>
                            
                            <span className="text-muted-foreground font-bold text-2xl mx-4">vs</span>
            
                            <div className="flex items-center gap-4 flex-1 justify-end">
                                 <span className="font-bold text-lg text-foreground text-right">{team2Name}</span>
                                 <Avatar className="w-12 h-12 border-2">
                                    <AvatarImage src={`https://placehold.co/100x100.png`} alt={team2Name} data-ai-hint="logo" />
                                    <AvatarFallback>{team2Name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card className="mt-4 bg-card">
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
