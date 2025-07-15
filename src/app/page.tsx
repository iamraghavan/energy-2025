import Link from 'next/link';
import { sports, matches } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { SportIcon } from '@/components/sports/sports-icons';
import { MatchCard } from '@/components/sports/match-card';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center py-16 md:py-24 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto relative px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary-foreground text-balance">
              EGS Pillay Group of Institutions Presents Energy 2025
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mt-4 max-w-3xl mx-auto text-balance">
              Your ultimate destination for live scores, match schedules, and results for the inter-departmental sports fest.
            </p>
          </div>
        </section>

        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-8 mt-8 lg:mt-0">
              {/* Live Matches */}
              <section id="live-matches">
                <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center">
                  <Badge variant="destructive" className="mr-3 animate-pulse text-lg">LIVE</Badge>
                  Live Matches
                </h2>
                <div className="space-y-4">
                  {liveMatches.length > 0 ? (
                    liveMatches.map((match) => <MatchCard key={match.id} match={match} />)
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">No live matches at the moment. Check back soon!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

              <Separator />

              {/* Upcoming Matches */}
              <section id="upcoming-matches">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Upcoming Matches</h2>
                <div className="space-y-4">
                  {upcomingMatches.length > 0 ? (
                    upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">No upcoming matches scheduled right now.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>
            </div>

            {/* All Sports */}
            <aside className="lg:col-span-1 space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="text-accent-foreground"/>
                    All Sports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                    {sports.map((sport) => (
                      <Link
                        href={`/sports/${sport.slug}`}
                        key={sport.slug}
                        className="group flex flex-col items-center justify-center gap-2 rounded-lg p-4 bg-secondary hover:bg-accent transition-colors"
                      >
                        <SportIcon sportName={sport.name} className="w-8 h-8 text-accent-foreground group-hover:text-primary transition-colors" />
                        <span className="font-semibold text-center text-foreground">{sport.name}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
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
