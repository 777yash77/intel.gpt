'use server';

/**
 * @fileOverview This file defines a Genkit flow for interacting with a legal AI chatbot.
 *
 * The flow takes a user query as input and streams back a legal insight.
 * It uses a prompt to generate the legal insight based on the user query.
 *
 * @interface LegalAIChatbotInput - Represents the input schema for the legal AI chatbot.
 * @function streamLegalAIChatbot - A function that calls the legal AI chatbot flow and returns a stream.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalAIChatbotInputSchema = z.object({
  query: z.string().describe('The user query for legal information.'),
});
export type LegalAIChatbotInput = z.infer<typeof LegalAIChatbotInputSchema>;

// No output schema is needed for streaming text
export async function streamLegalAIChatbot(input: LegalAIChatbotInput) {
  const stream = await legalAIChatbotFlow({
    query: input.query,
  });

  return stream;
}

const legalAIChatbotPrompt = `You are a legal AI assistant named Intel.gpt. Your goal is to provide clear, precise, and actionable legal intelligence.
- Answer the user's query directly.
- Format your response using Markdown (headings, bold, lists) for clarity.
- When relevant, provide context on past cases or legal history.

USER QUERY:
{{{query}}}`;

const legalAIChatbotFlow = ai.defineFlow(
  {
    name: 'legalAIChatbotFlow',
    inputSchema: LegalAIChatbotInputSchema,
  },
  async function* (input) {
    const {stream} = ai.generateStream({
      prompt: {
        text: legalAIChatbotPrompt
      },
      input: input,
    });

    for await (const chunk of stream) {
        yield chunk.text;
    }
  }
);
