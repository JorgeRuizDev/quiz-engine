import React from 'react';
import type { QuestionOption, QuestionType } from '../../core/types/schema';
import { visualRegistry } from '../../core/registry/visualRegistry';

export interface OptionGridProps {
  options: QuestionOption[];
  selectedOptionIds: string[];
  onSelectOption: (optionId: string) => void;
  type: QuestionType;
  disabled?: boolean;
  lang?: string;
  compact?: boolean;
  evaluated?: boolean;
  correctAnswerIds?: string[];
  falsePositives?: string[];
  falseNegatives?: string[];
}

export const OptionGrid: React.FC<OptionGridProps> = ({
  options,
  selectedOptionIds,
  onSelectOption,
  type,
  disabled = false,
  lang = 'en',
  compact = false,
  evaluated = false,
  correctAnswerIds = [],
  falsePositives = [],
  falseNegatives = [],
}) => {
  const isMulti = type === 'multiple-choice';

  return (
    <div
      role={isMulti ? 'group' : 'radiogroup'}
      aria-label={isMulti ? 'Multiple choice options' : 'Single choice options'}
      className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-[340px] sm:max-w-md mx-auto"
    >
      {options.map((option, index) => {
        const isSelected = selectedOptionIds.includes(option.id);
        const isCorrect = correctAnswerIds.includes(option.id);
        const isFalsePositive = falsePositives.includes(option.id);
        const isFalseNegative = falseNegatives.includes(option.id);

        let buttonStyle =
          'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-amber-500/60 hover:bg-slate-800 active:scale-[0.98]';

        if (isSelected && !evaluated) {
          buttonStyle =
            'bg-amber-500/15 text-amber-200 border-amber-500/60 ring-1 ring-amber-500/30';
        }

        if (evaluated) {
          if (isFalsePositive) {
            buttonStyle =
              'bg-rose-950/40 text-rose-400/80 border-rose-800/80 line-through opacity-60 cursor-not-allowed';
          } else if (isFalseNegative) {
            buttonStyle =
              'bg-amber-950/40 text-amber-300 border-amber-500/60 border-dashed opacity-80 cursor-not-allowed';
          } else if (isCorrect) {
            buttonStyle =
              'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold';
          } else {
            buttonStyle =
              'bg-slate-900/40 text-slate-500 border-slate-800/60 cursor-not-allowed opacity-50';
          }
        }

        const shortcutKey = index + 1;
        const labelText = option.label[lang] || option.label.en || Object.values(option.label)[0] || '';
        const heightClass = compact ? 'min-h-[46px] p-2.5' : 'min-h-[52px] p-3';
        const textSizeClass =
          labelText.length > 8
            ? 'text-xs sm:text-sm text-center leading-tight'
            : compact
            ? 'text-base sm:text-lg'
            : 'text-lg sm:text-xl';

        const VisualCueComponent = option.visualCue
          ? visualRegistry.get(option.visualCue.visualType)
          : null;

        return (
          <button
            key={option.id}
            type="button"
            role={isMulti ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            aria-label={`Option ${shortcutKey}: ${labelText}`}
            disabled={disabled}
            onClick={() => onSelectOption(option.id)}
            className={`
              relative flex items-center justify-center min-w-[46px] rounded-xl border-2
              transition-all duration-150 select-none font-semibold tracking-wide
              cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              disabled:cursor-not-allowed
              ${heightClass} ${buttonStyle}
            `}
          >
            {/* Keyboard shortcut hint (hidden on compact) */}
            {!compact && (
              <span className="absolute top-1.5 left-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 hidden sm:inline-block">
                {shortcutKey}
              </span>
            )}

            {/* Option label */}
            <span className={textSizeClass}>{labelText}</span>

            {/* Visual Cue (inline, compact) */}
            {VisualCueComponent && option.visualCue && (
              <div className="ml-1.5 flex-shrink-0">
                <VisualCueComponent
                  props={option.visualCue.visualProps}
                  lang={lang}
                  compact={true}
                />
              </div>
            )}

            {/* Multi-select checkbox indicator */}
            {isMulti && (
              <div
                className={`absolute top-1.5 right-1.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-slate-950'
                    : 'border-slate-600 bg-slate-800/50'
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            )}

            {/* Status icons */}
            {evaluated && isCorrect && (
              <span className={`absolute right-2 text-emerald-400 ${compact ? 'text-base' : 'text-lg'}`}>
                ✓
              </span>
            )}
            {evaluated && isFalsePositive && (
              <span className={`absolute right-2 text-rose-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
                ✕
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
