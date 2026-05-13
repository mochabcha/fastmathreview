'use client';

import confetti from 'canvas-confetti';
import { useEffect, useRef, useState } from 'react';
import { Button, Icon, Text } from '@/components/atoms';
import { AnswerFeedbackPanel } from '@/components/molecules';
import { QuestionWorkspace } from '../QuestionWorkspace/QuestionWorkspace';
import { HelpDrawer } from '../HelpDrawer/HelpDrawer';
import { ReferenceDrawer } from '../ReferenceDrawer/ReferenceDrawer';
import type {
  AssessmentMode,
  AssessmentQuestion,
  EvaluationResult,
  GuidedStepResponseMap,
  LessonResource,
  QuestionHelpEntry,
  QuestionResponseValue,
  ReferenceSheet,
  StandardDefinition,
} from '@/types/assessment';
import styles from './AssessmentBrowser.module.css';

export function AssessmentBrowser({
  stage,
  mode,
  question,
  response,
  evaluation,
  standard,
  lessons,
  questionHelp,
  references,
  isReferenceOpen,
  isHelpOpen,
  guidedStepResponses,
  questionCount,
  currentIndex,
  scoreLabel,
  canGoPrevious,
  isLastQuestion,
  onToggleReference,
  onToggleHelp,
  onGuidedStepResponseChange,
  onPrevious,
  onNext,
  onReturnToModes,
  onResponseChange,
}: {
  stage: 'browser' | 'results';
  mode: AssessmentMode;
  question: AssessmentQuestion;
  response: QuestionResponseValue | undefined;
  evaluation: EvaluationResult | undefined;
  standard: StandardDefinition | undefined;
  lessons: LessonResource[];
  questionHelp: QuestionHelpEntry | undefined;
  references: ReferenceSheet;
  isReferenceOpen: boolean;
  isHelpOpen: boolean;
  guidedStepResponses: GuidedStepResponseMap | undefined;
  questionCount: number;
  currentIndex: number;
  scoreLabel?: string;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  onToggleReference: () => void;
  onToggleHelp: () => void;
  onGuidedStepResponseChange: (stepId: string, optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onReturnToModes: () => void;
  onResponseChange: (nextValue: QuestionResponseValue) => void;
}) {
  const progressPercent = ((currentIndex + 1) / questionCount) * 100;
  const isPostTestReview = stage === 'results';
  const showHelpButton = mode === 'review' || isPostTestReview;
  const hasBreakdown = Boolean(questionHelp?.guidedSteps?.length);
  const previousQuestionIdRef = useRef(question.id);
  const celebratedRef = useRef<string | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const nextLabel = isPostTestReview
    ? isLastQuestion
      ? 'Done'
      : 'Next'
    : mode === 'review'
      ? isLastQuestion
        ? 'Finish'
        : 'Next'
      : isLastQuestion
        ? 'Grade'
        : 'Next';

  useEffect(() => {
    if (previousQuestionIdRef.current !== question.id) {
      celebratedRef.current = null;
      previousQuestionIdRef.current = question.id;
    }
  }, [question.id]);

  useEffect(() => {
    setIsBreakdownOpen(false);
  }, [question.id]);

  useEffect(() => {
    if (stage !== 'browser' || mode !== 'review' || !evaluation?.isCorrect) {
      return;
    }

    if (celebratedRef.current === question.id) {
      return;
    }

    celebratedRef.current = question.id;

    void confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 32,
      origin: { x: 0.5, y: 0 },
      scalar: 0.9,
    });
  }, [evaluation?.isCorrect, mode, question.id, stage]);

  useEffect(() => {
    if (!hasBreakdown || evaluation?.isCorrect !== false) {
      return;
    }

    setIsBreakdownOpen(true);
  }, [evaluation?.isCorrect, hasBreakdown]);

  return (
    <section className={styles.screen}>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.chrome}>
        <div className={styles.topRail}>
          <button type="button" className={styles.toolbarButton} onClick={onReturnToModes} aria-label="Back to modes">
            <Icon name="arrowLeft" />
            <span>
              {question.sequence} / {questionCount}
            </span>
          </button>
          <div className={styles.topRailEnd}>
            {scoreLabel ? <Text tone="soft" className={styles.scorePill}>{scoreLabel}</Text> : null}
            <button type="button" className={styles.toolbarButton} onClick={onToggleReference} aria-label="Open reference">
              <Icon name="book" />
              <span>Reference</span>
            </button>
          </div>
        </div>

        <main className={styles.main}>
          <QuestionWorkspace
            question={question}
            response={response}
            evaluation={evaluation}
            questionHelp={questionHelp}
            guidedStepResponses={guidedStepResponses}
            isBreakdownOpen={isBreakdownOpen}
            showReviewState={isPostTestReview}
            onBreakdownComplete={() => setIsBreakdownOpen(false)}
            onGuidedStepResponseChange={onGuidedStepResponseChange}
            onResponseChange={onResponseChange}
          />

          {evaluation && (isPostTestReview || !evaluation.isCorrect) ? (
            <AnswerFeedbackPanel
              question={question}
              response={response}
              evaluation={evaluation}
            />
          ) : null}

          {showHelpButton ? (
            <button type="button" className={styles.helpFab} onClick={onToggleHelp} aria-label="Open review help">
              <Icon name="spark" />
              <span>Help</span>
            </button>
          ) : null}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerSlotStart}>
            <Button variant="ghost" onClick={onPrevious} disabled={!canGoPrevious}>
              <span className={styles.buttonContent}>
                <Icon name="arrowLeft" />
                <span>Back</span>
              </span>
            </Button>
          </div>
          <div className={styles.footerSlotCenter}>
            {hasBreakdown ? (
              <Button
                variant={isBreakdownOpen ? 'secondary' : 'ghost'}
                className={styles.breakdownButton}
                onClick={() => setIsBreakdownOpen((current) => !current)}
              >
                <span className={styles.buttonContent}>
                  <Icon name="layers" />
                  <span className={styles.breakdownLabel}>Break Down</span>
                </span>
              </Button>
            ) : null}
          </div>
          <div className={styles.footerSlotEnd}>
            <Button onClick={onNext}>
              <span className={styles.buttonContent}>
                <span>{nextLabel}</span>
                <Icon name="arrowRight" />
              </span>
            </Button>
          </div>
        </footer>
      </div>

      <ReferenceDrawer isOpen={isReferenceOpen} references={references} onClose={onToggleReference} />
      {showHelpButton ? (
        <HelpDrawer
          isOpen={isHelpOpen}
          questionNumber={question.sequence}
          questionHelp={questionHelp}
          evaluation={evaluation}
          answerDisplay={question.answerDisplay}
          explanation={question.explanation}
          standard={standard}
          lessons={lessons}
          onClose={onToggleHelp}
        />
      ) : null}
    </section>
  );
}
