import type { Question } from '../types/schema';
import { questionTypeRegistry, type EvaluationResult } from '../registry/questionTypeRegistry';
import { evaluateMatchingAnswer, type MatchingEvaluationResult } from './evaluation';

export { evaluateMatchingAnswer, type MatchingEvaluationResult };
export type { EvaluationResult };

/**
 * Pure evaluator for question answers.
 * Supports extensible question types via questionTypeRegistry,
 * with standard all-or-nothing grading for single-choice and multiple-choice,
 * and built-in matching question support.
 */
export function evaluateAnswer(
  question: Question,
  userAnswer: unknown
): EvaluationResult {
  const customDef = questionTypeRegistry.get(question.type);
  if (customDef && customDef.evaluator) {
    return customDef.evaluator(question, userAnswer);
  }

  // Built-in matching evaluation
  if (question.type === 'matching') {
    const submitted = Array.isArray(userAnswer)
      ? (userAnswer as string[])
      : typeof userAnswer === 'string'
      ? [userAnswer]
      : [];
    const expected = Array.isArray(question.correctAnswer)
      ? (question.correctAnswer as string[])
      : typeof question.correctAnswer === 'string'
      ? [question.correctAnswer]
      : [];

    const matchingScore = evaluateMatchingAnswer(submitted, expected);
    const expectedSet = new Set(expected);
    const actualSet = new Set(submitted);

    const falsePositives = submitted.filter((id) => !expectedSet.has(id));
    const falseNegatives = expected.filter((id) => !actualSet.has(id));

    return {
      isCorrect: matchingScore.isCorrect,
      falsePositives,
      falseNegatives,
      details: matchingScore,
    };
  }

  // Standard choice evaluation
  const selectedIds = Array.isArray(userAnswer)
    ? (userAnswer as string[])
    : typeof userAnswer === 'string'
    ? [userAnswer]
    : [];

  const expectedArray = Array.isArray(question.correctAnswer)
    ? (question.correctAnswer as string[])
    : typeof question.correctAnswer === 'string'
    ? [question.correctAnswer]
    : [];

  const expectedSet = new Set(expectedArray);
  const actualSet = new Set(selectedIds);

  const falsePositives = selectedIds.filter((id) => !expectedSet.has(id));
  const falseNegatives = expectedArray.filter((id) => !actualSet.has(id));

  const isCorrect = falsePositives.length === 0 && falseNegatives.length === 0;

  return {
    isCorrect,
    falsePositives,
    falseNegatives,
  };
}
