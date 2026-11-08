import React from 'react';
import type { Question } from '../types/schema';

export interface EvaluationResult {
  isCorrect: boolean;
  falsePositives?: string[];
  falseNegatives?: string[];
  details?: unknown;
}

export interface QuestionTypeComponentProps<TAnswer = unknown> {
  question: Question;
  selectedAnswer: TAnswer;
  onSelectAnswer: (answer: TAnswer) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  evaluated?: boolean;
  lang?: string;
  compact?: boolean;
  evaluation?: EvaluationResult | null;
}

export type QuestionTypeComponent<TAnswer = unknown> = React.ComponentType<
  QuestionTypeComponentProps<TAnswer>
>;

export type QuestionEvaluatorFn<TAnswer = unknown> = (
  question: Question,
  userAnswer: TAnswer
) => EvaluationResult;

export interface QuestionTypeDefinition<TAnswer = unknown> {
  type: string;
  evaluator?: QuestionEvaluatorFn<TAnswer>;
  component?: QuestionTypeComponent<TAnswer>;
}

export class QuestionTypeRegistry {
  private definitions = new Map<string, QuestionTypeDefinition<any>>();

  register<T = unknown>(def: QuestionTypeDefinition<T>): void {
    this.definitions.set(def.type, def);
  }

  get<T = unknown>(type: string): QuestionTypeDefinition<T> | undefined {
    return this.definitions.get(type);
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  unregister(type: string): void {
    this.definitions.delete(type);
  }

  clear(): void {
    this.definitions.clear();
  }
}

export const questionTypeRegistry = new QuestionTypeRegistry();
