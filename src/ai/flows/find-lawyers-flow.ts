/**
 * @fileOverview Defines the Genkit flow and prompt for finding lawyers.
 * This file does NOT use "use server" and contains the core AI logic.
 */

import { ai } from '@/ai/genkit';
import {
  FindLawyersInputSchema,
  FindLawyersOutputSchema,
} from '@/ai/schemas/find-lawyers-schema';

export const findLawyersPrompt = ai.definePrompt({
  name: 'findLawyersPrompt',
  input: { schema: FindLawyersInputSchema },
  output: { schema: FindLawyersOutputSchema },
  model: 'gemini-1.5-flash-latest',
  prompt: `You are an expert in local business directory services. Your task is to find a list of lawyers or law firms in a given location.

  Given the location: {{query}}

  Please provide a list of 5 lawyers or law firms. For each one, provide the name, a plausible but fake address in the specified city, and a plausible but fake phone number.

  Respond ONLY with the JSON object as defined in the output schema.`,
});

export const findLawyersFlow = ai.defineFlow(
  {
    name: 'findLawyersFlow',
    inputSchema: FindLawyersInputSchema,
    outputSchema: FindLawyersOutputSchema,
  },
  async (input) => {
    const { output } = await findLawyersPrompt(input);
    if (!output) {
      return { lawyers: [] };
    }
    return output;
  }
);
