import React from 'react';

export interface StimulusContainerProps {
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Standard container for question stimuli (e.g., custom diagrams, scale visualizers, sound waves).
 * Centered, bounded, preventing horizontal overflow in narrow mobile views.
 */
export const StimulusContainer: React.FC<StimulusContainerProps> = ({
  children,
  compact = false,
  className = '',
  testId,
}) => {
  return (
    <div
      data-testid={testId}
      className={`w-full flex justify-center items-center ${
        compact ? 'py-2 px-1.5 mb-2' : 'py-3 px-2 mb-3'
      } bg-neutral-950/40 rounded-xl border border-neutral-800/60 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};
