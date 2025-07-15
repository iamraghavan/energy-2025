'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';

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
import { updateMatch } from '@/services/match-service';
import type { MatchAPI } from '@/lib/types';
import { Badge } from '../ui/badge';
import { SportIcon } from '../sports/sports-icons';

const updateScoreSchema = z.object({
  teamOneScore: z.coerce.number().min(0),
  teamTwoScore: z.coerce.number().min(0),
  status: z.enum(['upcoming', 'live', 'finished']),
});

type UpdateScoreFormValues = z.infer<typeof updateScoreSchema>;

interface UpdateScoreFormProps {
  match: MatchAPI;
  onMatchUpdated: () => void;
}

export function UpdateScoreForm({ match, onMatchUpdated }: UpdateScoreFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateScoreFormValues>({
    resolver: zodResolver(updateScoreSchema),
    defaultValues: {
      teamOneScore: match.teamOneScore,
      teamTwoScore: match.teamTwoScore,
      status: match.status,
    },
  });

  const onFormSubmit = async (values: UpdateScoreFormValues) => {
    setIsSubmitting(true);
    try {
      await updateMatch(match._id, values);
      toast({ title: 'Match Updated', description: 'The scores and status have been saved.' });
      onMatchUpdated();
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

  return (
    <Card>
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
                  {match.teamOne.school.name} vs {match.teamTwo.school.name}
                </CardDescription>
              </div>
               <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {/* Team One */}
            <div className="space-y-2">
              <p className="font-semibold">{match.teamOne.name}</p>
              <FormField
                control={form.control}
                name="teamOneScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Score for {match.teamOne.name}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Team Two */}
            <div className="space-y-2">
              <p className="font-semibold">{match.teamTwo.name}</p>
              <FormField
                control={form.control}
                name="teamTwoScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Score for {match.teamTwo.name}</FormLabel>
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
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                                <SelectItem value="finished">Finished</SelectItem>
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
  );
}
