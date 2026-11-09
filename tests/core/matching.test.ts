import { describe, expect, test } from 'bun:test';
import { QuestionSchema } from '../../src/core/types/schema';
import { evaluateMatchingAnswer } from '../../src/core/engine/evaluation';
import { evaluateAnswer } from '../../src/core/engine/evaluator';

describe('Matching Question - Schema & Evaluator', () => {
  const sampleMatchingQuestion = {
    id: 'match-q1',
    type: 'matching',
    course: 1,
    difficulty: 'beginner' as const,
    topics: ['architecture'],
    prompt: {
      en: 'Match the component to its description',
      es: 'Empareja el componente con su descripción',
    },
    matchingData: {
      leftItems: [
        { id: 'left-1', label: { en: 'L1', es: 'L1' } },
        { id: 'left-2', label: { en: 'L2', es: 'L2' } },
      ],
      rightItems: [
        { id: 'right-1', label: { en: 'R1', es: 'R1' } },
        { id: 'right-2', label: { en: 'R2', es: 'R2' } },
      ],
    },
    correctAnswer: ['left-1:right-1', 'left-2:right-2'],
    remediation: {
      explanation: { en: 'L1 matches R1 and L2 matches R2', es: 'L1 empareja con R1 y L2 con R2' },
    },
  };

  test('valid matching question passes schema validation', () => {
    const parsed = QuestionSchema.parse(sampleMatchingQuestion);
    expect(parsed.id).toBe('match-q1');
    expect(parsed.type).toBe('matching');
    expect(parsed.matchingData?.leftItems.length).toBe(2);
    expect(parsed.matchingData?.rightItems.length).toBe(2);
  });

  test('evaluateMatchingAnswer returns full score for all correct pairs', () => {
    const result = evaluateMatchingAnswer(
      ['left-1:right-1', 'left-2:right-2'],
      ['left-1:right-1', 'left-2:right-2']
    );
    expect(result.isCorrect).toBe(true);
    expect(result.matchedCount).toBe(2);
    expect(result.totalPairs).toBe(2);
  });

  test('evaluateMatchingAnswer returns false for incomplete or wrong pairs', () => {
    const result = evaluateMatchingAnswer(
      ['left-1:right-2'],
      ['left-1:right-1', 'left-2:right-2']
    );
    expect(result.isCorrect).toBe(false);
    expect(result.matchedCount).toBe(0);
  });

  test('evaluateAnswer integrates matching evaluation correctly', () => {
    const question = QuestionSchema.parse(sampleMatchingQuestion);
    const correctRes = evaluateAnswer(question, ['left-1:right-1', 'left-2:right-2']);
    expect(correctRes.isCorrect).toBe(true);
    expect(correctRes.falsePositives?.length).toBe(0);

    const wrongRes = evaluateAnswer(question, ['left-1:right-2']);
    expect(wrongRes.isCorrect).toBe(false);
    expect(wrongRes.falsePositives).toContain('left-1:right-2');
    expect(wrongRes.falseNegatives).toContain('left-1:right-1');
  });
});
