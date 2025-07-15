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
  DialogFooter,
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
           <DrawerHeader className="text-left">
            <DrawerTitle>Create a New Match</DrawerTitle>
            <DrawerDescription>Select the sport and teams to schedule a match.</DrawerDescription>
          </DrawerHeader>
          <CreateMatchFormContent onMatchCreated={onMatchCreated} onOpenChange={onOpenChange} />
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
        <CreateMatchFormContent onMatchCreated={onMatchCreated} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function CreateMatchFormContent({ onMatchCreated, onOpenChange }: Pick<CreateMatchFormProps, 'onMatchCreated' | 'onOpenChange'>) {
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
      fetchData();
    }, [toast]);
  
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 px-4 md:px-0">
            <FormField
                control={form.control}
                name="sportId"
                render={({ field }) => (
                <FormItem>
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
                <FormItem>
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
                <FormItem>
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
             <div className="pt-4 md:pt-0 md:flex md:justify-end">
                 <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? 'Creating...' : 'Create Match'}
                </Button>
            </div>
          </form>
        </Form>
    )
}

interface SearchableSelectProps {
    value?: string;
    onSelect: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    searchPlaceholder: string;
    emptyMessage: string;
}

function SearchableSelect({ value, onSelect, options, placeholder, searchPlaceholder, emptyMessage }: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const selectedLabel = options.find((option) => option.value === value)?.label;

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        {selectedLabel || placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mt-4 border-t">
                        <OptionList 
                            options={options} 
                            onSelect={onSelect} 
                            setOpen={setOpen} 
                            searchPlaceholder={searchPlaceholder} 
                            emptyMessage={emptyMessage}
                        />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedLabel || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                 <OptionList 
                    options={options} 
                    onSelect={onSelect} 
                    setOpen={setOpen} 
                    searchPlaceholder={searchPlaceholder} 
                    emptyMessage={emptyMessage}
                />
            </PopoverContent>
        </Popover>
    )
}

function OptionList({ options, onSelect, setOpen, searchPlaceholder, emptyMessage }: Omit<SearchableSelectProps, 'value' | 'placeholder'> & { setOpen: (open: boolean) => void }) {
    return (
        <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <ScrollArea className="h-auto max-h-64">
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandList>
                    <CommandGroup>
                        {options.map((option) => (
                            <CommandItem
                                value={option.label}
                                key={option.value}
                                onSelect={() => {
                                    onSelect(option.value);
                                    setOpen(false);
                                }}
                            >
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </ScrollArea>
        </Command>
    )
}
