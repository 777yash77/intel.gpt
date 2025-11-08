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

const legalAIChatbotPrompt = `You are an expert legal AI assistant named Intel.gpt. Your goal is to provide clear, precise, and actionable legal intelligence.
- Answer the user's query directly and comprehensively.
- **You must format your response using Markdown.** Use headings (e.g., #, ##), bold text, and lists to structure your answer for clarity.
- When relevant, you must provide context on past cases, legal history, and landmark decisions to give a complete picture.

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
        text: legalAIChatbotPrompt,
      },
      input: input,
    });

    for await (const chunk of stream) {
        yield chunk.text;
    }
  }
);
