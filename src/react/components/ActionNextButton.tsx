import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ActionNextButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Standard primary call-to-action button for quiz questions and explanations.
 * Vibrant amber gradient, min-h-[44px] touch target, active feedback.
 */
export const ActionNextButton: React.FC<ActionNextButtonProps> = ({
  label,
  onClick,
  icon = <ArrowRight className="w-4 h-4" />,
  autoFocus = false,
  disabled = false,
  className = '',
  testId,
}) => {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      autoFocus={autoFocus}
      disabled={disabled}
      className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-neutral-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 select-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
};
