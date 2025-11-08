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

export async function streamLegalAIChatbot(input: LegalAIChatbotInput) {
  return legalAIChatbotFlow(input);
}

const legalAIChatbotPrompt = ai.definePrompt({
  name: 'legalAIChatbotPrompt',
  input: { schema: LegalAIChatbotInputSchema },
  prompt: `You are Intel.gpt, a world-class legal AI assistant. Your sole purpose is to provide clear, insightful, and impeccably structured legal analysis in response to a user's query.

You MUST adopt the persona of a helpful expert and strictly adhere to the following formatting and content requirements.

**CRITICAL RESPONSE REQUIREMENTS:**

1.  **Acknowledge the Query:** Your response **MUST** begin by restating the topic of the user's query. For example: "Here is a legal analysis regarding [Your Specific Legal Query Topic]."

2.  **Strict Markdown Formatting:** You **MUST** use Markdown for formatting.
    *   Use large headings (e.g., '##') for main sections.
    *   Use subheadings (e.g., '###') for subsections.
    *   Use **bold text** for key terms and case names.
    *   Use bullet points ('* ') for lists.
    *   **Crucially, you MUST add extra vertical space (an empty line) between all elements, including paragraphs, headings, subheadings, and lists to ensure the text is not cramped.**

3.  **Mandatory Content Structure:** Your response **MUST** be organized into the following sections in this exact order:
    *   **Key Legal Principles:** Explain the core legal elements, definitions, and implications of the topic.
    *   **Actionable Legal Intelligence:** Provide practical advice, steps to consider, or things to be aware of.
    *   **Relevant Legal History and Case Law Context:** Provide a detailed history of the legal concept, followed by an analysis of landmark court cases.

4.  **Tone and Style:** Your response must be comprehensive and authoritative, breaking down complex topics into easy-to-understand parts.

---

Now, please provide a comprehensive and well-structured answer to the following user query.

**USER QUERY:**
{{{query}}}`,
});

const legalAIChatbotFlow = ai.defineFlow(
  {
    name: 'legalAIChatbotFlow',
    inputSchema: LegalAIChatbotInputSchema,
    outputSchema: z.string(),
  },
  async function* (input) {
    const { stream } = await ai.generateStream({
      prompt: legalAIChatbotPrompt,
      input: input,
    });
    
    for await (const chunk of stream) {
      yield chunk.text;
    }
  }
);
