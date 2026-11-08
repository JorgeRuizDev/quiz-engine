import React from 'react';
import { Flame, Target, CheckCircle2, RotateCcw } from 'lucide-react';

export interface SessionProgressBarProps {
  hits: number;
  misses: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
  totalCompleted?: number;
  lang?: string;
  compact?: boolean;
  onReset?: () => void;
  categoryLabel?: string;
}

export const SessionProgressBar: React.FC<SessionProgressBarProps> = ({
  hits,
  currentStreak,
  accuracy,
  totalCompleted = 0,
  lang = 'en',
  compact = false,
  onReset,
  categoryLabel,
}) => {
  return (
    <div
      data-testid="session-progress-bar"
      className="w-full flex items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-slate-800 text-xs font-mono select-none"
    >
      {/* Category / Mode Label (if provided) */}
      {categoryLabel ? (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-sans font-medium text-xs">
          <span>{categoryLabel}</span>
        </div>
      ) : totalCompleted > 0 ? (
        <span className="text-[11px] text-slate-400 font-sans">
          #{totalCompleted}
        </span>
      ) : (
        <div />
      )}

      {/* Stats: Streak, Accuracy, Hits */}
      <div className="flex items-center gap-2 sm:gap-3 text-slate-300">
        {/* Current Streak */}
        <div
          className="flex items-center gap-1"
          title={lang === 'es' ? 'Racha actual' : 'Current streak'}
        >
          <Flame
            className={`w-4 h-4 ${
              currentStreak > 0
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-500'
            }`}
          />
          <span className="font-bold text-slate-100">{currentStreak}</span>
        </div>

        {/* Accuracy */}
        <div
          className="flex items-center gap-1"
          title={lang === 'es' ? 'Precisión' : 'Accuracy'}
        >
          <Target className="w-3.5 h-3.5 text-blue-400" />
          <span
            className={`font-bold ${
              accuracy >= 80
                ? 'text-emerald-400'
                : accuracy >= 60
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {accuracy}%
          </span>
        </div>

        {/* Hits */}
        <div
          className="flex items-center gap-1"
          title={lang === 'es' ? 'Aciertos' : 'Correct answers'}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">{hits}</span>
        </div>
      </div>

      {/* Reset button or empty placeholder */}
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          title={lang === 'es' ? 'Reiniciar sesión' : 'Reset session'}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
};
