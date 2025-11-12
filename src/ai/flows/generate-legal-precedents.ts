'use server';

/**
 * @fileOverview Generates a list of four unique legal precedents using AI.
 *
 * - generateLegalPrecedents - A function that calls the flow to get new precedents.
 * - GenerateLegalPrecedentsOutput - The output type for the generateLegalPrecedents function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PrecedentSchema = z.object({
  caseName: z.string().describe('The full name of the legal case, including the year. e.g., "Case Name v. Other Party (Year)"'),
  summary: z
    .string()
    .describe('A concise summary of the case, explaining the core conflict and the court\'s decision.'),
  impact: z
    .string()
    .describe('A description of the case\'s long-term impact on the legal landscape or society.'),
});

const GenerateLegalPrecedentsOutputSchema = z.object({
  precedents: z
    .array(PrecedentSchema)
    .length(4)
    .describe('An array of exactly four unique legal precedents.'),
});
export type GenerateLegalPrecedentsOutput = z.infer<
  typeof GenerateLegalPrecedentsOutputSchema
>;

const generatePrecedentsPrompt = ai.definePrompt({
  name: 'generateLegalPrecedentsPrompt',
  output: { schema: GenerateLegalPrecedentsOutputSchema },
  prompt: `You are an AI legal scholar. Generate a list of four interesting and impactful legal precedents from any common law jurisdiction. For each case, provide the case name, a summary of the dispute and ruling, and a description of its impact. Do not include common cases like Marbury v. Madison, Brown v. Board of Education, or Miranda v. Arizona. Focus on cases that are less widely known but still significant.`,
  model: 'googleai/gemini-pro',
});

const generateLegalPrecedentsFlow = ai.defineFlow(
  {
    name: 'generateLegalPrecedentsFlow',
    outputSchema: GenerateLegalPrecedentsOutputSchema,
  },
  async () => {
    const { output } = await generatePrecedentsPrompt();
    return output!;
  }
);

export async function generateLegalPrecedents(): Promise<GenerateLegalPrecedentsOutput> {
  return generateLegalPrecedentsFlow();
}
