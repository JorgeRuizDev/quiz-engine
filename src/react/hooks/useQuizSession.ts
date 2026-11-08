import { useReducer, useEffect, useCallback, useMemo } from 'react';
import type { Question } from '../../core/types/schema';
import type {
  QuizSessionState,
  QuestionFilter,
  QuizSessionAction,
  PersistedQuizMetrics,
} from '../../core/types/session';
import { filterQuestions } from '../../core/engine/filter';
import { shuffleQuestions, drawNextEligible } from '../../core/engine/carousel';
import { evaluateAnswer, type EvaluationResult } from '../../core/engine/evaluator';
import {
  type StorageAdapter,
  defaultStorageAdapter,
} from '../../core/storage/storageAdapter';

export const DEFAULT_QUIZ_STORAGE_KEY = 'quiz_engine_metrics';

export interface ExtendedSessionState extends QuizSessionState {
  evaluation: EvaluationResult | null;
  servedQuestionIds: Set<string>;
}

export function calculateQuizAccuracy(hits: number, misses: number): number {
  const total = hits + misses;
  return total > 0 ? Math.round((hits / total) * 100) : 100;
}

export function loadPersistedMetrics(
  storageAdapter: StorageAdapter = defaultStorageAdapter,
  storageKey: string = DEFAULT_QUIZ_STORAGE_KEY
): PersistedQuizMetrics {
  try {
    const raw = storageAdapter.getItem(storageKey);
    if (!raw) {
      return {
        ownerId: null,
        bestStreak: 0,
        totalAnswered: 0,
        totalHits: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
    return JSON.parse(raw) as PersistedQuizMetrics;
  } catch {
    return {
      ownerId: null,
      bestStreak: 0,
      totalAnswered: 0,
      totalHits: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function saveMetrics(
  hitsDelta: number,
  missesDelta: number,
  currentBestStreak: number,
  storageAdapter: StorageAdapter = defaultStorageAdapter,
  storageKey: string = DEFAULT_QUIZ_STORAGE_KEY
): void {
  try {
    const existing = loadPersistedMetrics(storageAdapter, storageKey);
    const updated: PersistedQuizMetrics = {
      ownerId: null,
      bestStreak: Math.max(existing.bestStreak, currentBestStreak),
      totalAnswered: existing.totalAnswered + hitsDelta + missesDelta,
      totalHits: existing.totalHits + hitsDelta,
      lastUpdated: new Date().toISOString(),
    };
    storageAdapter.setItem(storageKey, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or environment issues
  }
}

export function createInitialQuizSessionState(
  questions: Question[],
  filter?: QuestionFilter,
  storageAdapter: StorageAdapter = defaultStorageAdapter,
  storageKey: string = DEFAULT_QUIZ_STORAGE_KEY
): ExtendedSessionState {
  const matched = filterQuestions(questions, filter);
  const candidateList = filter?.order === 'random' ? shuffleQuestions(matched) : matched;

  const initialExcluded = new Set<string>();
  const { drawn, remainingPool, updatedExcludedFamilies } = drawNextEligible(
    candidateList,
    initialExcluded
  );

  const persisted = loadPersistedMetrics(storageAdapter, storageKey);
  const servedSet = new Set<string>();
  if (drawn) {
    servedSet.add(drawn.id);
  }

  return {
    filter: filter || {},
    candidatePool: remainingPool,
    missedBuffer: [],
    activeQuestion: drawn,
    excludedFamilyIds: Array.from(updatedExcludedFamilies) as any,
    servedQuestionIds: servedSet,
    selectedOptionIds: [],
    evaluation: null,
    status: drawn ? 'IDLE' : 'SESSION_EXHAUSTED',
    stats: {
      hits: 0,
      misses: 0,
      currentStreak: 0,
      bestStreak: persisted.bestStreak,
      accuracy: 100,
      totalAnswered: 0,
    },
    totalInSession: matched.length,
  };
}

export function quizSessionReducer(
  state: ExtendedSessionState,
  action: QuizSessionAction,
  storageAdapter: StorageAdapter = defaultStorageAdapter,
  storageKey: string = DEFAULT_QUIZ_STORAGE_KEY
): ExtendedSessionState {
  switch (action.type) {
    case 'INIT_SESSION': {
      return createInitialQuizSessionState(
        action.payload.questions,
        action.payload.filter,
        storageAdapter,
        storageKey
      );
    }

    case 'SELECT_OPTION': {
      if (
        state.status === 'EVALUATED_CORRECT' ||
        state.status === 'EVALUATED_INCORRECT' ||
        !state.activeQuestion
      ) {
        return state;
      }

      const { optionId } = action.payload;
      const isMulti = state.activeQuestion.type === 'multiple-choice';

      let newSelected: string[];
      if (isMulti) {
        newSelected = state.selectedOptionIds.includes(optionId)
          ? state.selectedOptionIds.filter((id) => id !== optionId)
          : [...state.selectedOptionIds, optionId];
      } else {
        newSelected = [optionId];
      }

      return {
        ...state,
        selectedOptionIds: newSelected,
        status: 'ANSWERING',
      };
    }

    case 'SUBMIT_ANSWER': {
      if (
        !state.activeQuestion ||
        state.selectedOptionIds.length === 0 ||
        state.status === 'EVALUATED_CORRECT' ||
        state.status === 'EVALUATED_INCORRECT'
      ) {
        return state;
      }

      const evalResult = evaluateAnswer(state.activeQuestion, state.selectedOptionIds);
      const isCorrect = evalResult.isCorrect;

      const newHits = isCorrect ? state.stats.hits + 1 : state.stats.hits;
      const newMisses = isCorrect ? state.stats.misses : state.stats.misses + 1;
      const newCurrentStreak = isCorrect ? state.stats.currentStreak + 1 : 0;
      const newBestStreak = Math.max(state.stats.bestStreak, newCurrentStreak);
      const newAccuracy = calculateQuizAccuracy(newHits, newMisses);

      saveMetrics(
        isCorrect ? 1 : 0,
        isCorrect ? 0 : 1,
        newBestStreak,
        storageAdapter,
        storageKey
      );

      return {
        ...state,
        evaluation: evalResult,
        status: isCorrect ? 'EVALUATED_CORRECT' : 'EVALUATED_INCORRECT',
        stats: {
          ...state.stats,
          hits: newHits,
          misses: newMisses,
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          accuracy: newAccuracy,
          totalAnswered: state.stats.totalAnswered + 1,
        },
      };
    }

    case 'NEXT_QUESTION': {
      const excludedSet = new Set(state.excludedFamilyIds);
      const { drawn, remainingPool, updatedExcludedFamilies } = drawNextEligible(
        state.candidatePool,
        excludedSet
      );

      const nextServed = new Set(state.servedQuestionIds);
      if (drawn) {
        nextServed.add(drawn.id);
      }

      return {
        ...state,
        candidatePool: remainingPool,
        activeQuestion: drawn,
        excludedFamilyIds: Array.from(updatedExcludedFamilies) as any,
        servedQuestionIds: nextServed,
        selectedOptionIds: [],
        evaluation: null,
        status: drawn ? 'IDLE' : 'SESSION_EXHAUSTED',
      };
    }

    case 'RESET_SESSION': {
      const fullPool = [...state.candidatePool];
      if (state.activeQuestion) {
        fullPool.push(state.activeQuestion);
      }
      return quizSessionReducer(
        state,
        {
          type: 'INIT_SESSION',
          payload: { questions: fullPool, filter: state.filter },
        },
        storageAdapter,
        storageKey
      );
    }

    case 'SET_FILTER': {
      return quizSessionReducer(
        state,
        {
          type: 'INIT_SESSION',
          payload: { questions: state.candidatePool, filter: action.payload },
        },
        storageAdapter,
        storageKey
      );
    }

    default:
      return state;
  }
}

export interface UseQuizSessionOptions {
  storageAdapter?: StorageAdapter;
  storageKey?: string;
}

export function useQuizSession(
  questions: Question[],
  filter?: QuestionFilter,
  options?: UseQuizSessionOptions
) {
  const adapter = options?.storageAdapter ?? defaultStorageAdapter;
  const key = options?.storageKey ?? DEFAULT_QUIZ_STORAGE_KEY;

  const initialState = useMemo(() => {
    return createInitialQuizSessionState(questions, filter, adapter, key);
  }, [questions, filter, adapter, key]);

  const [state, dispatch] = useReducer(
    (s: ExtendedSessionState, a: QuizSessionAction) => quizSessionReducer(s, a, adapter, key),
    initialState
  );

  useEffect(() => {
    dispatch({ type: 'INIT_SESSION', payload: { questions, filter } });
  }, [questions, filter]);

  const selectOption = useCallback((optionId: string) => {
    dispatch({ type: 'SELECT_OPTION', payload: { optionId } });
  }, []);

  const submitAnswer = useCallback(() => {
    dispatch({ type: 'SUBMIT_ANSWER' });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  const setFilter = useCallback((newFilter: QuestionFilter) => {
    dispatch({ type: 'SET_FILTER', payload: newFilter });
  }, []);

  return {
    state,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetSession,
    setFilter,
  };
}
