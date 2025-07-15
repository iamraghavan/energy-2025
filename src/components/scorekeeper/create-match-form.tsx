'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
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
  const isMobile = useIsMobile();
  
  const FormContent = <CreateMatchFormContent onMatchCreated={onMatchCreated} onOpenChange={onOpenChange} />;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
           <DrawerHeader className="text-left">
            <DrawerTitle>Create a New Match</DrawerTitle>
            <DrawerDescription>Select the sport and teams to schedule a match.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">{FormContent}</div>
          <DrawerFooter className="pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Match</DialogTitle>
          <DialogDescription>Select the sport and teams to schedule a match.</DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
}

function CreateMatchFormContent({ onMatchCreated, onOpenChange }: { onMatchCreated: () => void; onOpenChange: (open: boolean) => void; }) {
    const [allTeams, setAllTeams] = React.useState<Team[]>([]);
    const [sports, setSports] = React.useState<SportAPI[]>([]);
    const [filteredTeams, setFilteredTeams] = React.useState<Team[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
  
    const form = useForm<MatchFormValues>({
      resolver: zodResolver(matchSchema),
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
            const teamsForSport = allTeams.filter(team => team.sport._id === selectedSportId);
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

    const sportOptions = sports.map(s => ({ value: s._id, label: s.name }));
    const teamOptions = filteredTeams.map(t => ({ value: t._id, label: `${t.name} (${t.school.name})` }));
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="sportId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Sport</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? sportOptions.find(
                                        (option) => option.value === field.value
                                    )?.label
                                    : "Select sport"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search sport..." />
                                <CommandList>
                                    <CommandEmpty>No sport found.</CommandEmpty>
                                    <CommandGroup>
                                        {sportOptions.map((option) => (
                                        <CommandItem
                                            value={option.label}
                                            key={option.value}
                                            onSelect={() => {
                                                form.setValue("sportId", option.value)
                                            }}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                option.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
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
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedSportId}
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? teamOptions.find(
                                        (option) => option.value === field.value
                                    )?.label
                                    : "Select team one"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search team..." />
                                <CommandList>
                                    <CommandEmpty>No teams found for this sport.</CommandEmpty>
                                    <CommandGroup>
                                        {teamOptions.map((option) => (
                                        <CommandItem
                                            value={option.label}
                                            key={option.value}
                                            onSelect={() => {
                                                form.setValue("teamOneId", option.value)
                                            }}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                option.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
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
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedSportId}
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? teamOptions.find(
                                        (option) => option.value === field.value
                                    )?.label
                                    : "Select team two"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search team..." />
                                <CommandList>
                                    <CommandEmpty>No teams found for this sport.</CommandEmpty>
                                    <CommandGroup>
                                        {teamOptions.map((option) => (
                                        <CommandItem
                                            value={option.label}
                                            key={option.value}
                                            onSelect={() => {
                                                form.setValue("teamTwoId", option.value)
                                            }}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                option.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             <div className="pt-4 md:pt-0 md:flex md:justify-end">
                 <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? 'Creating...' : 'Create Match'}
                </Button>
            </div>
          </form>
        </Form>
    )
}
