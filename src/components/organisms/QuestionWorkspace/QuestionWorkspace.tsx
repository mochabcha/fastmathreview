'use client';

import { Badge, Cluster, MathText, Stack, Text } from '@/components/atoms';
import { KeywordHintChip, QuestionOption } from '@/components/molecules';
import type { AssessmentQuestion, EvaluationResult, QuestionHelpEntry, QuestionResponseValue } from '@/types/assessment';
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
  showReviewState = false,
  questionCount,
  onResponseChange,
}: {
  question: AssessmentQuestion;
  response: QuestionResponseValue | undefined;
  evaluation: EvaluationResult | undefined;
  questionHelp: QuestionHelpEntry | undefined;
  showReviewState?: boolean;
  questionCount: number;
  onResponseChange: (nextValue: QuestionResponseValue) => void;
}) {
  return (
    <div className={styles.workspace}>
      <div className={styles.promptBlock}>
        <Stack gap="var(--space-4)">
          <Cluster gap="var(--space-2)">
            <Badge tone="accent">
              Question {question.sequence} of {questionCount}
            </Badge>
          </Cluster>
          <Text className={styles.prompt}>
            <MathText text={question.prompt} />
          </Text>
          {question.contextLines?.length ? (
            <ul className={styles.contextList}>
              {question.contextLines.map((line) => (
                <li key={line}>
                  <MathText text={line} />
                </li>
              ))}
            </ul>
          ) : null}
          {questionHelp?.keywords?.length ? (
            <div className={styles.keywordBank}>
              {questionHelp.keywords.map((hint) => (
                <KeywordHintChip key={`${question.id}-${hint.phrase}`} hint={hint} />
              ))}
            </div>
          ) : null}
        </Stack>
      </div>

      <div className={styles.answerBlock}>
        {renderBody(question, response, evaluation, showReviewState, onResponseChange)}
      </div>
    </div>
  );
}
