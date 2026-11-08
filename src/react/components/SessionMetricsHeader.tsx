import React from 'react';
import { Flame, Target, CheckCircle2, RotateCcw } from 'lucide-react';

export interface SessionMetricsHeaderProps {
  categoryLabel?: string;
  categoryIcon?: React.ReactNode;
  currentStreak: number;
  accuracy: number;
  hits: number;
  onReset?: () => void;
  lang?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Common metrics header bar for quiz sessions.
 * Displays Streak (Flame), Accuracy % (Target), Hits (CheckCircle2), and Reset action.
 */
export const SessionMetricsHeader: React.FC<SessionMetricsHeaderProps> = ({
  categoryLabel,
  categoryIcon,
  currentStreak,
  accuracy,
  hits,
  onReset,
  lang = 'en',
  className = '',
}) => {
  return (
    <div
      data-testid="session-metrics-header"
      className={`w-full flex items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-slate-800 text-xs select-none ${className}`}
    >
      {/* Category / Mode Badge */}
      {categoryLabel ? (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
          {categoryIcon}
          <span className="hidden xs:inline">{categoryLabel}</span>
        </div>
      ) : (
        <div />
      )}

      {/* Stats: Streak, Accuracy, Hits */}
      <div className="flex items-center gap-2 sm:gap-3 text-slate-300 font-mono">
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
          <span
            className={`font-bold ${
              currentStreak > 0 ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            {currentStreak}
          </span>
        </div>

        <div
          className="flex items-center gap-1"
          title={lang === 'es' ? 'Precisión' : 'Accuracy'}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>{accuracy}%</span>
        </div>

        <div
          className="flex items-center gap-1"
          title={lang === 'es' ? 'Aciertos' : 'Hits'}
        >
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{hits}</span>
        </div>
      </div>

      {/* Reset Action */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          title={lang === 'es' ? 'Reiniciar sesión' : 'Reset session'}
          aria-label={lang === 'es' ? 'Reiniciar sesión' : 'Reset session'}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
