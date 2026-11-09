import React from 'react';
import type { Question } from '../../core/types/schema';
import type { EvaluationResult } from '../../core/engine/evaluator';
import { visualRegistry } from '../../core/registry/visualRegistry';
import { BookOpen, CheckCircle } from 'lucide-react';
import { renderSafeMarkdown } from '../../core/utils/markdown';
import { QuestionCard } from './QuestionCard';
import { StimulusContainer } from './StimulusContainer';
import { MnemonicBanner } from './MnemonicBanner';
import { ActionNextButton } from './ActionNextButton';

export interface RemediationCardProps {
  question: Question;
  evaluation: EvaluationResult;
  onContinue: () => void;
  lang?: string;
  compact?: boolean;
}

export const RemediationCard: React.FC<RemediationCardProps> = ({
  question,
  evaluation,
  onContinue,
  lang = 'en',
  compact = false,
}) => {
  const { remediation, options } = question;
  const falsePositives = evaluation.falsePositives || [];
  const falseNegatives = evaluation.falseNegatives || [];
  const isEs = lang === 'es';

  // Resolve option labels for diagnostics
  const getOptionLabel = (id: string) => {
    const opt = options.find((o) => o.id === id);
    if (!opt) return id;
    return opt.label[lang] || opt.label.en || Object.values(opt.label)[0] || id;
  };

  const VisualExplanationComponent = remediation.visualExplanation
    ? visualRegistry.get(remediation.visualExplanation.visualType)
    : null;

  const explanationText =
    remediation.explanation[lang] ||
    remediation.explanation.en ||
    Object.values(remediation.explanation)[0] ||
    '';
  const mnemonicText = remediation.mnemonic
    ? remediation.mnemonic[lang] ||
      remediation.mnemonic.en ||
      Object.values(remediation.mnemonic)[0]
    : null;
  const hintText = remediation.hint
    ? remediation.hint[lang] ||
      remediation.hint.en ||
      Object.values(remediation.hint)[0]
    : null;

  return (
    <div data-testid="remediation-card" className="w-full">
      <QuestionCard
        compact={compact}
        highlightBorder={true}
        role="region"
        aria-label={isEs ? 'Explicación pedagógica' : 'Pedagogical explanation'}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEs ? 'Explicación Pedagógica' : 'Pedagogical Explanation'}</span>
          </div>
        </div>

        {/* Diagnostic Diff (False Positives & False Negatives) */}
        {(falsePositives.length > 0 || falseNegatives.length > 0) && (
          <div data-testid="error-diagnostics" className={`w-full space-y-1.5 ${compact ? 'mb-2' : 'mb-3'}`}>
            {falsePositives.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                <span className="font-semibold text-rose-400">
                  {isEs ? 'Selección incorrecta:' : 'Incorrect selection:'}
                </span>
                {falsePositives.map((id) => (
                  <span
                    key={id}
                    className="px-1.5 py-0.5 rounded bg-rose-500/20 font-medium line-through"
                  >
                    {getOptionLabel(id)}
                  </span>
                ))}
              </div>
            )}

            {falseNegatives.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
                <span className="font-semibold text-amber-400">
                  {isEs ? 'Respuesta correcta omitida:' : 'Missing correct answer:'}
                </span>
                {falseNegatives.map((id) => (
                  <span
                    key={id}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 font-medium"
                  >
                    {getOptionLabel(id)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Theoretical Explanation */}
        <div className="w-full space-y-1 text-left mb-2.5">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div
              className="text-xs sm:text-sm text-slate-200 leading-snug font-sans space-y-2 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(explanationText) }}
            />
          </div>
        </div>

        {/* Visual Explanation Stimulus */}
        {remediation.visualExplanation && VisualExplanationComponent && (
          <StimulusContainer compact={compact} testId="visual-explanation-container">
            <VisualExplanationComponent
              props={remediation.visualExplanation.visualProps}
              lang={lang}
              compact={compact}
            />
          </StimulusContainer>
        )}

        {/* Mnemonic Banner */}
        {mnemonicText && (
          <MnemonicBanner
            mnemonic={mnemonicText}
            compact={compact}
            testId="mnemonic-callout"
          />
        )}

        {/* Hint (fallback if no mnemonic) */}
        {hintText && !mnemonicText && (
          <div className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs italic flex items-center gap-2 mb-3">
            <span className="text-sm select-none shrink-0">💡</span>
            <div className="leading-tight not-italic">
              <span className="font-semibold">{isEs ? 'Pista: ' : 'Hint: '}</span>
              <span dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(hintText) }} />
            </div>
          </div>
        )}

        {/* Continue Button */}
        <ActionNextButton
          label={isEs ? 'Continuar' : 'Continue'}
          onClick={onContinue}
          autoFocus={true}
          testId="remediation-continue-button"
        />
      </QuestionCard>
    </div>
  );
};
