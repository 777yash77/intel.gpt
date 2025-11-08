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

const legalAIChatbotPrompt = `You are Intel.gpt, a world-class legal AI assistant. Your purpose is to provide clear, insightful, and well-structured answers to legal questions.

When responding to a user, adopt the persona of a helpful expert. Your response must be formatted using Markdown for readability. Use headings, subheadings, bullet points, and bold text to organize the information effectively and naturally.

For any given query, your answer should be comprehensive. When appropriate, include sections on:
- Key legal principles involved.
- Relevant legal history and context.
- Landmark court cases that have shaped the law, explaining the ruling and its impact.

Your response should flow naturally, like a conversation with an expert, not like a rigid report. Break down complex topics into easy-to-understand parts.

USER QUERY:
{{{query}}}`;

const legalAIChatbotFlow = ai.defineFlow(
  {
    name: 'legalAIChatbotFlow',
    inputSchema: LegalAIChatbotInputSchema,
  },
  async function* (input) {
    const {stream} = ai.generateStream({
      prompt: legalAIChatbotPrompt,
      input: input,
    });

    for await (const chunk of stream) {
        yield chunk.text;
    }
  }
);
