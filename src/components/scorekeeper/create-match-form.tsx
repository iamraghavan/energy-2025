'use client';

import * as React from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getTeams } from '@/services/team-service';
import { getSports } from '@/services/sport-service';
import { createMatch } from '@/services/match-service';
import type { Team, SportAPI } from '@/lib/types';

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

const reactSelectStyles = (isMobile: boolean) => ({
    control: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--input))',
      color: 'hsl(var(--foreground))',
      minHeight: '40px',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      zIndex: 50,
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'hsl(var(--primary))' : state.isFocused ? 'hsl(var(--accent))' : 'hsl(var(--background))',
      color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
      '&:hover': {
          backgroundColor: 'hsl(var(--accent))',
          color: 'hsl(var(--accent-foreground))',
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
});

export function CreateMatchForm({ open, onOpenChange, onMatchCreated, children }: CreateMatchFormProps) {
  const isMobile = useIsMobile();
  
  const FormContent = <CreateMatchFormContent onMatchCreated={onMatchCreated} onOpenChange={onOpenChange} isMobile={isMobile} />;

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

function CreateMatchFormContent({ onMatchCreated, onOpenChange, isMobile }: { onMatchCreated: () => void; onOpenChange: (open: boolean) => void; isMobile: boolean }) {
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

    const sportOptions = sports.map(s => ({ value: s._id, label: s.name }));
    const teamOptions = teams.map(t => ({ value: t._id, label: `${t.name} (${t.school.name})` }));
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="sportId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Controller
                        name="sportId"
                        control={form.control}
                        render={({ field: controllerField }) => (
                            <Select
                                {...controllerField}
                                options={sportOptions}
                                value={sportOptions.find(c => c.value === controllerField.value)}
                                onChange={val => controllerField.onChange(val?.value)}
                                styles={reactSelectStyles(isMobile)}
                                placeholder="Select sport"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            />
                        )}
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
                     <Controller
                        name="teamOneId"
                        control={form.control}
                        render={({ field: controllerField }) => (
                            <Select
                                {...controllerField}
                                options={teamOptions}
                                value={teamOptions.find(c => c.value === controllerField.value)}
                                onChange={val => controllerField.onChange(val?.value)}
                                styles={reactSelectStyles(isMobile)}
                                placeholder="Select team one"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            />
                        )}
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
                    <Controller
                        name="teamTwoId"
                        control={form.control}
                        render={({ field: controllerField }) => (
                            <Select
                                {...controllerField}
                                options={teamOptions}
                                value={teamOptions.find(c => c.value === controllerField.value)}
                                onChange={val => controllerField.onChange(val?.value)}
                                styles={reactSelectStyles(isMobile)}
                                placeholder="Select team two"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            />
                        )}
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
