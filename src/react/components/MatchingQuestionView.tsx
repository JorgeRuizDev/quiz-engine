import React, { useState, useMemo } from 'react';
import type { Question } from '../../core/types/schema';
import { CheckCircle2, XCircle, Link2, X } from 'lucide-react';

export interface MatchingLabels {
  instruction?: string;
  columnLeft?: string;
  columnRight?: string;
  unpair?: string;
}

export interface MatchingQuestionViewProps {
  question: Question;
  selectedPairs: string[]; // ["leftId:rightId", ...]
  onPairSelected: (leftId: string, rightId: string) => void;
  onPairRemoved: (leftId: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  lang?: string;
  labels?: MatchingLabels;
}

const DEFAULT_LABELS: Record<string, Required<MatchingLabels>> = {
  en: {
    instruction: 'Select an item from the left, then select its match on the right.',
    columnLeft: 'Concepts',
    columnRight: 'Matches',
    unpair: 'Unpair',
  },
  es: {
    instruction: 'Selecciona un elemento de la izquierda y luego su pareja a la derecha.',
    columnLeft: 'Conceptos',
    columnRight: 'Definiciones / Parejas',
    unpair: 'Desemparejar',
  },
};

const PAIR_COLORS = [
  { badge: 'bg-indigo-600 text-white', border: 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40' },
  { badge: 'bg-violet-600 text-white', border: 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/40' },
  { badge: 'bg-sky-600 text-white', border: 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40' },
  { badge: 'bg-amber-600 text-white', border: 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40' },
  { badge: 'bg-emerald-600 text-white', border: 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40' },
  { badge: 'bg-fuchsia-600 text-white', border: 'border-fuchsia-500 bg-fuchsia-50/60 dark:bg-fuchsia-950/40' },
];

export const MatchingQuestionView: React.FC<MatchingQuestionViewProps> = ({
  question,
  selectedPairs,
  onPairSelected,
  onPairRemoved,
  disabled = false,
  showFeedback = false,
  lang = 'en',
  labels,
}) => {
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);

  const fallback = DEFAULT_LABELS[lang] || DEFAULT_LABELS.en;
  const resolvedLabels: Required<MatchingLabels> = {
    instruction: labels?.instruction || fallback.instruction,
    columnLeft: labels?.columnLeft || fallback.columnLeft,
    columnRight: labels?.columnRight || fallback.columnRight,
    unpair: labels?.unpair || fallback.unpair,
  };

  const leftItems = question.matchingData?.leftItems || [];
  const rightItems = question.matchingData?.rightItems || [];

  const leftToRight = useMemo(() => {
    const map = new Map<string, string>();
    selectedPairs.forEach((pair) => {
      const [left, right] = pair.split(':');
      if (left && right) {
        map.set(left, right);
      }
    });
    return map;
  }, [selectedPairs]);

  const rightToLeft = useMemo(() => {
    const map = new Map<string, string>();
    selectedPairs.forEach((pair) => {
      const [left, right] = pair.split(':');
      if (left && right) {
        map.set(right, left);
      }
    });
    return map;
  }, [selectedPairs]);

  const correctLeftToRight = useMemo(() => {
    const map = new Map<string, string>();
    const expected = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
    expected.forEach((pair) => {
      if (typeof pair === 'string') {
        const [left, right] = pair.split(':');
        if (left && right) {
          map.set(left, right);
        }
      }
    });
    return map;
  }, [question.correctAnswer]);

  const pairIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    leftItems.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  }, [leftItems]);

  const handleLeftClick = (leftId: string) => {
    if (disabled) return;
    if (leftToRight.has(leftId)) {
      onPairRemoved(leftId);
      setActiveLeftId(null);
      return;
    }
    setActiveLeftId(activeLeftId === leftId ? null : leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (disabled) return;
    if (rightToLeft.has(rightId)) {
      const leftId = rightToLeft.get(rightId)!;
      onPairRemoved(leftId);
      return;
    }
    if (activeLeftId) {
      onPairSelected(activeLeftId, rightId);
      setActiveLeftId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 my-2">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
        <Link2 className="w-4 h-4 shrink-0 text-indigo-500" />
        <span>{resolvedLabels.instruction}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column (Terms / Concepts) */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            {resolvedLabels.columnLeft}
          </span>
          {leftItems.map((item) => {
            const isSelected = activeLeftId === item.id;
            const pairedRightId = leftToRight.get(item.id);
            const isPaired = !!pairedRightId;
            const pairIndex = pairIndexMap.get(item.id) ?? 0;
            const colorScheme = PAIR_COLORS[pairIndex % PAIR_COLORS.length];

            let feedbackClass = '';
            if (showFeedback && isPaired) {
              const isCorrect = pairedRightId === correctLeftToRight.get(item.id);
              feedbackClass = isCorrect
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40';
            }

            const itemLabel = item.label[lang] || item.label.en || Object.values(item.label)[0] || '';

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => handleLeftClick(item.id)}
                className={`
                  w-full min-h-[48px] p-3 rounded-xl border-2 text-left text-sm font-medium
                  transition-all duration-150 flex items-center justify-between gap-3
                  ${isSelected ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-400' : ''}
                  ${!isSelected && isPaired && !showFeedback ? colorScheme.border : ''}
                  ${!isSelected && !isPaired && !showFeedback ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700' : ''}
                  ${feedbackClass}
                  ${disabled ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="leading-snug">{itemLabel}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isPaired && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${colorScheme.badge}`}>
                      {pairIndex + 1}
                    </span>
                  )}
                  {showFeedback && isPaired && (
                    pairedRightId === correctLeftToRight.get(item.id) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )
                  )}
                  {!disabled && isPaired && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPairRemoved(item.id);
                      }}
                      className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={resolvedLabels.unpair}
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column (Definitions / Targets) */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            {resolvedLabels.columnRight}
          </span>
          {rightItems.map((item) => {
            const pairedLeftId = rightToLeft.get(item.id);
            const isPaired = !!pairedLeftId;
            const pairIndex = pairedLeftId ? (pairIndexMap.get(pairedLeftId) ?? 0) : -1;
            const colorScheme = isPaired ? PAIR_COLORS[pairIndex % PAIR_COLORS.length] : null;

            let feedbackClass = '';
            if (showFeedback && isPaired && pairedLeftId) {
              const isCorrect = item.id === correctLeftToRight.get(pairedLeftId);
              feedbackClass = isCorrect
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40';
            }

            const itemLabel = item.label[lang] || item.label.en || Object.values(item.label)[0] || '';

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => handleRightClick(item.id)}
                className={`
                  w-full min-h-[48px] p-3 rounded-xl border-2 text-left text-sm font-medium
                  transition-all duration-150 flex items-center justify-between gap-3
                  ${activeLeftId && !isPaired ? 'border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 bg-indigo-50/30' : ''}
                  ${isPaired && colorScheme && !showFeedback ? colorScheme.border : ''}
                  ${!isPaired && !activeLeftId && !showFeedback ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700' : ''}
                  ${feedbackClass}
                  ${disabled ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="leading-snug">{itemLabel}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isPaired && colorScheme && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${colorScheme.badge}`}>
                      {pairIndex + 1}
                    </span>
                  )}
                  {showFeedback && isPaired && pairedLeftId && (
                    item.id === correctLeftToRight.get(pairedLeftId) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
