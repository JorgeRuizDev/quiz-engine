'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Question } from '../../core/types/schema';
import type { QuestionFilter } from '../../core/types/session';
import type { EvaluationResult } from '../../core/engine/evaluator';
import { evaluateAnswer } from '../../core/engine/evaluator';
import { filterQuestions } from '../../core/engine/filter';
import { QuestionView } from './QuestionView';
import { RemediationCard } from './RemediationCard';
import { EmptyPoolNotice } from './EmptyPoolNotice';
import { SessionProgressBar } from './SessionProgressBar';

export interface QuizRunnerProps {
  questions: Question[];
  filter?: QuestionFilter;
  lang?: string;
  compact?: boolean;
  embed?: boolean;
  showNotationToggle?: boolean;
  onAnswer?: (result: {
    questionId: string;
    isCorrect: boolean;
    selectedOptionIds: string[];
    correctAnswerIds: string[];
  }) => void;
  onComplete?: () => void;
  renderRemediation?: (props: {
    question: Question;
    evaluation: EvaluationResult;
    onContinue: () => void;
    lang: string;
    compact?: boolean;
  }) => React.ReactNode;
  renderProgressBar?: (props: {
    hits: number;
    misses: number;
    currentStreak: number;
    bestStreak: number;
    accuracy: number;
    totalCompleted: number;
  }) => React.ReactNode;
  renderEmptyNotice?: (props: { lang: string }) => React.ReactNode;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  filter,
  lang = 'en',
  compact = false,
  embed = false,
  showNotationToggle = true,
  onAnswer,
  onComplete,
  renderRemediation,
  renderProgressBar,
  renderEmptyNotice,
}) => {
  const isCompact = compact || embed;
  const [activeNotation, setActiveNotation] = useState<string>(
    filter?.notation || 'any'
  );

  const effectiveFilter = useMemo<QuestionFilter>(() => {
    return {
      ...filter,
      notation: activeNotation as QuestionFilter['notation'],
    };
  }, [filter, activeNotation]);

  const [candidatePool, setCandidatePool] = useState<Question[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [excludedFamilyIds, setExcludedFamilyIds] = useState<Set<string>>(new Set());
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [status, setStatus] = useState<
    'IDLE' | 'ANSWERING' | 'EVALUATED_CORRECT' | 'EVALUATED_INCORRECT' | 'SESSION_EXHAUSTED'
  >('IDLE');

  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    currentStreak: 0,
    bestStreak: 0,
    accuracy: 100,
    totalCompleted: 0,
  });

  const filteredQuestions = useMemo(() => {
    return filterQuestions(questions, effectiveFilter);
  }, [questions, effectiveFilter]);

  const shuffle = useCallback(<T,>(items: T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const drawNext = useCallback(
    (pool: Question[], currentExcluded: Set<string>): { drawn: Question | null; remaining: Question[] } => {
      const index = pool.findIndex(
        (q) => !q.familyIds || !q.familyIds.some((f) => currentExcluded.has(f))
      );

      if (index === -1) {
        return { drawn: null, remaining: [] };
      }

      const drawn = pool[index];
      const remaining = [...pool.slice(0, index), ...pool.slice(index + 1)];
      return { drawn, remaining };
    },
    []
  );

  const initSession = useCallback(() => {
    const candidateList = filter?.order === 'random' ? shuffle(filteredQuestions) : filteredQuestions;
    const newExcluded = new Set<string>();
    const { drawn, remaining } = drawNext(candidateList, newExcluded);

    setCandidatePool(remaining);
    setSelectedOptionIds([]);
    setEvaluation(null);

    if (drawn) {
      if (drawn.familyIds) {
        drawn.familyIds.forEach((f) => newExcluded.add(f));
      }
      setExcludedFamilyIds(newExcluded);
      setActiveQuestion(drawn);
      setStatus('IDLE');
    } else {
      setActiveQuestion(null);
      setStatus('SESSION_EXHAUSTED');
    }
  }, [filteredQuestions, shuffle, drawNext]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const advanceNextQuestion = useCallback(() => {
    const { drawn, remaining } = drawNext(candidatePool, excludedFamilyIds);
    setSelectedOptionIds([]);
    setEvaluation(null);

    if (drawn) {
      const nextExcluded = new Set(excludedFamilyIds);
      if (drawn.familyIds) {
        drawn.familyIds.forEach((f) => nextExcluded.add(f));
      }
      setExcludedFamilyIds(nextExcluded);
      setActiveQuestion(drawn);
      setCandidatePool(remaining);
      setStatus('IDLE');
    } else {
      setActiveQuestion(null);
      setStatus('SESSION_EXHAUSTED');
      onComplete?.();
    }
  }, [candidatePool, excludedFamilyIds, drawNext, onComplete]);

  const performEvaluation = useCallback(
    (question: Question, selectedIds: string[]) => {
      const result = evaluateAnswer(question, selectedIds);
      setEvaluation(result);

      const isCorrect = result.isCorrect;
      const newHits = isCorrect ? stats.hits + 1 : stats.hits;
      const newMisses = isCorrect ? stats.misses : stats.misses + 1;
      const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
      const newBest = Math.max(stats.bestStreak, newStreak);
      const total = newHits + newMisses;
      const newAccuracy = total > 0 ? Math.round((newHits / total) * 100) : 100;

      setStats({
        hits: newHits,
        misses: newMisses,
        currentStreak: newStreak,
        bestStreak: newBest,
        accuracy: newAccuracy,
        totalCompleted: stats.totalCompleted + 1,
      });

      const expectedIds = Array.isArray(question.correctAnswer)
        ? (question.correctAnswer as string[])
        : typeof question.correctAnswer === 'string'
        ? [question.correctAnswer]
        : [];

      onAnswer?.({
        questionId: question.id,
        isCorrect,
        selectedOptionIds: selectedIds,
        correctAnswerIds: expectedIds,
      });

      if (isCorrect) {
        setStatus('EVALUATED_CORRECT');
        setTimeout(() => {
          advanceNextQuestion();
        }, 500);
      } else {
        setStatus('EVALUATED_INCORRECT');
      }
    },
    [stats, onAnswer, advanceNextQuestion]
  );

  const handleSelectOption = (optionId: string) => {
    if (status === 'EVALUATED_CORRECT' || status === 'EVALUATED_INCORRECT') return;
    if (!activeQuestion) return;

    if (activeQuestion.type === 'single-choice') {
      setSelectedOptionIds([optionId]);
      performEvaluation(activeQuestion, [optionId]);
    } else {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
      setStatus('ANSWERING');
    }
  };

  const handleSubmitMulti = () => {
    if (!activeQuestion || selectedOptionIds.length === 0) return;
    performEvaluation(activeQuestion, selectedOptionIds);
  };

  if (filteredQuestions.length === 0) {
    if (renderEmptyNotice) {
      return <>{renderEmptyNotice({ lang })}</>;
    }
    return <EmptyPoolNotice lang={lang} compact={isCompact} />;
  }

  if (status === 'SESSION_EXHAUSTED' || !activeQuestion) {
    return (
      <div
        className={`w-full ${
          embed
            ? 'p-4 sm:p-6 bg-transparent rounded-none border-0 shadow-none'
            : 'max-w-md mx-auto p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl'
        } text-center space-y-4 backdrop-blur-sm overflow-x-hidden select-none`}
      >
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {lang === 'es' ? '¡Sesión Completada!' : 'Session Complete!'}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm">
          {lang === 'es'
            ? 'Has completado todas las preguntas disponibles en esta sesión.'
            : 'You have answered all available non-repeating questions in this session.'}
        </p>
        <div className="py-2.5 flex justify-around text-center border-y border-slate-800 font-mono">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.accuracy}%</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase">{lang === 'es' ? 'Precisión' : 'Accuracy'}</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{stats.bestStreak}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase">{lang === 'es' ? 'Racha máx.' : 'Best Streak'}</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.totalCompleted}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase">{lang === 'es' ? 'Total' : 'Total'}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={initSession}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all cursor-pointer text-sm shadow-md shadow-amber-500/20"
        >
          {lang === 'es' ? 'Practicar de nuevo' : 'Practice Again'}
        </button>
      </div>
    );
  }

  const expectedAnswerIds = Array.isArray(activeQuestion.correctAnswer)
    ? (activeQuestion.correctAnswer as string[])
    : typeof activeQuestion.correctAnswer === 'string'
    ? [activeQuestion.correctAnswer]
    : [];

  return (
    <div
      className={`w-full flex flex-col items-center justify-start ${
        embed
          ? 'p-0 m-0 max-w-none rounded-none border-0 shadow-none bg-transparent'
          : isCompact
          ? 'p-2 max-w-sm mx-auto bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl'
          : 'p-3 sm:p-5 max-w-md mx-auto bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl'
      } select-none overflow-x-hidden`}
    >
      {/* Header controls: Progress bar and Notation selector */}
      <div className="w-full flex items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-slate-800 text-xs font-mono">
        <div className="flex-1">
          {renderProgressBar ? (
            renderProgressBar({
              hits: stats.hits,
              misses: stats.misses,
              currentStreak: stats.currentStreak,
              bestStreak: stats.bestStreak,
              accuracy: stats.accuracy,
              totalCompleted: stats.totalCompleted,
            })
          ) : (
            <SessionProgressBar
              hits={stats.hits}
              misses={stats.misses}
              currentStreak={stats.currentStreak}
              bestStreak={stats.bestStreak}
              accuracy={stats.accuracy}
              totalCompleted={stats.totalCompleted}
              lang={lang}
              compact={isCompact}
              onReset={initSession}
            />
          )}
        </div>

        {/* Notation Selector Toggle */}
        {showNotationToggle && !isCompact && (
          <div
            role="group"
            aria-label={lang === 'es' ? 'Selector de notación' : 'Notation selector'}
            className="flex items-center p-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-semibold"
          >
            {[
              { id: 'any', labelEn: 'All', labelEs: 'Todas' },
              { id: 'letters', labelEn: 'Letters', labelEs: 'Letras' },
              { id: 'solfege', labelEn: 'Solfège', labelEs: 'Solfeo' },
            ].map((item) => {
              const isActive = activeNotation === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNotation(item.id)}
                  aria-pressed={isActive}
                  className={`
                    px-2 py-0.5 rounded transition-all cursor-pointer
                    ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }
                  `}
                >
                  {lang === 'es' ? item.labelEs : item.labelEn}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full">
        <QuestionView
          question={activeQuestion}
          selectedOptionIds={selectedOptionIds}
          onSelectOption={handleSelectOption}
          onSubmit={handleSubmitMulti}
          disabled={status === 'EVALUATED_CORRECT' || status === 'EVALUATED_INCORRECT'}
          lang={lang}
          compact={isCompact}
          evaluated={status === 'EVALUATED_CORRECT' || status === 'EVALUATED_INCORRECT'}
          correctAnswerIds={expectedAnswerIds}
          falsePositives={evaluation?.falsePositives ?? []}
          falseNegatives={evaluation?.falseNegatives ?? []}
        />
      </div>

      {/* Immediate Remediation Card on Error */}
      {status === 'EVALUATED_INCORRECT' && evaluation && (
        <div className="w-full mt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {renderRemediation ? (
            renderRemediation({
              question: activeQuestion,
              evaluation,
              onContinue: advanceNextQuestion,
              lang,
              compact: isCompact,
            })
          ) : (
            <RemediationCard
              question={activeQuestion}
              evaluation={evaluation}
              onContinue={advanceNextQuestion}
              lang={lang}
              compact={isCompact}
            />
          )}
        </div>
      )}
    </div>
  );
};
