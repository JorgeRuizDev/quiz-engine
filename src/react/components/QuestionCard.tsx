import React from 'react';

export interface QuestionCardProps {
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
  role?: string;
  'aria-label'?: string;
  highlightBorder?: boolean;
}

/**
 * Common question card container.
 * Mobile-first, compact, overflow-x-hidden, max-w-md,
 * with standard slate palette and rounded corners.
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  children,
  compact = false,
  className = '',
  role,
  'aria-label': ariaLabel,
  highlightBorder = false,
}) => {
  const containerPadding = compact ? 'p-2.5 sm:p-4' : 'p-3.5 sm:p-5';
  const borderStyle = highlightBorder
    ? 'border-amber-500/40 bg-slate-900/95'
    : 'border-slate-800 bg-slate-900/90';

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`w-full max-w-md mx-auto flex flex-col items-center justify-start rounded-2xl border ${borderStyle} ${containerPadding} shadow-xl backdrop-blur-sm transition-all overflow-x-hidden select-none ${className}`}
    >
      {children}
    </div>
  );
};
