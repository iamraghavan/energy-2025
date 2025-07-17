import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchAPI, Team } from '@/lib/types';
import { Clock, MapPin, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface MatchCardProps {
  match: MatchAPI;
  teamOne?: Team | null;
  teamTwo?: Team | null;
}

export function MatchCard({ match, teamOne, teamTwo }: MatchCardProps) {
  const { pointsA, pointsB, status } = match;
  const { toast } = useToast();

  const team1Name = teamOne?.name || 'Team A';
  const team2Name = teamTwo?.name || 'Team B';
  
  const getStatusVariant = (): 'destructive' | 'secondary' => {
    switch (status) {
        case 'live': return 'destructive';
        case 'completed':
        default: return 'secondary';
    }
  };
  
  const handleShare = async () => {
    const shareData = {
      title: `Match: ${team1Name} vs ${team2Name}`,
      text: `Check out the ${match.sport} match between ${team1Name} and ${team2Name}! Score: ${pointsA} - ${pointsB}.`,
      url: window.location.href, // Share the current page URL
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link Copied!", description: "Match link copied to your clipboard." });
      }
    } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Share failed:', error);
        toast({
            variant: 'destructive',
            title: 'Share Failed',
            description: 'Could not share the match details.',
        });
    }
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-3">
        <h3 className="font-semibold text-xs text-muted-foreground">{match.sport}</h3>
        <Badge variant={getStatusVariant()} className="capitalize text-xs">{status}</Badge>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <div className="space-y-3">
            {/* Team 1 */}
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-3 flex-1 truncate">
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} alt={team1Name} data-ai-hint="logo" />
                        <AvatarFallback>{team1Name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-sm text-foreground truncate">{team1Name}</p>
                </div>
                <p className="font-bold text-2xl text-primary tabular-nums tracking-tight">{pointsA}</p>
            </div>
             {/* Team 2 */}
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-3 flex-1 truncate">
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} alt={team2Name} data-ai-hint="logo" />
                        <AvatarFallback>{team2Name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-sm text-foreground truncate">{team2Name}</p>
                </div>
                <p className="font-bold text-2xl text-primary tabular-nums tracking-tight">{pointsB}</p>
            </div>
        </div>
      </CardContent>
      <Separator />
       <CardFooter className="flex text-xs text-muted-foreground justify-between items-center p-2">
          <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{match.venue}</span>
          </div>
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              <span className="sr-only">Share Match</span>
          </Button>
      </CardFooter>
    </Card>
  );
}
