
'use client';

import * as React from 'react';
import { Tv, Monitor, Send } from 'lucide-react';

import { sports } from '@/lib/data';
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
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const quadrantOptions = ['none', ...sports.map(s => s.name)];

export default function BigScreenControlPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [layout, setLayout] = React.useState<(string | null)[]>(['none', 'none', 'none', 'none']);

  const handleLayoutChange = (index: number, value: string) => {
    const newLayout = [...layout];
    newLayout[index] = value === 'none' ? null : value;
    setLayout(newLayout);
  };

  const publishLayout = () => {
    setIsSubmitting(true);
    const payload: QuadrantConfig = {
      quadrants: layout,
    };
    
    try {
        socket.connect();
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
            description: 'Could not connect to the server to update the layout.',
        });
    } finally {
        setIsSubmitting(false);
    }
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
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="border p-4 rounded-lg flex flex-col gap-4 bg-secondary/50">
                       <Label htmlFor={`quadrant-${index}`} className="font-semibold flex items-center gap-2">
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
                <Button onClick={publishLayout} disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Publishing...' : 'Publish Layout'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
