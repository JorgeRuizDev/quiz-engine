import React from 'react';

export interface FeedbackBannerProps {
  variant?: 'hint' | 'error' | 'success' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

/**
 * Common feedback banner for retry hints, error messages, and success notices.
 */
export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  variant = 'hint',
  children,
  icon,
  compact = false,
  className = '',
}) => {
  let style = 'bg-neutral-800/60 border-neutral-700/40 text-neutral-300';
  let defaultIcon = <span>💡</span>;

  if (variant === 'hint') {
    style = 'bg-rose-500/10 border-rose-500/20 text-rose-300';
    defaultIcon = <span>💡</span>;
  } else if (variant === 'error') {
    style = 'bg-rose-950/40 border-rose-800/40 text-rose-300';
    defaultIcon = <span>✕</span>;
  } else if (variant === 'success') {
    style = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    defaultIcon = <span>✓</span>;
  } else if (variant === 'info') {
    style = 'bg-amber-950/30 border-amber-800/40 text-amber-200';
    defaultIcon = <span>ℹ</span>;
  }

  const paddingClass = compact
    ? 'py-1.5 px-2.5 text-[11px] mb-2.5'
    : 'py-2 px-3 text-xs mb-3';

  return (
    <div
      className={`w-full rounded-lg border text-center flex items-center justify-center gap-1.5 animate-fadeIn ${paddingClass} ${style} ${className}`}
    >
      {icon ?? defaultIcon}
      <span className="font-medium">{children}</span>
    </div>
  );
};
