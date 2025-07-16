'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateMatch, getMatches } from '@/services/match-service';
import type { MatchAPI } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { SportIcon } from '@/components/sports/sports-icons';

const updateScoreSchema = z.object({
  teamOneScore: z.coerce.number().min(0),
  teamTwoScore: z.coerce.number().min(0),
  status: z.enum(['scheduled', 'live', 'completed']),
});

type UpdateScoreFormValues = z.infer<typeof updateScoreSchema>;

export default function LiveMatchPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  
  const [match, setMatch] = React.useState<MatchAPI | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateScoreFormValues>({
    resolver: zodResolver(updateScoreSchema),
  });

  React.useEffect(() => {
    if (!matchId) return;

    const fetchMatchDetails = async () => {
      setIsLoading(true);
      try {
        const allMatches = await getMatches();
        const currentMatch = allMatches.find(m => m._id === matchId);
        if (currentMatch) {
            setMatch(currentMatch);
            form.reset({
                teamOneScore: currentMatch.teamOneScore,
                teamTwoScore: currentMatch.teamTwoScore,
                status: currentMatch.status,
            });
        } else {
            toast({ variant: 'destructive', title: 'Match not found' });
            router.push('/scorekeeper-dashboard');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to fetch match details' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatchDetails();
  }, [matchId, router, toast, form]);

  const onFormSubmit = async (values: UpdateScoreFormValues) => {
    if (!match) return;
    setIsSubmitting(true);
    try {
      await updateMatch(match._id, values);
      toast({ title: 'Match Updated', description: 'The scores and status have been saved.' });
      router.push(`/scorekeeper-dashboard?tab=${values.status}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not save match details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading match details...</div>
  }

  if (!match) {
      return <div className="flex h-screen items-center justify-center">Match not found.</div>
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/scorekeeper-dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Update Live Match</h1>
                <p className="text-muted-foreground">Modify scores and status for the ongoing match.</p>
            </div>
        </div>
        <Card className="max-w-2xl mx-auto w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <SportIcon sportName={match.sport.name} className="w-6 h-6" />
                            {match.sport.name}
                        </CardTitle>
                        <CardDescription>
                          {match.teamOne?.school?.name && match.teamTwo?.school?.name 
                            ? `${match.teamOne.school.name} vs ${match.teamTwo.school.name}`
                            : 'Team details unavailable'}
                        </CardDescription>
                    </div>
                    <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>
                        {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <p className="font-semibold">{match.teamOne?.name || 'Team 1'}</p>
                    <FormField
                        control={form.control}
                        name="teamOneScore"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Score for {match.teamOne?.name}</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    </div>
                    <div className="space-y-2">
                    <p className="font-semibold">{match.teamTwo?.name || 'Team 2'}</p>
                    <FormField
                        control={form.control}
                        name="teamTwoScore"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Score for {match.teamTwo?.name}</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="w-full sm:w-auto">
                                <FormLabel className="sr-only">Match Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="live">Live</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                        </>
                    ) : (
                        <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Match
                        </>
                    )}
                    </Button>
                </CardFooter>
                </form>
            </Form>
        </Card>
    </div>
  );
}
