
'use client';

import Link from 'next/link';
import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

import { sports } from '@/lib/data';
import type { MatchAPI, Team } from '@/lib/types';
import { getMatches } from '@/services/match-service';
import { getTeams } from '@/services/team-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { MatchCard } from '@/components/sports/match-card';
import { UpcomingMatchCard } from '@/components/sports/upcoming-match-card';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { socket } from '@/services/socket';

export default function Home() {
  const { toast } = useToast();
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedMatches, fetchedTeams] = await Promise.all([
          getMatches(),
          getTeams()
        ]);

        const teamsMap = new Map<string, Team>(fetchedTeams.map(team => [team._id, team]));
        setTeams(teamsMap);

        const sortedMatches = fetchedMatches.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setMatches(sortedMatches);

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
    
    function onMatchCreated(newMatch: MatchAPI) {
        setMatches(prevMatches => [newMatch, ...prevMatches].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()));
    }
    
    function onMatchUpdated(updatedMatch: MatchAPI) {
        setMatches(prevMatches => 
            prevMatches.map(m => m._id === updatedMatch._id ? { ...updatedMatch } : m)
        );
    }

    function onMatchDeleted({ matchId }: { matchId: string }) {
        setMatches(prevMatches => prevMatches.filter(m => m._id !== matchId));
    }
    
    socket.on('matchCreated', onMatchCreated);
    socket.on('matchUpdated', onMatchUpdated);
    socket.on('matchDeleted', onMatchDeleted);
    // Alias for score updates
    socket.on('scoreUpdate', onMatchUpdated);


    // Cleanup on component unmount
    return () => {
        socket.off('matchCreated', onMatchCreated);
        socket.off('matchUpdated', onMatchUpdated);
        socket.off('matchDeleted', onMatchDeleted);
        socket.off('scoreUpdate', onMatchUpdated);
        socket.disconnect();
    }

  }, [toast]);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming' || m.status === 'scheduled');
  
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-r from-[#001b70] to-[#af005f] text-white overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="max-w-3xl">
                 <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                   Chevalier Dr. G.S. Pillay Memorial Tournament - Energy 2025
                </h1>
                <p className="text-lg md:text-xl text-white/80 mt-4 text-balance">
                  Hosted by EGS Pillay Group of Institutions, Nagapattinam. Get live scores, schedules, and results for the inter-departmental sports fest.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col lg:flex-row-reverse lg:gap-8">
            {/* All Sports */}
            <aside className="lg:w-1/3 lg:sticky top-24 self-start">
              <Card className="bg-secondary">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    All Sports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                    {sports.map((sport) => (
                      <Link
                        href={`/sports/${sport.slug}`}
                        key={sport.slug}
                        className="group flex flex-col items-center justify-center gap-2 rounded-lg p-4 bg-card hover:bg-card/90 hover:shadow-md transition-all"
                      >
                        <span className="font-semibold text-center text-foreground">
                          {sport.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            <div className="lg:w-2/3 space-y-8 mt-8 lg:mt-0">
              {/* Live Matches */}
              <section id="live-matches">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                    Live Matches
                  </h2>
                   <Link href="/live">
                    <Button variant="ghost" className="text-sm font-semibold text-primary">
                        View All
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div>
                  {isLoading ? (
                    <div className="flex justify-center items-center p-6 bg-card rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading matches...</span>
                    </div>
                   ) : liveMatches.length > 0 ? (
                      <Carousel
                        plugins={[plugin.current]}
                        className="w-full"
                        onMouseEnter={plugin.current.stop}
                        onMouseLeave={plugin.current.reset}
                        opts={{
                          loop: liveMatches.length > 1,
                          align: "start"
                        }}
                      >
                        <CarouselContent>
                          {liveMatches.map((match) => (
                            <CarouselItem key={match._id} className="md:basis-1/2">
                               <div className="p-1">
                                <MatchCard match={match} teamOne={teams.get(match.teamA)} teamTwo={teams.get(match.teamB)} />
                               </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">
                          No live matches at the moment. Check back soon!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

              <Separator />

              {/* Upcoming Matches */}
              <section id="upcoming-matches">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  Upcoming Matches
                </h2>
                <div className="space-y-4">
                  {isLoading ? (
                     <div className="flex justify-center items-center p-6 bg-card rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading matches...</span>
                    </div>
                  ) : upcomingMatches.length > 0 ? (
                    upcomingMatches.map((match) => (
                      <UpcomingMatchCard key={match._id} match={match} teamOne={teams.get(match.teamA)} teamTwo={teams.get(match.teamB)} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">
                          No upcoming matches scheduled right now.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-primary text-primary-foreground py-6 mt-8">
        <div className="container mx-auto text-center px-4">
          <p>&copy; 2024 Energy 2025. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

    