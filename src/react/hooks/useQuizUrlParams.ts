import { useMemo } from 'react';
import { z } from 'zod';
import type { QuestionFilter } from '../../core/types/session';

export const QuizUrlParamsSchema = z.object({
  courses: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      // Parses "1-5" or "1,2,3" or "1"
      if (val.includes('-')) {
        const [start, end] = val.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
      }
      return val
        .split(',')
        .map((n) => Number(n.trim()))
        .filter((n) => !isNaN(n));
    }),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced', 'any'])
    .optional()
    .default('any'),
  topics: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((t) => t.trim()) : undefined)),
  chapters: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((t) => t.trim()) : undefined)),
  order: z
    .enum(['sequential', 'random'])
    .optional()
    .default('sequential'),
  notation: z
    .enum(['letters', 'solfege', 'any'])
    .optional()
    .default('any'),
  embed: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  compact: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  lang: z.string().optional().default('en'),
});

export type ParsedQuizUrlParams = z.infer<typeof QuizUrlParamsSchema>;

/**
 * Pure parser for URL search params or plain record.
 */
export function parseQuizUrlParams(
  input: URLSearchParams | Record<string, string | string[] | undefined> | undefined
): ParsedQuizUrlParams {
  if (!input) {
    return QuizUrlParamsSchema.parse({});
  }

  const raw: Record<string, unknown> = {};

  if (input instanceof URLSearchParams) {
    input.forEach((value, key) => {
      raw[key] = value;
    });
  } else {
    for (const [key, value] of Object.entries(input)) {
      if (Array.isArray(value)) {
        raw[key] = value[0];
      } else if (value !== undefined) {
        raw[key] = value;
      }
    }
  }

  const safeResult = QuizUrlParamsSchema.safeParse(raw);
  if (safeResult.success) {
    return safeResult.data;
  }

  // Fallback defaults on invalid values
  return QuizUrlParamsSchema.parse({});
}

/**
 * Converts parsed URL params into a domain QuestionFilter.
 */
export function urlParamsToFilter(params: ParsedQuizUrlParams): QuestionFilter {
  return {
    courses: params.courses,
    difficulties:
      params.difficulty && params.difficulty !== 'any'
        ? [params.difficulty]
        : undefined,
    topics: params.topics,
    chapters: params.chapters,
    notation: params.notation,
    order: params.order,
  };
}

/**
 * React hook to parse search parameters from window.location or passed searchParams.
 */
export function useQuizUrlParams(
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>
) {
  return useMemo(() => {
    let paramsToUse = searchParams;
    if (!paramsToUse && typeof window !== 'undefined') {
      paramsToUse = new URLSearchParams(window.location.search);
    }
    const parsed = parseQuizUrlParams(paramsToUse);
    const filter = urlParamsToFilter(parsed);
    return {
      params: parsed,
      filter,
    };
  }, [searchParams]);
}
