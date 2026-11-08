import { describe, it, expect, beforeEach } from 'vitest';
import {
  questionTypeRegistry,
  evaluateAnswer,
  type Question,
} from '../../src';

describe('QuestionTypeRegistry & Extensible Evaluation', () => {
  beforeEach(() => {
    questionTypeRegistry.clear();
  });

  it('evaluates built-in single-choice and multiple-choice questions by default', () => {
    const singleChoiceQ: Question = {
      id: 'q-single-1',
      type: 'single-choice',
      course: 1,
      difficulty: 'beginner',
      topics: ['notes'],
      notation: 'letters',
      prompt: { en: 'Pick A' },
      options: [
        { id: 'opt-a', label: { en: 'A' } },
        { id: 'opt-b', label: { en: 'B' } },
      ],
      correctAnswer: ['opt-a'],
      remediation: { explanation: { en: 'A is correct' } },
    };

    const resCorrect = evaluateAnswer(singleChoiceQ, ['opt-a']);
    expect(resCorrect.isCorrect).toBe(true);
    expect(resCorrect.falsePositives).toEqual([]);
    expect(resCorrect.falseNegatives).toEqual([]);

    const resIncorrect = evaluateAnswer(singleChoiceQ, ['opt-b']);
    expect(resIncorrect.isCorrect).toBe(false);
    expect(resIncorrect.falsePositives).toEqual(['opt-b']);
    expect(resIncorrect.falseNegatives).toEqual(['opt-a']);
  });

  it('allows registering a new question type (e.g. match-pairs or order-sequence) with custom evaluation', () => {
    // Register custom 'order-sequence' question type
    questionTypeRegistry.register({
      type: 'order-sequence',
      evaluator: (q, answer: string[]) => {
        const expected = q.correctAnswer as string[];
        const isCorrect =
          Array.isArray(answer) &&
          answer.length === expected.length &&
          answer.every((val, idx) => val === expected[idx]);
        return {
          isCorrect,
          details: { expected, received: answer },
        };
      },
    });

    const orderingQ: Question = {
      id: 'q-order-1',
      type: 'order-sequence',
      course: 1,
      difficulty: 'intermediate',
      topics: ['scales'],
      notation: 'neutral',
      prompt: { en: 'Order the notes from C' },
      options: [],
      correctAnswer: ['C', 'D', 'E', 'F', 'G'],
      remediation: { explanation: { en: 'C major scale order' } },
    };

    // Correct sequence
    const result1 = evaluateAnswer(orderingQ, ['C', 'D', 'E', 'F', 'G']);
    expect(result1.isCorrect).toBe(true);

    // Wrong sequence
    const result2 = evaluateAnswer(orderingQ, ['C', 'E', 'D', 'F', 'G']);
    expect(result2.isCorrect).toBe(false);
  });

  it('allows registering and checking question components', () => {
    const DummyComponent = () => null;
    questionTypeRegistry.register({
      type: 'flashcard',
      component: DummyComponent,
    });

    expect(questionTypeRegistry.has('flashcard')).toBe(true);
    expect(questionTypeRegistry.get('flashcard')?.component).toBe(DummyComponent);
  });
});
