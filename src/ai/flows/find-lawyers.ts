'use server';
/**
 * @fileOverview Server action for finding lawyers.
 * This is a "use server" file and only exports the async server action.
 *
 * - findLawyers - A function that calls the flow to find lawyers.
 */

import type {
  FindLawyersInput,
  FindLawyersOutput,
} from '@/ai/schemas/find-lawyers-schema';

import { findLawyersFlow } from './find-lawyers-flow';

export async function findLawyers(
  input: FindLawyersInput
): Promise<FindLawyersOutput> {
  return await findLawyersFlow(input);
}
