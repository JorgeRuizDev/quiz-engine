import type { Question, NotationFormat, DifficultyLevel } from './schema';

export type SessionStatus =
  | 'IDLE'
  | 'ANSWERING'
  | 'EVALUATED_CORRECT'
  | 'EVALUATED_INCORRECT'
  | 'SESSION_EXHAUSTED';

export interface SessionStats {
  hits: number;
  misses: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
  totalAnswered: number;
}

export interface QuestionFilter {
  courses?: number[];
  difficulties?: DifficultyLevel[];
  topics?: string[];
  notation?: NotationFormat | 'any';
}

export interface QuizSessionState {
  status: SessionStatus;
  stats: SessionStats;
  activeQuestion: Question | null;
  candidatePool: Question[];
  missedBuffer: Question[];
  selectedOptionIds: string[];
  excludedFamilyIds: string[];
  filter: QuestionFilter;
}

export type QuizSessionAction =
  | { type: 'INIT_SESSION'; payload: { questions: Question[]; filter?: QuestionFilter } }
  | { type: 'SELECT_OPTION'; payload: { optionId: string } }
  | { type: 'TOGGLE_OPTION'; payload: { optionId: string } }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_SESSION' }
  | { type: 'SET_FILTER'; payload: QuestionFilter };

export interface PersistedQuizMetrics {
  ownerId: string | null;
  bestStreak: number;
  totalAnswered: number;
  totalHits: number;
  lastUpdated: string;
}
