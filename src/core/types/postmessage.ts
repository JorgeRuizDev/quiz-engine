/**
 * PostMessage Bridge Event Contracts for Quiz Engine
 * Defines cross-window and webview communication contracts.
 */

export interface QuizAnswerEventPayload {
  questionId: string;
  isCorrect: boolean;
  selectedOptionIds: string[];
  correctAnswerIds: string[];
  sessionStats: {
    hits: number;
    misses: number;
    currentStreak: number;
    bestStreak: number;
    accuracy: number;
  };
}

export interface QuizProgressEventPayload {
  hits: number;
  misses: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
  totalAnswered: number;
}

export interface QuizSessionExhaustedPayload {
  totalAnswered: number;
  finalAccuracy: number;
  peakStreak: number;
}

export type QuizBridgeSource = 'quiz-engine' | 'guitar-companion-quiz' | string;

export type QuizBridgeEvent =
  | {
      source: QuizBridgeSource;
      event: 'QUIZ_ANSWER';
      payload: QuizAnswerEventPayload;
    }
  | {
      source: QuizBridgeSource;
      event: 'QUIZ_PROGRESS';
      payload: QuizProgressEventPayload;
    }
  | {
      source: QuizBridgeSource;
      event: 'QUIZ_EXHAUSTED';
      payload: QuizSessionExhaustedPayload;
    };
