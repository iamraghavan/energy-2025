import * as React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import type { MatchAPI, Team } from '@/lib/types';
import { Clock, MapPin, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface UpcomingMatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function UpcomingMatchCard({ match, teamOne, teamTwo }: UpcomingMatchCardProps) {
  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: `Upcoming Match: ${team1Name} vs ${team2Name}`,
      text: `Check out the upcoming ${match.sport} match between ${team1Name} and ${team2Name}!`,
      url: `${window.location.origin}/sports/${match.sport.toLowerCase().replace(/ /g, '-')}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link Copied!", description: "Match link copied to your clipboard." });
      }
    } catch (error) {
        console.error('Share failed:', error);
        toast({
            variant: 'destructive',
            title: 'Share Failed',
            description: 'Could not share the match details.',
        });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold text-sm text-muted-foreground">{match.sport}</h3>
        <Badge variant="outline" className="capitalize">Upcoming</Badge>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center justify-center gap-2 text-center font-semibold text-foreground py-2">
            <p className="flex-1 text-right truncate">{team1Name}</p>
            <span className="text-sm text-destructive mx-2">vs</span>
            <p className="flex-1 text-left truncate">{team2Name}</p>
        </div>
        <Separator />
      </CardContent>
      <CardFooter className="flex-col sm:flex-row text-xs text-muted-foreground gap-x-4 gap-y-2 justify-between items-center border-t p-2">
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 w-full">
            <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(match.scheduledAt), 'p, MMM d')}</span>
            </div>
            <div className="hidden sm:block">|</div>
            <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{match.venue} ({match.courtNumber})</span>
            </div>
          </div>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share Match</span>
          </Button>
      </CardFooter>
    </Card>
  );
}
