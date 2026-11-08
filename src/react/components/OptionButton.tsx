'use client';

import React from 'react';

export interface OptionButtonProps {
  label: React.ReactNode | string;
  index: number; // 0, 1, 2, 3 (for hotkeys 1, 2, 3, 4)
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isDisabled?: boolean;
  compact?: boolean;
  onClick: (label?: any) => void;
  className?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  index,
  isCorrect = false,
  isIncorrect = false,
  isDisabled = false,
  compact = false,
  onClick,
  className = '',
}) => {
  const shortcutKey = index + 1;

  // Compute styling based on state using unified slate palette
  let buttonStyle =
    'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-amber-500/60 hover:bg-slate-800 active:scale-[0.98]';

  if (isCorrect) {
    buttonStyle =
      'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold';
  } else if (isIncorrect) {
    buttonStyle =
      'bg-rose-950/40 text-rose-400/80 border-rose-800/80 line-through opacity-60 cursor-not-allowed';
  } else if (isDisabled) {
    buttonStyle =
      'bg-slate-900/40 text-slate-500 border-slate-800/60 cursor-not-allowed opacity-50';
  }

  const heightClass = compact ? 'min-h-[46px] p-2.5 sm:p-3' : 'min-h-[56px] p-4';

  const stringLabel = typeof label === 'string' ? label : '';
  const textClass =
    stringLabel.length > 6
      ? 'text-xs sm:text-sm text-center leading-tight'
      : compact
      ? 'text-lg sm:text-xl'
      : 'text-xl md:text-2xl';

  return (
    <button
      type="button"
      disabled={isDisabled || isIncorrect || isCorrect}
      onClick={() => onClick(stringLabel)}
      aria-label={`Option ${shortcutKey}: ${stringLabel || index + 1}`}
      className={`relative flex items-center justify-center min-w-[46px] rounded-xl border-2 transition-all duration-150 select-none font-semibold tracking-wide ${heightClass} ${buttonStyle} ${className}`}
    >
      {/* Keyboard shortcut hint (hidden on compact/tiny screens) */}
      {!compact && (
        <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 hidden sm:inline-block">
          {shortcutKey}
        </span>
      )}

      {/* Button label */}
      <span className={textClass}>{label}</span>

      {/* Visual Status Icons */}
      {isCorrect && (
        <span className={`absolute right-2.5 text-emerald-400 ${compact ? 'text-base' : 'text-lg'}`}>
          ✓
        </span>
      )}
      {isIncorrect && (
        <span className={`absolute right-2.5 text-rose-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
          ✕
        </span>
      )}
    </button>
  );
};
