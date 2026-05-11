'use client';

import { Button, Icon, Text } from '@/components/atoms';
import { QuestionWorkspace } from '../QuestionWorkspace/QuestionWorkspace';
import { HelpDrawer } from '../HelpDrawer/HelpDrawer';
import { ReferenceDrawer } from '../ReferenceDrawer/ReferenceDrawer';
import type {
  AssessmentMode,
  AssessmentQuestion,
  EvaluationResult,
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
  questionCount,
  currentIndex,
  scoreLabel,
  canGoPrevious,
  isLastQuestion,
  onToggleReference,
  onToggleHelp,
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
  questionCount: number;
  currentIndex: number;
  scoreLabel?: string;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  onToggleReference: () => void;
  onToggleHelp: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReturnToModes: () => void;
  onResponseChange: (nextValue: QuestionResponseValue) => void;
}) {
  const progressPercent = ((currentIndex + 1) / questionCount) * 100;
  const isPostTestReview = stage === 'results';
  const showHelpButton = mode === 'review' || isPostTestReview;

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
            questionCount={questionCount}
            onResponseChange={onResponseChange}
          />

          {showHelpButton ? (
            <button type="button" className={styles.helpFab} onClick={onToggleHelp} aria-label="Open review help">
              <Icon name="spark" />
              <span>Help</span>
            </button>
          ) : null}
        </main>

        <footer className={styles.footer}>
          <div className={styles.navDock}>
            <Button variant="ghost" onClick={onPrevious} disabled={!canGoPrevious}>
              <span className={styles.buttonContent}>
                <Icon name="arrowLeft" />
                <span>Back</span>
              </span>
            </Button>
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
