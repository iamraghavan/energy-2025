
'use client';

import * as React from 'react';
import { Tv, Monitor, Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { socket, type QuadrantConfig } from '@/services/socket';
import { getLayout, updateLayout } from '@/services/layout-service';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getSports } from '@/services/sport-service';
import type { SportAPI } from '@/lib/types';

export default function BigScreenControlPage() {
  const { toast } = useToast();
  const [sports, setSports] = React.useState<SportAPI[]>([]);
  const [quadrantOptions, setQuadrantOptions] = React.useState<string[]>(['none']);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [layout, setLayout] = React.useState<(string | null)[]>(['none', 'none', 'none', 'none']);

  // Fetch initial data (layout and sports)
  React.useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [currentLayout, fetchedSports] = await Promise.all([
          getLayout().catch(() => ({ quadrants: ['none', 'none', 'none', 'none'] })),
          getSports()
        ]);

        if (currentLayout && currentLayout.quadrants) {
          setLayout(currentLayout.quadrants);
        }
        
        setSports(fetchedSports);
        setQuadrantOptions(['none', ...fetchedSports.map(s => s.name)]);

      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast({
          variant: 'destructive',
          title: 'Could not fetch initial data',
          description: 'Could not load layout or sports. Please check the connection and try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  // Connect to socket on mount
  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);


  const handleLayoutChange = (index: number, value: string) => {
    const selectedSport = sports.find(sport => sport.name === value);
    const sportId = selectedSport ? selectedSport.sportId : 'none';

    console.log(`Quadrant ${index + 1} changed to sportId:`, sportId);
    alert(`Quadrant ${index + 1} set to sportId: ${sportId}`);

    const newLayout = [...layout];
    newLayout[index] = value === 'none' ? null : value;
    setLayout(newLayout);
  };

  const publishLayout = async () => {
    setIsSubmitting(true);
    const payload: QuadrantConfig = {
      quadrants: layout,
    };
    
    try {
        // 1. Persist the layout to the backend
        await updateLayout(payload);

        // 2. Emit socket event for real-time update
        if (!socket.connected) {
          socket.connect();
        }
        socket.emit('layoutUpdate', payload);

        toast({
            title: 'Layout Published!',
            description: 'The big screen display has been updated.',
        });
    } catch (error) {
        console.error('Failed to publish layout', error);
        toast({
            variant: 'destructive',
            title: 'Publish Failed',
            description: 'Could not save or broadcast the layout update.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading layout & sports...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Tv className="w-8 h-8 text-primary" />
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Big Screen Control</h1>
            <p className="text-muted-foreground">
                Dynamically manage the layout of the public live display.
            </p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Screen Layout</CardTitle>
            <CardDescription>
                Assign a sport to each quadrant of the screen. Select 'None' to leave a quadrant empty.
                The layout will automatically adjust to fill the available space.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="border p-4 rounded-lg flex flex-col gap-4 bg-secondary/50">
                       <Label htmlFor={`quadrant-${index}`} className="font-semibold flex items-center gap-2 text-capitalize">
                         <Monitor className="w-5 h-5" />
                         Quadrant {index + 1}
                       </Label>
                       <Select
                         value={layout[index] || 'none'}
                         onValueChange={(value) => handleLayoutChange(index, value)}
                       >
                         <SelectTrigger id={`quadrant-${index}`}>
                           <SelectValue placeholder="Select a sport" />
                         </SelectTrigger>
                         <SelectContent>
                           {quadrantOptions.map((option) => (
                             <SelectItem key={option} value={option} className="capitalize">
                               {option}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={publishLayout} disabled={isSubmitting || isLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Publishing...' : 'Publish Layout'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
