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

const legalAIChatbotPrompt = `You are Intel.gpt, an expert legal AI assistant. Your purpose is to provide comprehensive, clear, and actionable legal intelligence. You must answer the user's query in a structured and detailed manner.

**CRITICAL INSTRUCTIONS:**
1.  **Format your entire response using Markdown.**
2.  Use large headings (e.g., '## Key Legal Principles') to structure your answer.
3.  Use lists (bulleted or numbered) and bold text to make the information easy to digest.
4.  Provide significant detail, including historical context and relevant case law.
5.  **Do not be conversational.** Be direct and informative. Your response should be structured like a legal brief or analysis.

**RESPONSE STRUCTURE:**

## Analysis of: [Re-state the user's query topic here]

### Key Legal Principles
- **Principle 1:** Detailed explanation.
- **Principle 2:** Detailed explanation.
- ... (and so on)

### Actionable Intelligence
- **Consideration 1:** Practical advice or steps to take.
- **Consideration 2:** Things to be aware of or document.
- ... (and so on)

### Relevant Legal History
(Provide a paragraph summarizing the evolution of the legal concepts involved. Then list up to 10 key historical points.)
- **Historical Point 1:** ...
- **Historical Point 2:** ...
- ...

### Landmark Cases
(Provide up to 4 significant court cases with summaries of the ruling and impact. Ensure there is space between each case.)

- **[Case Name 1] ([Year]):** Summary of the case, the court's ruling, and its impact on the law.

- **[Case Name 2] ([Year]):** Summary of the case, the court's ruling, and its impact on the law.

---
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
