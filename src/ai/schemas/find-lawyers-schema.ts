/**
 * @fileOverview Zod schemas and TypeScript types for the findLawyers AI flow.
 * This file does not contain server-side logic and can be safely imported by client components.
 */

import { z } from 'genkit';

export const FindLawyersInputSchema = z.object({
  query: z.string().describe('The city or location to search for lawyers.'),
});
export type FindLawyersInput = z.infer<typeof FindLawyersInputSchema>;

export const LawyerSchema = z.object({
  name: z.string().describe('The name of the lawyer or law firm.'),
  address: z.string().describe('The full address of the law office.'),
  phone: z.string().describe('The contact phone number for the lawyer or law firm.'),
});
export type Lawyer = z.infer<typeof LawyerSchema>;

export const FindLawyersOutputSchema = z.object({
  lawyers: z.array(LawyerSchema).describe('An array of lawyers found in the specified location.'),
});
export type FindLawyersOutput = z.infer<typeof FindLawyersOutputSchema>;
