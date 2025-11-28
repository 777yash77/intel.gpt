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
import { findPlaces } from 'genkitx-google-maps';

export const FindLawyersInputSchema = z.object({
  query: z.string().describe('The city or location to search for lawyers.'),
});
export type FindLawyersInput = z.infer<typeof FindLawyersInputSchema>;

export const LawyerSchema = z.object({
  name: z.string().describe("The name of the lawyer or law firm."),
  address: z.string().describe("The full address of the law office."),
  phone: z.string().describe("The contact phone number for the lawyer or law firm.")
});
export type Lawyer = z.infer<typeof LawyerSchema>;

export const FindLawyersOutputSchema = z.object({
  lawyers: z.array(LawyerSchema).describe("An array of lawyers found in the specified location."),
});
export type FindLawyersOutput = z.infer<typeof FindLawyersOutputSchema>;

const findLawyersTool = ai.defineTool(
  {
    name: 'findLawyersTool',
    description: 'Finds lawyers and law firms in a given city or location.',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    // Use a tool that can search for places, like Google Maps.
    // The prompt will guide the AI to use this for finding lawyers.
    return await findPlaces({
      query: `lawyers in ${input.query}`,
    });
  }
);


const findLawyersPrompt = ai.definePrompt({
  name: 'findLawyersPrompt',
  input: { schema: FindLawyersInputSchema },
  output: { schema: FindLawyersOutputSchema },
  tools: [findLawyersTool],
  model: 'gemini-1.5-flash-latest',
  prompt: `Find lawyers in {{query}}. For each lawyer or firm, extract the name, formatted address, and international phone number.`,
});


const findLawyersFlow = ai.defineFlow(
  {
    name: 'findLawyersFlow',
    inputSchema: FindLawyersInputSchema,
    outputSchema: FindLawyersOutputSchema,
  },
  async (input) => {
    const llmResponse = await findLawyersPrompt(input);

    const toolResponse = llmResponse.toolRequest?.output;
    if (!toolResponse) {
      // Handle the case where the tool doesn't run, maybe return empty or throw error
      return { lawyers: [] };
    }

    const lawyers = toolResponse.map((place: any) => ({
      name: place.displayName?.text || 'N/A',
      address: place.formattedAddress || 'N/A',
      phone: place.internationalPhoneNumber || 'N/A',
    }));

    return { lawyers };
  }
);

export async function findLawyers(
  input: FindLawyersInput
): Promise<FindLawyersOutput> {
  return findLawyersFlow(input);
}
