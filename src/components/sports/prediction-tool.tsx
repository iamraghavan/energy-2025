'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { handlePrediction } from '@/app/actions';
import type { PredictMatchOutcomeOutput } from '@/ai/flows/predict-match-outcome';

const predictionSchema = z.object({
  team1: z.string().min(1, 'Team 1 name is required.'),
  team2: z.string().min(1, 'Team 2 name is required.'),
  matchData: z.string().min(10, 'Please provide some match data (e.g., player stats, recent form).'),
});

type PredictionFormValues = z.infer<typeof predictionSchema>;

interface PredictionToolProps {
  sport: string;
}

export function PredictionTool({ sport }: PredictionToolProps) {
  const [prediction, setPrediction] = useState<PredictMatchOutcomeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      team1: '',
      team2: '',
      matchData: '',
    },
  });

  const onSubmit = async (data: PredictionFormValues) => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await handlePrediction({ ...data, sport });
      setPrediction(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'Could not get a prediction from the AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI Match Predictor</CardTitle>
        <CardDescription>Enter match details to predict the outcome.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="team1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team 1</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Red Dragons" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team 2</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blue Eagles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matchData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Data</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Include historical performance, player stats, recent form, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                'Predict Outcome'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {prediction && (
        <CardFooter className="flex-col items-start gap-4">
            <h3 className="font-headline text-xl">Prediction Result</h3>
            <div className="w-full space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">{form.getValues('team1')}</span>
                        <span className="text-primary font-bold">{Math.round(prediction.team1WinProbability * 100)}%</span>
                    </div>
                    <Progress value={prediction.team1WinProbability * 100} className="h-3" />
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">{form.getValues('team2')}</span>
                        <span className="text-accent font-bold">{Math.round(prediction.team2WinProbability * 100)}%</span>
                    </div>
                    <Progress value={prediction.team2WinProbability * 100} className="h-3 [&>div]:bg-accent" />
                </div>
            </div>
          <div className="space-y-1">
            <h4 className="font-semibold">Explanation</h4>
            <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
