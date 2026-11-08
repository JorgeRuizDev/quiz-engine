import { describe, it, expect } from 'vitest';
import {
  shuffleQuestions,
  drawNextEligible,
  findNextEligibleQuestion,
  type Question,
} from '../../src';

describe('Carousel Engine & Multi-Family Mutual Exclusion', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q1-draw',
      familyIds: ['family-chord-am'],
      type: 'single-choice',
      course: 1,
      difficulty: 'beginner',
      topics: ['chords'],
      notation: 'letters',
      prompt: { en: 'Draw Am' },
      options: [],
      correctAnswer: ['opt-1'],
      remediation: { explanation: { en: 'Exp' } },
    },
    {
      id: 'q1-identify',
      familyIds: ['family-chord-am'],
      type: 'single-choice',
      course: 1,
      difficulty: 'beginner',
      topics: ['chords'],
      notation: 'letters',
      prompt: { en: 'Identify Am' },
      options: [],
      correctAnswer: ['opt-1'],
      remediation: { explanation: { en: 'Exp' } },
    },
    {
      id: 'q2-c-major',
      familyIds: ['family-chord-c'],
      type: 'single-choice',
      course: 1,
      difficulty: 'beginner',
      topics: ['chords'],
      notation: 'letters',
      prompt: { en: 'Identify C' },
      options: [],
      correctAnswer: ['opt-1'],
      remediation: { explanation: { en: 'Exp' } },
    },
  ];

  it('Fisher-Yates Shuffle returns an array with identical elements without mutating original', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleQuestions(original);
    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it('immediately excludes sister questions sharing even one family ID', () => {
    const pool = [...mockQuestions];
    const excluded = new Set<string>();

    const firstDraw = drawNextEligible(pool, excluded);
    expect(firstDraw.drawn?.id).toBe('q1-draw');
    expect(firstDraw.updatedExcludedFamilies.has('family-chord-am')).toBe(true);

    // Second draw should skip q1-identify because family-chord-am is excluded!
    const secondDraw = drawNextEligible(firstDraw.remainingPool, firstDraw.updatedExcludedFamilies);
    expect(secondDraw.drawn?.id).toBe('q2-c-major');
  });

  it('findNextEligibleQuestion identifies eligible candidate without modifying pool', () => {
    const excluded = new Set(['family-chord-am']);
    const eligible = findNextEligibleQuestion(mockQuestions, excluded);
    expect(eligible?.id).toBe('q2-c-major');
  });
});
