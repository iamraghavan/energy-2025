import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Calendar, MapPin, Lightbulb } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 bg-primary/10">
           <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{backgroundImage: "url('/circuit-board.svg')"}}
          ></div>
          <div className="container mx-auto relative">
            <p className="text-lg md:text-xl font-semibold text-primary mb-2">
              EGS Pillay Group of Institutions proudly presents
            </p>
            <h1 className="text-5xl md:text-7xl font-headline tracking-wider text-primary">
              Energy 2025
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              A National Level Technical Symposium exploring the future of energy, technology, and innovation. Join us for a day of insightful talks, workshops, and competitions.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Register Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#events">View Events</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="container mx-auto py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl mt-2">Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">October 28th, 2025</p>
                <p className="text-muted-foreground">9:00 AM - 5:00 PM</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl mt-2">Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">EGS Pillay Engineering College</p>
                <p className="text-muted-foreground">Nagapattinam, Tamil Nadu</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl mt-2">Why Attend?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Network with experts and peers</p>
                <p className="text-muted-foreground">Win exciting prizes</p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="bg-background py-16">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-headline mb-4">About Energy 2025</h2>
              <p className="text-muted-foreground mb-4">
                Energy 2025 is a premier technical symposium designed to bring together the brightest minds in engineering and technology. Our mission is to foster innovation, encourage collaboration, and provide a platform for students to showcase their skills and ideas.
              </p>
              <p className="text-muted-foreground">
                This year, we focus on the critical role of sustainable and renewable energy sources, smart technologies, and the future of automation. We invite you to be a part of this electrifying event!
              </p>
            </div>
            <div>
              <Image 
                src="https://placehold.co/600x400.png"
                alt="Students collaborating at a tech event"
                data-ai-hint="tech conference students"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

      </main>
      <footer className="bg-primary text-primary-foreground py-6">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 EGS Pillay Group of Institutions. All Rights Reserved.</p>
          </div>
      </footer>
    </div>
  );
}
