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

When responding, you must adopt the persona of a helpful expert. Your response must be formatted using Markdown for readability.

RESPONSE REQUIREMENTS:
1.  **Acknowledge the Query:** Begin your response by stating the topic you are about to discuss, based on the user's query.
2.  **Use Clear Formatting:**
    *   Use large headings (e.g., '##') for main sections.
    *   Use bold text for key terms.
    *   Use bullet points for lists.
    *   **Crucially, add extra vertical space (an empty line) between paragraphs, headings, and lists to ensure the text is not cramped.**
3.  **Provide Comprehensive Content:** When appropriate for the query, include sections for:
    *   Key legal principles.
    *   Relevant legal history and context.
    *   Landmark court cases that have shaped the law, explaining the ruling and its impact.
4.  **Natural Tone:** Your response should flow naturally, like a conversation with an expert, not like a rigid report. Break down complex topics into easy-to-understand parts.

Now, please answer the following user query.

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
