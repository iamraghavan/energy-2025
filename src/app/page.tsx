'use client';

import Link from 'next/link';
import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

import { sports, matches } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { SportIcon } from '@/components/sports/sports-icons';
import { MatchCard } from '@/components/sports/match-card';
import { ArrowUpRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

export default function Home() {
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-r from-[#001b70] to-[#af005f] text-white overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                  EGS Pillay Group of Institutions Presents Energy 2025
                </h1>
                <p className="text-lg md:text-xl text-white/80 mt-4 max-w-2xl mx-auto md:mx-0 text-balance">
                  Your ultimate destination for live scores, match schedules, and results for the inter-departmental sports fest.
                </p>
              </div>
              <div className="relative flex justify-center items-center">
                <Image
                  src="https://storage.googleapis.com/stey-prod-public/deletable/energy-logo.png"
                  alt="Energy 2025 Logo"
                  width={200}
                  height={200}
                  className="w-48 h-48 text-white/20"
                />
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
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Image
                       src="https://storage.googleapis.com/stey-prod-public/deletable/energy-logo.png"
                       alt="Energy 2025 Logo"
                       width={28}
                       height={28}
                    />
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
                        <SportIcon
                          sportName={sport.name}
                          className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors"
                        />
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
                  {liveMatches.length > 0 ? (
                      <Carousel
                        plugins={[plugin.current]}
                        className="w-full"
                        onMouseEnter={plugin.current.stop}
                        onMouseLeave={plugin.current.reset}
                        opts={{
                          loop: true,
                          align: "start"
                        }}
                      >
                        <CarouselContent>
                          {liveMatches.map((match) => (
                            <CarouselItem key={match.id} className="md:basis-1/2">
                               <div className="p-1">
                                <MatchCard match={match} />
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
                  {upcomingMatches.length > 0 ? (
                    upcomingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
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
