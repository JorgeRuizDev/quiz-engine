import React from 'react';

export interface MnemonicBannerProps {
  mnemonic: string;
  label?: string;
  compact?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Common callout banner for mnemonic rules of thumb and memory tricks.
 */
export const MnemonicBanner: React.FC<MnemonicBannerProps> = ({
  mnemonic,
  label,
  compact = false,
  className = '',
  testId = 'mnemonic-callout',
}) => {
  return (
    <div
      data-testid={testId}
      className={`w-full px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-2 mb-3 ${className}`}
    >
      <span className="text-sm select-none shrink-0">💡</span>
      <div className="leading-tight flex-1">
        {label && (
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-0.5">
            {label}
          </div>
        )}
        <span className="text-amber-200">{mnemonic}</span>
      </div>
    </div>
  );
};
