import { notFound } from 'next/navigation';
import { sports, matches as mockMatches, schoolTeams } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { SportIcon } from '@/components/sports/sports-icons';
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
import { Users } from 'lucide-react';


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

  const liveMatches = mockMatches.filter((m) => m.sport === sportData.name && m.status === 'live');
  const upcomingMatches = mockMatches.filter((m) => m.sport === sportData.name && m.status === 'upcoming');
  const finishedMatches = mockMatches.filter((m) => m.sport === sportData.name && m.status === 'finished');

  const participatingTeams = schoolTeams[sportData.name.toLowerCase() as keyof typeof schoolTeams] || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="flex items-center gap-4 mb-8">
          <SportIcon sportName={sportData.name} className="w-16 h-16 text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {sportData.name}
          </h1>
        </section>

        <div className="space-y-8">
            <section id="live-matches">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Live</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.length > 0 ? (
                  liveMatches.map((match) => <MatchCard key={match.id} match={match} />)
                ) : (
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">No live matches right now.</p>
                  </div>
                )}
              </div>
            </section>
            
            <Separator />

            <section id="upcoming-matches">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
                ) : (
                   <div className="md:col-span-2">
                    <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            <section id="recent-results">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Recent Results</h2>
              <div>
                {finishedMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {finishedMatches.map((match) => <MatchCard key={match.id} match={match} />)}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent results found.</p>
                )}
              </div>
            </section>

            <Separator />

            <section id="participating-schools">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <Users className="w-8 h-8 text-accent-foreground" />
                    Participating Schools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participatingTeams.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">#</TableHead>
                          <TableHead>School Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participatingTeams.map((team, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{team.schoolName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                     <p className="text-muted-foreground text-center">No participating schools listed for {sportData.name} yet.</p>
                  )}
                </CardContent>
              </Card>
            </section>
        </div>
      </main>
    </div>
  );
}
