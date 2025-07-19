
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
import { socket } from '@/services/socket';
import { getLayout, updateLayout } from '@/services/layout-service';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getSports } from '@/services/sport-service';
import type { SportAPI, QuadrantConfig } from '@/lib/types';

const initialLayout: QuadrantConfig = {
  quadrant1: null,
  quadrant2: null,
  quadrant3: null,
  quadrant4: null,
};

export default function BigScreenControlPage() {
  const { toast } = useToast();
  const [sports, setSports] = React.useState<SportAPI[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [layout, setLayout] = React.useState<QuadrantConfig>(initialLayout);

  React.useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [currentLayout, fetchedSports] = await Promise.all([
          getLayout().catch(() => initialLayout),
          getSports()
        ]);
        
        setLayout(currentLayout || initialLayout);
        setSports(fetchedSports);

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
  
  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const handleLayoutChange = (quadrant: keyof QuadrantConfig, sportName: string) => {
    const newLayout = { ...layout };
    if (sportName === 'none') {
        newLayout[quadrant] = null;
    } else {
        newLayout[quadrant] = sportName;
    }
    setLayout(newLayout);
  };

  const publishLayout = React.useCallback(async () => {
    setIsSubmitting(true);
    
    try {
        const updatedLayoutResponse = await updateLayout(layout);
        
        if (!socket.connected) {
          socket.connect();
        }
        
        socket.emit('layoutUpdate', updatedLayoutResponse.data.layout);

        toast({
            title: 'Layout Published!',
            description: 'The big screen display has been updated.',
        });
    } catch (error: any) {
        console.error('Failed to publish layout', error);
        toast({
            variant: 'destructive',
            title: 'Publish Failed',
            description: error.message || 'Could not save or broadcast the layout update.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }, [layout, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading layout & sports...</p>
      </div>
    );
  }

  const getSportValue = (sportName: string | null) => {
    return sportName || 'none';
  };

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
                {(Object.keys(layout) as Array<keyof QuadrantConfig>).map((key, index) => (
                    <div key={key} className="border p-4 rounded-lg flex flex-col gap-4 bg-secondary/50">
                       <Label htmlFor={`quadrant-${index}`} className="font-semibold flex items-center gap-2 capitalize">
                         <Monitor className="w-5 h-5" />
                         Quadrant {index + 1}
                       </Label>
                       <Select
                         value={getSportValue(layout[key])}
                         onValueChange={(value) => handleLayoutChange(key, value)}
                       >
                         <SelectTrigger id={`quadrant-${index}`}>
                           <SelectValue placeholder="Select a sport" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="none" className="capitalize">None</SelectItem>
                           {sports.map((sport) => (
                             <SelectItem key={sport._id} value={sport.name} className="capitalize">
                               {sport.name}
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
