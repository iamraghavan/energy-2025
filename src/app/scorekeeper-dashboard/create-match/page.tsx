'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getTeams } from '@/services/team-service';
import { getSports } from '@/services/sport-service';
import { createMatch } from '@/services/match-service';
import type { Team, SportAPI, CreateMatchPayload } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const matchSchema = z
  .object({
    sportId: z.string({ required_error: 'Please select a sport.' }),
    teamOneId: z.string({ required_error: 'Please select team one.' }),
    teamTwoId: z.string({ required_error: 'Please select team two.' }),
    venue: z.string({ required_error: 'Please select a venue.' }),
    courtNumber: z.string().min(1, 'Court number is required.'),
    refereeName: z.string().min(1, 'Referee name is required.'),
    scheduledAt: z.date({ required_error: 'Match date is required.' }),
  })
  .refine((data) => data.teamOneId !== data.teamTwoId, {
    message: 'Team one and team two cannot be the same.',
    path: ['teamTwoId'],
  });

type MatchFormValues = z.infer<typeof matchSchema>;

const venues = [
  'Auditorium',
  'PV Sindhu indoor Statium',
  'PG Block',
  'College Ground',
  'VDP Cricket Ground',
];

export default function CreateMatchPage() {
  const router = useRouter();
  const [allTeams, setAllTeams] = React.useState<Team[]>([]);
  const [sports, setSports] = React.useState<SportAPI[]>([]);
  const [filteredTeams, setFilteredTeams] = React.useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
  });

  const selectedSportId = form.watch('sportId');
  const selectedTeamOneId = form.watch('teamOneId');
  const selectedTeamTwoId = form.watch('teamTwoId');

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, sportsData] = await Promise.all([
          getTeams(),
          getSports(),
        ]);
        setAllTeams(teamsData);
        setSports(sportsData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load data',
          description: 'Could not load teams or sports. Please try again.',
        });
      }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    if (selectedSportId && allTeams.length > 0) {
      const teamsForSport = allTeams.filter(
        (team) => team.sport._id === selectedSportId
      );
      setFilteredTeams(teamsForSport);
      form.resetField('teamOneId', { defaultValue: '' });
      form.resetField('teamTwoId', { defaultValue: '' });
    } else {
      setFilteredTeams([]);
    }
  }, [selectedSportId, allTeams, form]);

  const onFormSubmit = async (values: MatchFormValues) => {
    setIsSubmitting(true);
    
    const teamA = allTeams.find(t => t._id === values.teamOneId)?.teamId;
    const sportName = sports.find(s => s._id === values.sportId)?.name;
    const teamB = allTeams.find(t => t._id === values.teamTwoId)?.teamId;

    if (!teamA || !teamB || !sportName) {
        toast({
            variant: 'destructive',
            title: 'Invalid Data',
            description: 'Could not find the necessary ID for the selected sport or teams.',
        });
        setIsSubmitting(false);
        return;
    }

    const payload: CreateMatchPayload = {
      sport: sportName,
      teamA: teamA,
      teamB: teamB,
      scheduledAt: values.scheduledAt.toISOString(),
      venue: values.venue,
      courtNumber: values.courtNumber,
      refereeName: values.refereeName,
    };

    try {
      await createMatch(payload);
      toast({
        title: 'Match Created',
        description: 'The new match has been scheduled successfully.',
      });
      router.push('/scorekeeper-dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/scorekeeper-dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create a New Match
            </h1>
            <p className="text-muted-foreground">
              Select the sport and teams to schedule a match.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFormSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sportId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sport</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a sport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sports.map((sport) => (
                              <SelectItem key={sport._id} value={sport._id}>
                                {sport.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Match Date & Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                            />
                            {/* Simple time picker - can be enhanced */}
                            <div className="p-2 border-t">
                               <Input 
                                type="time"
                                defaultValue={field.value ? format(field.value, 'HH:mm') : ''}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const [hours, minutes] = time.split(':').map(Number);
                                    const newDate = new Date(field.value || new Date());
                                    newDate.setHours(hours, minutes);
                                    field.onChange(newDate);
                                }}
                               />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 <FormField
                  control={form.control}
                  name="teamOneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team One</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedSportId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team one" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {filteredTeams
                            .filter(team => team._id !== selectedTeamTwoId)
                            .map((team) => (
                                <SelectItem key={team._id} value={team._id}>
                                {`${team.name} - ${team.school.name}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamTwoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Two</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedSportId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team two" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {filteredTeams
                            .filter(team => team._id !== selectedTeamOneId)
                            .map((team) => (
                                <SelectItem key={team._id} value={team._id}>
                                {`${team.name} - ${team.school.name}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a venue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {venues.map((venue) => (
                                <SelectItem key={venue} value={venue}>
                                  {venue}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="courtNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Court / Field Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Court 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                </div>

                 <FormField
                    control={form.control}
                    name="refereeName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Referee Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter referee's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Match'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
