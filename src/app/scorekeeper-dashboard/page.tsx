'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClipboardList, PlusCircle, Frown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMatches } from '@/services/match-service';
import type { MatchAPI } from '@/lib/types';
import { UpdateScoreForm } from '@/components/scorekeeper/update-score-form';

export default function ScorekeeperDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [matches, setMatches] = React.useState<MatchAPI[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'live');

  const { toast } = useToast();

  const fetchMatches = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedMatches = await getMatches();
      setMatches(fetchedMatches);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch matches',
        description: 'Could not load match data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/scorekeeper-dashboard?tab=${value}`, { scroll: false });
  };

  const scheduledMatches = matches.filter((m) => m.status === 'scheduled');
  const liveMatches = matches.filter((m) => m.status === 'live');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scorekeeper Dashboard</h1>
            <p className="text-muted-foreground">Manage live scores and match outcomes.</p>
          </div>
        </div>
        <Button asChild>
            <Link href="/scorekeeper-dashboard/create-match">
                <PlusCircle className="mr-2" />
                Create Match
            </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          <MatchList matches={liveMatches} onUpdate={fetchMatches} isLoading={isLoading} emptyMessage="No live matches right now." />
        </TabsContent>
        <TabsContent value="scheduled">
          <MatchList matches={scheduledMatches} onUpdate={fetchMatches} isLoading={isLoading} emptyMessage="No matches are scheduled." />
        </TabsContent>
        <TabsContent value="completed">
          <MatchList matches={completedMatches} onUpdate={fetchMatches} isLoading={isLoading} emptyMessage="No matches have been completed yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MatchListProps {
  matches: MatchAPI[];
  onUpdate: () => void;
  isLoading: boolean;
  emptyMessage: string;
}

function MatchList({ matches, onUpdate, isLoading, emptyMessage }: MatchListProps) {
    if (isLoading) {
        return <p className="text-center text-muted-foreground py-8">Loading matches...</p>;
    }

    if (matches.length === 0) {
        return (
            <Card className="mt-4">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                    <Frown className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-4 mt-4">
            {matches.map((match) => (
                <UpdateScoreForm key={match._id} match={match} onMatchUpdated={onUpdate} />
            ))}
        </div>
    );
}
