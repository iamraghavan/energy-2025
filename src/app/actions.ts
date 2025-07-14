'use server';

import { predictMatchOutcome, type PredictMatchOutcomeInput, type PredictMatchOutcomeOutput } from '@/ai/flows/predict-match-outcome';

export async function handlePrediction(input: PredictMatchOutcomeInput): Promise<PredictMatchOutcomeOutput> {
  try {
    const result = await predictMatchOutcome(input);
    return result;
  } catch (error) {
    console.error('Prediction failed:', error);
    // In a real app, you might want to throw a more user-friendly error
    throw new Error('Failed to get prediction from AI.');
  }
}
