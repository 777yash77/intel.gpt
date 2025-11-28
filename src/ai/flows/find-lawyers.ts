'use server';
/**
 * @fileOverview Finds lawyers in a given location using an AI tool.
 *
 * - findLawyers - A function that calls the flow to find lawyers.
 * - FindLawyersInput - The input type for the findLawyers function.
 * - FindLawyersOutput - The output type for the findLawyers function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const FindLawyersInputSchema = z.object({
  query: z.string().describe('The city or location to search for lawyers.'),
});
export type FindLawyersInput = z.infer<typeof FindLawyersInputSchema>;

const LawyerSchema = z.object({
  name: z.string().describe("The name of the lawyer or law firm."),
  address: z.string().describe("The full address of the law office."),
  phone: z.string().describe("The contact phone number for the lawyer or law firm.")
});
export type Lawyer = z.infer<typeof LawyerSchema>;

const FindLawyersOutputSchema = z.object({
  lawyers: z.array(LawyerSchema).describe("An array of lawyers found in the specified location."),
});
export type FindLawyersOutput = z.infer<typeof FindLawyersOutputSchema>;

const findLawyersPrompt = ai.definePrompt({
  name: 'findLawyersPrompt',
  input: { schema: FindLawyersInputSchema },
  output: { schema: FindLawyersOutputSchema },
  model: 'gemini-1.5-flash-latest',
  prompt: `You are an expert in local business directory services. Your task is to find a list of lawyers or law firms in a given location.

  Given the location: {{query}}

  Please provide a list of 5 lawyers or law firms. For each one, provide the name, a plausible but fake address in the specified city, and a plausible but fake phone number.

  Respond ONLY with the JSON object as defined in the output schema.`,
});


const findLawyersFlow = ai.defineFlow(
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

export async function findLawyers(
  input: FindLawyersInput
): Promise<FindLawyersOutput> {
  return findLawyersFlow(input);
}
