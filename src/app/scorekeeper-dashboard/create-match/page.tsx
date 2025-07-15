
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { getTeams } from '@/services/team-service';
import { getSports } from '@/services/sport-service';
import { createMatch } from '@/services/match-service';
import type { Team, SportAPI } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const matchSchema = z
  .object({
    sportId: z.string({ required_error: 'Please select a sport.' }),
    teamOneId: z.string({ required_error: 'Please select team one.' }),
    teamTwoId: z.string({ required_error: 'Please select team two.' }),
  })
  .refine((data) => data.teamOneId !== data.teamTwoId, {
    message: 'Team one and team two cannot be the same.',
    path: ['teamTwoId'],
  });

type MatchFormValues = z.infer<typeof matchSchema>;

export default function CreateMatchPage() {
  const router = useRouter();
  const [allTeams, setAllTeams] = React.useState<Team[]>([]);
  const [sports, setSports] = React.useState<SportAPI[]>([]);
  const [filteredTeams, setFilteredTeams] = React.useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      sportId: '',
      teamOneId: '',
      teamTwoId: '',
    },
  });

  const selectedSportId = form.watch('sportId');

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
      form.setValue('teamOneId', '');
      form.setValue('teamTwoId', '');
    } else {
      setFilteredTeams([]);
    }
  }, [selectedSportId, allTeams, form]);

  const onFormSubmit = async (values: MatchFormValues) => {
    setIsSubmitting(true);
    try {
      await createMatch(values);
      toast({
        title: 'Match Created',
        description: 'The new match has been scheduled.',
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

  const sportOptions = sports.map((s) => ({ value: s._id, label: s.name }));
  const teamOptions = filteredTeams.map((t) => ({
    value: t._id,
    label: `${t.name} - ${t.school.name} - ${t.school.address || 'N/A'} - ${t.teamId}`,
  }));

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
         <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" asChild>
                <Link href="/scorekeeper-dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create a New Match</h1>
                <p className="text-muted-foreground">Select the sport and teams to schedule a match.</p>
            </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <FormControl>
                        <Autocomplete
                          options={sportOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Type to search for a sport..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamOneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team One</FormLabel>
                      <FormControl>
                        <Autocomplete
                          options={teamOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select team one"
                          disabled={!selectedSportId}
                        />
                      </FormControl>
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
                      <FormControl>
                        <Autocomplete
                          options={teamOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select team two"
                          disabled={!selectedSportId}
                        />
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


// Reusable Autocomplete Component
interface AutocompleteProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

function Autocomplete({ options, value, onChange, placeholder, disabled }: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedLabel = React.useMemo(() => {
    return options.find((option) => option.value === value)?.label || '';
  }, [options, value]);

  React.useEffect(() => {
    setInputValue(selectedLabel);
  }, [selectedLabel]);

  const showSuggestions = open && inputValue.length >= 2;

  return (
    <Popover open={showSuggestions} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value !== selectedLabel) {
              onChange('');
            }
            if (e.target.value.length >= 2) {
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}
          onBlur={() => {
              setTimeout(() => {
                const currentOption = options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase());
                if (!currentOption) {
                  setInputValue(selectedLabel || '');
                }
                setOpen(false);
              }, 150);
          }}
          disabled={disabled}
          className="w-full"
          role="combobox"
        />
      </PopoverTrigger>
      {showSuggestions && (
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start"
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevents focus shift
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={(currentLabel) => {
                      const selectedOption = options.find(opt => opt.label.toLowerCase() === currentLabel.toLowerCase());
                      if (selectedOption) {
                        onChange(selectedOption.value);
                        setInputValue(selectedOption.label);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
