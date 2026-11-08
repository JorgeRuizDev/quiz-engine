import type { Question } from '../types/schema';
import type { QuestionFilter } from '../types/session';

/**
 * Checks whether a single question matches the provided QuestionFilter criteria.
 */
export function matchesFilter(question: Question, filter?: QuestionFilter): boolean {
  if (!filter) return true;

  // 1. Courses filter
  if (filter.courses && filter.courses.length > 0) {
    if (!filter.courses.includes(question.course)) {
      return false;
    }
  }

  // 2. Difficulties filter
  if (filter.difficulties && filter.difficulties.length > 0) {
    if (!filter.difficulties.includes(question.difficulty)) {
      return false;
    }
  }

  // 3. Topics intersection filter
  if (filter.topics && filter.topics.length > 0) {
    const hasTopic = filter.topics.some((t) => question.topics.includes(t));
    if (!hasTopic) {
      return false;
    }
  }

  // 4. Chapters / Weeks filter
  if (filter.chapters && filter.chapters.length > 0) {
    const matchesChapter = filter.chapters.some((ch) => {
      const raw = ch.toLowerCase().trim();
      const numPart = raw.replace(/^(ch|chapter|week|w)/, '').padStart(2, '0');
      return (
        question.id.toLowerCase().includes(`-w${numPart}-`) ||
        question.id.toLowerCase().startsWith(`w${numPart}-`)
      );
    });
    if (!matchesChapter) {
      return false;
    }
  }

  // 5. Notation filter (with neutral and dual fallbacks)
  if (filter.notation && filter.notation !== 'any') {
    if (
      question.notation !== 'neutral' &&
      question.notation !== 'dual' &&
      question.notation !== filter.notation
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Filters an array of candidate questions against the given QuestionFilter.
 */
export function filterQuestions(questions: Question[], filter?: QuestionFilter): Question[] {
  if (!filter) return questions;
  return questions.filter((q) => matchesFilter(q, filter));
}
