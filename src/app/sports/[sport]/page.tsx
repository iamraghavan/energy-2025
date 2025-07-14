import { notFound } from 'next/navigation';
import { sports, matches } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { SportIcon } from '@/components/sports/sport-icon';
import { MatchCard } from '@/components/sports/match-card';
import { PredictionTool } from '@/components/sports/prediction-tool';
import { Separator } from '@/components/ui/separator';

export async function generateStaticParams() {
  return sports.map((sport) => ({
    sport: sport.slug,
  }));
}

export default function SportPage({ params }: { params: { sport: string } }) {
  const sportData = sports.find((s) => s.slug === params.sport);

  if (!sportData) {
    notFound();
  }

  const liveMatches = matches.filter((m) => m.sport === sportData.name && m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.sport === sportData.name && m.status === 'upcoming');
  const finishedMatches = matches.filter((m) => m.sport === sportData.name && m.status === 'finished');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="flex items-center gap-4 mb-8">
          <SportIcon sportName={sportData.name} className="w-16 h-16 text-primary" />
          <h1 className="text-5xl md:text-7xl font-headline tracking-wider">
            {sportData.name}
          </h1>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section id="live-matches">
              <h2 className="text-3xl font-headline mb-4">Live</h2>
              <div className="space-y-4">
                {liveMatches.length > 0 ? (
                  liveMatches.map((match) => <MatchCard key={match.id} match={match} />)
                ) : (
                  <p className="text-muted-foreground">No live matches right now.</p>
                )}
              </div>
            </section>
            
            <Separator />

            <section id="upcoming-matches">
              <h2 className="text-3xl font-headline mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
                ) : (
                  <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                )}
              </div>
            </section>

            <Separator />

            <section id="recent-results">
              <h2 className="text-3xl font-headline mb-4">Recent Results</h2>
              <div className="space-y-4">
                {finishedMatches.length > 0 ? (
                  finishedMatches.map((match) => <MatchCard key={match.id} match={match} />)
                ) : (
                  <p className="text-muted-foreground">No recent results found.</p>
                )}
              </div>
            </section>
          </div>
          <aside className="lg:col-span-1">
            <PredictionTool sport={sportData.name} />
          </aside>
        </div>
      </main>
    </div>
  );
}
