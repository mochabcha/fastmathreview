'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heading, MathText, Stack, Text } from '@/components/atoms';
import { KeywordHintText, QuestionOption, SegmentedTabs } from '@/components/molecules';
import type {
  AssessmentQuestion,
  EvaluationResult,
  GuidedStepResponseMap,
  QuestionHelpEntry,
  QuestionResponseValue,
} from '@/types/assessment';
import styles from './QuestionWorkspace.module.css';

function toggleListValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function renderSingleOrMulti(
  question: AssessmentQuestion,
  response: QuestionResponseValue | undefined,
  evaluation: EvaluationResult | undefined,
  showReviewState: boolean,
  onResponseChange: (nextValue: QuestionResponseValue) => void,
) {
  if (question.type !== 'single' && question.type !== 'multi') {
    return null;
  }

  const selectedOptionIds = response?.type === question.type ? response.selectedOptionIds : [];

  return (
    <Stack gap="0">
      {question.options.map((option) => (
        <QuestionOption
          key={option.id}
          label={option.id}
          content={option.content}
          selected={selectedOptionIds.includes(option.id)}
          reviewState={
            showReviewState && evaluation
              ? question.correctOptionIds.includes(option.id)
                ? 'correct'
                : selectedOptionIds.includes(option.id)
                  ? 'incorrect'
                  : 'neutral'
              : 'neutral'
          }
          onClick={() =>
            onResponseChange({
              type: question.type,
              selectedOptionIds:
                question.type === 'single'
                  ? [option.id]
                  : toggleListValue(selectedOptionIds, option.id),
            })
          }
        />
      ))}
    </Stack>
  );
}

function renderValue(
  question: AssessmentQuestion,
  response: QuestionResponseValue | undefined,
  showReviewState: boolean,
  onResponseChange: (nextValue: QuestionResponseValue) => void,
) {
  if (question.type !== 'value') {
    return null;
  }

  const value = response?.type === 'value' ? response.value : '';

  return (
    <Stack gap="var(--space-3)">
      {question.answerLabel ? <Text tone="soft">{question.answerLabel}</Text> : null}
      <input
        type="text"
        inputMode={question.validation.kind === 'numeric' ? 'decimal' : 'text'}
        className={styles.valueInput}
        value={value}
        disabled={showReviewState}
        onChange={(event) => onResponseChange({ type: 'value', value: event.target.value })}
        placeholder="Enter one value."
      />
    </Stack>
  );
}

function renderBody(
  question: AssessmentQuestion,
  response: QuestionResponseValue | undefined,
  evaluation: EvaluationResult | undefined,
  showReviewState: boolean,
  onResponseChange: (nextValue: QuestionResponseValue) => void,
) {
  switch (question.type) {
    case 'single':
    case 'multi':
      return renderSingleOrMulti(question, response, evaluation, showReviewState, onResponseChange);
    case 'value':
      return renderValue(question, response, showReviewState, onResponseChange);
    default:
      return null;
  }
}

export function QuestionWorkspace({
  question,
  response,
  evaluation,
  questionHelp,
  guidedStepResponses,
  isBreakdownOpen = false,
  showReviewState = false,
  onGuidedStepResponseChange,
  onResponseChange,
}: {
  question: AssessmentQuestion;
  response: QuestionResponseValue | undefined;
  evaluation: EvaluationResult | undefined;
  questionHelp: QuestionHelpEntry | undefined;
  guidedStepResponses: GuidedStepResponseMap | undefined;
  isBreakdownOpen?: boolean;
  showReviewState?: boolean;
  onGuidedStepResponseChange: (stepId: string, optionId: string) => void;
  onResponseChange: (nextValue: QuestionResponseValue) => void;
}) {
  const keywordHints = questionHelp?.keywords;
  const guidedSteps = useMemo(() => questionHelp?.guidedSteps ?? [], [questionHelp?.guidedSteps]);
  const [activeStepId, setActiveStepId] = useState(guidedSteps[0]?.id ?? '');

  useEffect(() => {
    setActiveStepId(guidedSteps[0]?.id ?? '');
  }, [guidedSteps, question.id]);

  const activeStep = guidedSteps.find((step) => step.id === activeStepId) ?? guidedSteps[0];
  const activeStepIndex = activeStep ? guidedSteps.findIndex((step) => step.id === activeStep.id) : -1;

  function handleGuidedStepResponse(stepId: string, optionId: string) {
    onGuidedStepResponseChange(stepId, optionId);

    const stepIndex = guidedSteps.findIndex((step) => step.id === stepId);
    const nextStep = guidedSteps[stepIndex + 1];

    if (nextStep) {
      setActiveStepId(nextStep.id);
    }
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.promptBlock}>
        <Stack gap="var(--space-4)">
          <Text className={styles.prompt}>
            <KeywordHintText text={question.prompt} hints={keywordHints} />
          </Text>
          {question.contextLines?.length ? (
            <ul className={styles.contextList}>
              {question.contextLines.map((line) => (
                <li key={line}>
                  <KeywordHintText text={line} hints={keywordHints} />
                </li>
              ))}
            </ul>
          ) : null}
        </Stack>
      </div>

      <div className={styles.answerBlock}>
        {isBreakdownOpen && activeStep ? (
          <section className={styles.breakdownPanel}>
            <div className={styles.breakdownHeader}>
              <Text tone="soft" className={styles.breakdownLabel}>
                Break-down mode
              </Text>
              <Heading as="h2" size="sm">
                {activeStep.title}
              </Heading>
              <Text tone="soft" className={styles.breakdownProgress}>
                Step {activeStepIndex + 1} of {guidedSteps.length}
              </Text>
            </div>

            <SegmentedTabs
              className={styles.breakdownTabs}
              items={guidedSteps.map((step, index) => ({
                id: step.id,
                label: `Step ${index + 1}`,
              }))}
              activeId={activeStep.id}
              onChange={setActiveStepId}
            />

            <div className={styles.breakdownBody}>
              <Text className={styles.breakdownPrompt}>
                <MathText text={activeStep.prompt} />
              </Text>
              <Stack gap="0.55rem" className={styles.breakdownOptions}>
                {activeStep.options.map((option) => (
                  <QuestionOption
                    key={option.id}
                    label={option.id}
                    content={option.content}
                    selected={guidedStepResponses?.[activeStep.id] === option.id}
                    onClick={() => handleGuidedStepResponse(activeStep.id, option.id)}
                  />
                ))}
              </Stack>
            </div>
          </section>
        ) : null}

        <div className={styles.responsePanel}>
          {renderBody(question, response, evaluation, showReviewState, onResponseChange)}
        </div>
      </div>
    </div>
  );
}
