'use server';

/**
 * @fileOverview An AI agent for predicting match outcomes.
 *
 * - predictMatchOutcome - A function that predicts the outcome of a match.
 * - PredictMatchOutcomeInput - The input type for the predictMatchOutcome function.
 * - PredictMatchOutcomeOutput - The return type for the predictMatchOutcome function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictMatchOutcomeInputSchema = z.object({
  team1: z.string().describe('The name of the first team.'),
  team2: z.string().describe('The name of the second team.'),
  sport: z.string().describe('The sport being played.'),
  matchData: z.string().describe('Real-time data and historical performance of both teams.'),
});
export type PredictMatchOutcomeInput = z.infer<typeof PredictMatchOutcomeInputSchema>;

const PredictMatchOutcomeOutputSchema = z.object({
  team1WinProbability: z.number().describe('The probability of the first team winning (0-1).'),
  team2WinProbability: z.number().describe('The probability of the second team winning (0-1).'),
  explanation: z.string().describe('A brief explanation of why the model predicts this outcome.'),
});
export type PredictMatchOutcomeOutput = z.infer<typeof PredictMatchOutcomeOutputSchema>;

export async function predictMatchOutcome(input: PredictMatchOutcomeInput): Promise<PredictMatchOutcomeOutput> {
  return predictMatchOutcomeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMatchOutcomePrompt',
  input: {schema: PredictMatchOutcomeInputSchema},
  output: {schema: PredictMatchOutcomeOutputSchema},
  prompt: `You are an AI expert at predicting the outcomes of sports matches.

  Based on the provided data, predict the probability of each team winning the match.
  Provide a brief explanation for your prediction.

  Sport: {{{sport}}}
  Team 1: {{{team1}}}
  Team 2: {{{team2}}}
  Match Data: {{{matchData}}}

  Format your response as a JSON object with 'team1WinProbability', 'team2WinProbability', and 'explanation' fields.
  The probabilities should be between 0 and 1.
  `,
});

const predictMatchOutcomeFlow = ai.defineFlow(
  {
    name: 'predictMatchOutcomeFlow',
    inputSchema: PredictMatchOutcomeInputSchema,
    outputSchema: PredictMatchOutcomeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
