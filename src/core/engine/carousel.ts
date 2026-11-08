import type { Question } from '../types/schema';

/**
 * Pure Fisher-Yates shuffle algorithm.
 * Guarantees uniform random distribution without mutating the original array.
 */
export function shuffleQuestions<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Finds the first question in the pool that does NOT share any familyIds with excludedFamilies.
 */
export function findNextEligibleQuestion(
  pool: readonly Question[],
  excludedFamilies: ReadonlySet<string>
): Question | null {
  for (const question of pool) {
    if (!question.familyIds || question.familyIds.length === 0) {
      return question;
    }
    const hasOverlap = question.familyIds.some((f) => excludedFamilies.has(f));
    if (!hasOverlap) {
      return question;
    }
  }
  return null;
}

/**
 * Draws the next eligible question from candidatePool, excluding any sister questions sharing familyIds.
 * Returns the drawn question, the remaining candidate pool, and the updated excluded families set.
 */
export function drawNextEligible(
  pool: Question[],
  excludedFamilies: Set<string>
): {
  drawn: Question | null;
  remainingPool: Question[];
  updatedExcludedFamilies: Set<string>;
} {
  const index = pool.findIndex((question) => {
    if (!question.familyIds || question.familyIds.length === 0) {
      return true;
    }
    return !question.familyIds.some((f) => excludedFamilies.has(f));
  });

  if (index === -1) {
    return {
      drawn: null,
      remainingPool: [],
      updatedExcludedFamilies: excludedFamilies,
    };
  }

  const drawn = pool[index];
  const remainingPool = [...pool.slice(0, index), ...pool.slice(index + 1)];
  const updatedExcludedFamilies = new Set(excludedFamilies);

  if (drawn.familyIds) {
    for (const familyId of drawn.familyIds) {
      updatedExcludedFamilies.add(familyId);
    }
  }

  return {
    drawn,
    remainingPool,
    updatedExcludedFamilies,
  };
}
