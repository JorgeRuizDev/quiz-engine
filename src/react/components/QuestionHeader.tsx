import React from 'react';

export interface QuestionHeaderProps {
  category?: string;
  difficulty?: string;
  topic?: string;
  title?: string;
  subtitle?: string | null;
  compact?: boolean;
  className?: string;
}

/**
 * Common question prompt and badge header.
 * Displays category/topic/difficulty tags and primary/sub-prompts with mobile-first typography.
 */
export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  category,
  difficulty,
  topic,
  title,
  subtitle,
  compact = false,
  className = '',
}) => {
  const hasBadges = Boolean(category || difficulty || topic);
  const promptTextSize = compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl';
  const promptMinHeight = compact ? 'min-h-[44px]' : 'min-h-[48px]';

  return (
    <div className={`w-full flex flex-col items-center text-center ${className}`}>
      {/* Badges Row */}
      {hasBadges && (
        <div className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
          {category && (
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
              {category}
            </span>
          )}
          {topic && (
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              {topic}
            </span>
          )}
          {difficulty && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60">
              {difficulty}
            </span>
          )}
        </div>
      )}

      {/* Main Title / Prompt */}
      {title && (
        <h2
          className={`${promptTextSize} font-bold text-center text-neutral-100 ${promptMinHeight} flex items-center justify-center mb-1 leading-snug px-1`}
        >
          {title}
        </h2>
      )}

      {/* Subtitle / SubPrompt */}
      {subtitle && (
        <p className={`text-xs sm:text-sm text-neutral-400 ${compact ? 'mb-2.5' : 'mb-3.5'} text-center font-medium max-w-sm`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
