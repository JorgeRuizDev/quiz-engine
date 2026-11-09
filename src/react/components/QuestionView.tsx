import React from 'react';
import type { Question } from '../../core/types/schema';
import { OptionGrid } from './OptionGrid';
import { MatchingQuestionView } from './MatchingQuestionView';
import { visualRegistry } from '../../core/registry/visualRegistry';
import { questionTypeRegistry } from '../../core/registry/questionTypeRegistry';
import { QuestionCard } from './QuestionCard';
import { QuestionHeader } from './QuestionHeader';
import { StimulusContainer } from './StimulusContainer';
import { ActionNextButton } from './ActionNextButton';

export interface QuestionViewProps {
  question: Question;
  selectedOptionIds: string[];
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  lang?: string;
  compact?: boolean;
  evaluated?: boolean;
  correctAnswerIds?: string[];
  falsePositives?: string[];
  falseNegatives?: string[];
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  selectedOptionIds,
  onSelectOption,
  onSubmit,
  disabled = false,
  lang = 'en',
  compact = false,
  evaluated = false,
  correctAnswerIds = [],
  falsePositives = [],
  falseNegatives = [],
}) => {
  const isMulti = question.type === 'multiple-choice';
  const StimulusComponent = question.stimulus
    ? visualRegistry.get(question.stimulus.visualType)
    : null;

  const promptText =
    question.prompt[lang] || question.prompt.en || Object.values(question.prompt)[0] || '';
  const subPromptText = question.subPrompt
    ? question.subPrompt[lang] || question.subPrompt.en || Object.values(question.subPrompt)[0]
    : null;
  const isEs = lang === 'es';

  const handleOptionClick = (optionId: string) => {
    if (disabled || evaluated) return;
    onSelectOption(optionId);
  };

  const difficultyLabel =
    question.difficulty === 'beginner'
      ? isEs ? 'Principiante' : 'Beginner'
      : question.difficulty === 'intermediate'
      ? isEs ? 'Intermedio' : 'Intermediate'
      : isEs ? 'Avanzado' : 'Advanced';

  // Check if a custom question type component is registered
  const customType = questionTypeRegistry.get(question.type);
  const CustomTypeComponent = customType?.component;

  return (
    <div data-testid="question-view" className="w-full">
      <QuestionCard
        compact={compact}
        role="region"
        aria-label={isEs ? 'Pregunta interactiva' : 'Interactive question'}
      >
        {/* Header / Badges */}
        <QuestionHeader
          category={
            question.course
              ? `${isEs ? 'Curso' : 'Course'} ${question.course}`
              : undefined
          }
          difficulty={difficultyLabel}
          topic={question.topics?.[0]}
          title={promptText}
          subtitle={subPromptText}
          compact={compact}
        />

        {/* Visual Stimulus (if present) */}
        {StimulusComponent && question.stimulus && (
          <StimulusContainer compact={compact} testId="visual-stimulus-container">
            <StimulusComponent
              props={question.stimulus.visualProps}
              isInteractive={question.type === 'interactive-visual'}
              lang={lang}
              compact={compact}
            />
          </StimulusContainer>
        )}

        {/* Custom Question Type or Standard Option Grid */}
        {CustomTypeComponent ? (
          <CustomTypeComponent
            question={question}
            selectedAnswer={selectedOptionIds}
            onSelectAnswer={(val: any) => {
              if (Array.isArray(val)) {
                onSelectOption(val[0]);
              } else if (typeof val === 'string') {
                onSelectOption(val);
              }
            }}
            onSubmit={onSubmit}
            disabled={disabled}
            evaluated={evaluated}
            lang={lang}
            compact={compact}
          />
        ) : question.type === 'matching' ? (
          <MatchingQuestionView
            question={question}
            selectedPairs={selectedOptionIds}
            onPairSelected={(leftId, rightId) => onSelectOption(`${leftId}:${rightId}`)}
            onPairRemoved={(leftId) => onSelectOption(`remove:${leftId}`)}
            disabled={disabled || evaluated}
            showFeedback={evaluated}
            lang={lang}
          />
        ) : question.options && question.options.length > 0 ? (
          <OptionGrid
            options={question.options}
            selectedOptionIds={selectedOptionIds}
            onSelectOption={handleOptionClick}
            type={question.type}
            disabled={disabled}
            lang={lang}
            compact={compact}
            evaluated={evaluated}
            correctAnswerIds={correctAnswerIds}
            falsePositives={falsePositives}
            falseNegatives={falseNegatives}
          />
        ) : null}

        {/* Explicit Submit Button for Multiple Choice */}
        {isMulti && !evaluated && (
          <div className="w-full mt-4 max-w-[340px] sm:max-w-md mx-auto">
            <ActionNextButton
              testId="submit-multiple-choice-btn"
              label={isEs ? 'Confirmar selección' : 'Submit Answer'}
              onClick={onSubmit}
              disabled={disabled || selectedOptionIds.length === 0}
            />
          </div>
        )}
      </QuestionCard>
    </div>
  );
};
