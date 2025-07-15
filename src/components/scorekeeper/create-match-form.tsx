'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

const matchSchema = z.object({
  sportId: z.string({ required_error: 'Please select a sport.' }),
  teamOneId: z.string({ required_error: 'Please select team one.' }),
  teamTwoId: z.string({ required_error: 'Please select team two.' }),
}).refine(data => data.teamOneId !== data.teamTwoId, {
  message: "Team one and team two cannot be the same.",
  path: ["teamTwoId"],
});

type MatchFormValues = z.infer<typeof matchSchema>;

interface CreateMatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchCreated: () => void;
  children: React.ReactNode;
}

export function CreateMatchForm({ open, onOpenChange, onMatchCreated, children }: CreateMatchFormProps) {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [sports, setSports] = React.useState<SportAPI[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, sportsData] = await Promise.all([
          getTeams(),
          getSports(),
        ]);
        setTeams(teamsData);
        setSports(sportsData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load data',
          description: 'Could not load teams or sports. Please try again.',
        });
      }
    }
    if (open) {
      fetchData();
    }
  }, [open, toast]);

  const onFormSubmit = async (values: MatchFormValues) => {
    setIsSubmitting(true);
    try {
      await createMatch(values);
      toast({ title: 'Match Created', description: 'The new match has been scheduled.' });
      onMatchCreated();
      onOpenChange(false);
      form.reset();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Match</DialogTitle>
          <DialogDescription>Select the sport and teams to schedule a match.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="sportId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sport</FormLabel>
                  <SearchableSelect
                    value={field.value}
                    onSelect={(value) => form.setValue("sportId", value, { shouldValidate: true })}
                    options={sports.map(s => ({ value: s._id, label: s.name }))}
                    placeholder="Select sport"
                    searchPlaceholder="Search sport..."
                    emptyMessage="No sport found."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="teamOneId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Team One</FormLabel>
                   <SearchableSelect
                    value={field.value}
                    onSelect={(value) => form.setValue("teamOneId", value, { shouldValidate: true })}
                    options={teams.map(t => ({ value: t._id, label: `${t.name} (${t.school.name})` }))}
                    placeholder="Select team one"
                    searchPlaceholder="Search team..."
                    emptyMessage="No team found."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="teamTwoId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Team Two</FormLabel>
                   <SearchableSelect
                    value={field.value}
                    onSelect={(value) => form.setValue("teamTwoId", value, { shouldValidate: true })}
                    options={teams.map(t => ({ value: t._id, label: `${t.name} (${t.school.name})` }))}
                    placeholder="Select team two"
                    searchPlaceholder="Search team..."
                    emptyMessage="No team found."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Match'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface SearchableSelectProps {
    value: string;
    onSelect: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    searchPlaceholder: string;
    emptyMessage: string;
}

function SearchableSelect({ value, onSelect, options, placeholder, searchPlaceholder, emptyMessage }: SearchableSelectProps) {
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className={cn("w-full justify-between", !value && "text-muted-foreground")}
            >
                {value ? options.find(o => o.value === value)?.label : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
                <CommandInput placeholder={searchPlaceholder} />
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                <CommandList>
                    {options.map((option) => (
                    <CommandItem
                        value={option.value}
                        key={option.value}
                        onSelect={(currentValue) => {
                            onSelect(currentValue === value ? "" : currentValue)
                            setPopoverOpen(false)
                        }}
                    >
                        <Check
                        className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")}
                        />
                        {option.label}
                    </CommandItem>
                    ))}
                </CommandList>
                </CommandGroup>
            </Command>
            </PopoverContent>
        </Popover>
    )
}
