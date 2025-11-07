'use server';

/**
 * @fileOverview Summarizes a legal article or case document, providing key points, relevant history, and links to related online resources.
 *
 * - summarizeLegalArticle - A function that handles the summarization process.
 * - SummarizeLegalArticleInput - The input type for the summarizeLegalArticle function.
 * - SummarizeLegalArticleOutput - The return type for the summarizeLegalArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalArticleInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal article or case document.'),
});
export type SummarizeLegalArticleInput = z.infer<typeof SummarizeLegalArticleInputSchema>;

const SummarizeLegalArticleOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the legal article.'),
  history: z.string().describe('Relevant historical context of the article.'),
  relatedResources: z
    .string()
    .describe('Links to related online resources and studies.'),
});
export type SummarizeLegalArticleOutput = z.infer<typeof SummarizeLegalArticleOutputSchema>;

export async function summarizeLegalArticle(input: SummarizeLegalArticleInput): Promise<SummarizeLegalArticleOutput> {
  return summarizeLegalArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLegalArticlePrompt',
  input: {schema: SummarizeLegalArticleInputSchema},
  output: {schema: SummarizeLegalArticleOutputSchema},
  prompt: `You are an AI legal assistant tasked with summarizing legal articles and court case documents.  Provide a concise summary of the document's key points, relevant historical context, and links to related online resources.

Document Text:
{{{documentText}}}`,
});

const summarizeLegalArticleFlow = ai.defineFlow(
  {
    name: 'summarizeLegalArticleFlow',
    inputSchema: SummarizeLegalArticleInputSchema,
    outputSchema: SummarizeLegalArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
