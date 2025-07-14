import Link from 'next/link';
import { sports, matches } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { SportIcon } from '@/components/sports/sport-icon';
import { MatchCard } from '@/components/sports/match-card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const liveMatches = matches.filter((match) => match.status === 'live');
  const upcomingMatches = matches.filter((match) => match.status === 'upcoming');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-headline tracking-wider text-primary">
            ScoreCast
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            Live Scores & AI-Powered Match Predictions
          </p>
        </section>

        <section id="sports" className="mb-12">
          <h2 className="text-3xl font-headline mb-6 text-center">All Sports</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sports.map((sport) => (
              <Link href={`/sports/${sport.slug}`} key={sport.slug}>
                <Card className="hover:shadow-lg hover:border-primary transition-all duration-200 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                    <SportIcon sportName={sport.name} className="w-12 h-12 text-primary" />
                    <span className="font-semibold text-center">{sport.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        <div className="grid md:grid-cols-2 gap-8">
          <section id="live-matches">
            <h2 className="text-3xl font-headline mb-6">Live Matches</h2>
            <div className="space-y-4">
              {liveMatches.length > 0 ? (
                liveMatches.map((match) => <MatchCard key={match.id} match={match} />)
              ) : (
                <p>No live matches at the moment.</p>
              )}
            </div>
          </section>

          <section id="upcoming-matches">
            <h2 className="text-3xl font-headline mb-6">Upcoming</h2>
            <div className="space-y-4">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
              ) : (
                <p>No upcoming matches scheduled.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
