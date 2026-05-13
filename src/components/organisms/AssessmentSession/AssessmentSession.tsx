'use client';

import { useEffect, useState } from 'react';
import { useAssessmentSession } from '@/lib/assessment/useAssessmentSession';
import { getLessonResourcesForStandard } from '@/lib/review/getLessonResourcesForStandard';
import type {
  AssessmentDefinition,
  QuestionHelpEntryMap,
  ReferenceSheet,
  StandardDefinition,
} from '@/types/assessment';
import { AssessmentBrowser } from '../AssessmentBrowser/AssessmentBrowser';
import { AssessmentEntryScreen } from '../AssessmentEntryScreen/AssessmentEntryScreen';
import { SessionCompleteScreen } from '../SessionCompleteScreen/SessionCompleteScreen';
import { TestingReviewIntroScreen } from '../TestingReviewIntroScreen/TestingReviewIntroScreen';

export function AssessmentSession({
  assessment,
  standards,
  references,
  questionHelpEntries,
}: {
  assessment: AssessmentDefinition;
  standards: StandardDefinition[];
  references: ReferenceSheet;
  questionHelpEntries: QuestionHelpEntryMap;
}) {
  const session = useAssessmentSession(assessment);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [reportState, setReportState] = useState<{
    status: 'idle' | 'saving' | 'saved' | 'error';
    reportId?: string;
  }>({ status: 'idle' });

  function closePanels() {
    setIsReferenceOpen(false);
    setIsHelpOpen(false);
  }

  useEffect(() => {
    if (session.stage !== 'session-complete' || !session.sessionReport || reportState.status !== 'idle') {
      return;
    }

    let isCancelled = false;

    async function saveReport() {
      setReportState({ status: 'saving' });

      try {
        const response = await fetch('/api/session-reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(session.sessionReport),
        });

        if (!response.ok) {
          throw new Error('Could not save session report');
        }

        const payload = (await response.json()) as { reportId?: string };

        if (!isCancelled) {
          setReportState({
            status: 'saved',
            reportId: payload.reportId,
          });
        }
      } catch {
        if (!isCancelled) {
          setReportState({ status: 'error' });
        }
      }
    }

    void saveReport();

    return () => {
      isCancelled = true;
    };
  }, [reportState.status, session.sessionReport, session.stage]);

  if (session.stage === 'entry') {
    return (
      <AssessmentEntryScreen
        assessment={assessment}
        onStartReview={() => {
          closePanels();
          setReportState({ status: 'idle' });
          session.startSession('review');
        }}
        onStartTesting={() => {
          closePanels();
          setReportState({ status: 'idle' });
          session.startSession('testing');
        }}
      />
    );
  }

  if (session.stage === 'results-intro') {
    return (
      <TestingReviewIntroScreen
        correctCount={session.correctCount}
        totalQuestions={assessment.questions.length}
        onContinue={session.beginResultsReview}
      />
    );
  }

  if (session.stage === 'session-complete') {
    return (
      <SessionCompleteScreen
        mode={session.mode}
        correctCount={session.correctCount}
        totalQuestions={assessment.questions.length}
        reportState={reportState}
        onReturn={() => {
          closePanels();
          setReportState({ status: 'idle' });
          session.returnToEntry();
        }}
      />
    );
  }

  const standard = standards.find((item) => item.id === session.currentQuestion.standardId);
  const scoreLabel =
    session.stage === 'results'
      ? `${session.correctCount} correct of ${assessment.questions.length}`
      : undefined;

  return (
    <AssessmentBrowser
      stage={session.stage}
      mode={session.mode}
      question={session.currentQuestion}
      response={session.currentResponse}
      evaluation={session.currentEvaluation}
      standard={standard}
      lessons={getLessonResourcesForStandard(standard)}
      questionHelp={questionHelpEntries[session.currentQuestion.id]}
      references={references}
      isReferenceOpen={isReferenceOpen}
      isHelpOpen={isHelpOpen}
      guidedStepResponses={session.guidedStepResponses[session.currentQuestion.id]}
      questionCount={assessment.questions.length}
      currentIndex={session.currentIndex}
      scoreLabel={scoreLabel}
      canGoPrevious={session.canGoPrevious}
      isLastQuestion={session.isLastQuestion}
      onToggleReference={() => setIsReferenceOpen((current) => !current)}
      onToggleHelp={() => setIsHelpOpen((current) => !current)}
      onGuidedStepResponseChange={(stepId, optionId) =>
        session.updateGuidedStepResponse(session.currentQuestion.id, stepId, optionId)
      }
      onPrevious={session.goPrevious}
      onNext={() => {
        const result = session.advance();
        if (session.stage === 'browser' && session.mode === 'review' && result && !result.isCorrect) {
          setIsHelpOpen(true);
        }
        if (session.stage === 'results' && session.isLastQuestion) {
          setIsReferenceOpen(false);
          setIsHelpOpen(false);
        }
      }}
      onReturnToModes={() => {
        closePanels();
        session.returnToEntry();
      }}
      onResponseChange={(nextValue) => session.updateResponse(session.currentQuestion.id, nextValue)}
    />
  );
}
