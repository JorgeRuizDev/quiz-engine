import { describe, it, expect } from 'vitest';
import { evaluateAnswer, type Question } from '../../src';

describe('Answer Evaluator (Pure Function)', () => {
  const dummySingleChoice: Question = {
    id: 'single-1',
    type: 'single-choice',
    course: 1,
    difficulty: 'beginner',
    topics: ['notes'],
    notation: 'letters',
    prompt: { en: 'Which note is this?', es: '¿Qué nota es esta?' },
    options: [
      { id: 'opt-a', label: { en: 'A', es: 'La' } },
      { id: 'opt-b', label: { en: 'B', es: 'Si' } },
      { id: 'opt-c', label: { en: 'C', es: 'Do' } },
    ],
    correctAnswer: ['opt-a'],
    remediation: {
      explanation: { en: 'It is A', es: 'Es La' },
    },
  };

  const dummyMultiChoice: Question = {
    id: 'multi-1',
    type: 'multiple-choice',
    course: 1,
    difficulty: 'intermediate',
    topics: ['accidentals'],
    notation: 'letters',
    prompt: { en: 'Select all natural notes', es: 'Selecciona todas las notas naturales' },
    options: [
      { id: 'opt-c', label: { en: 'C', es: 'Do' } },
      { id: 'opt-d', label: { en: 'D', es: 'Re' } },
      { id: 'opt-fsharp', label: { en: 'F#', es: 'Fa#' } },
    ],
    correctAnswer: ['opt-c', 'opt-d'],
    remediation: {
      explanation: { en: 'C and D are natural notes', es: 'Do y Re son notas naturales' },
    },
  };

  it('evaluates correct answer as isCorrect: true with no false positives or negatives', () => {
    const result = evaluateAnswer(dummySingleChoice, ['opt-a']);
    expect(result.isCorrect).toBe(true);
    expect(result.falsePositives).toEqual([]);
    expect(result.falseNegatives).toEqual([]);
  });

  it('evaluates incorrect answer with falsePositive and falseNegative diagnostics', () => {
    const result = evaluateAnswer(dummySingleChoice, ['opt-b']);
    expect(result.isCorrect).toBe(false);
    expect(result.falsePositives).toEqual(['opt-b']);
    expect(result.falseNegatives).toEqual(['opt-a']);
  });

  it('evaluates fully matching selection as isCorrect: true for multiple-choice', () => {
    const result = evaluateAnswer(dummyMultiChoice, ['opt-c', 'opt-d']);
    expect(result.isCorrect).toBe(true);
    expect(result.falsePositives).toEqual([]);
    expect(result.falseNegatives).toEqual([]);
  });

  it('evaluates selection with an extra wrong item as incorrect (false positive)', () => {
    const result = evaluateAnswer(dummyMultiChoice, ['opt-c', 'opt-d', 'opt-fsharp']);
    expect(result.isCorrect).toBe(false);
    expect(result.falsePositives).toEqual(['opt-fsharp']);
    expect(result.falseNegatives).toEqual([]);
  });
});
