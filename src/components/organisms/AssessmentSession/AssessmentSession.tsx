'use client';

import { useState } from 'react';
import { useAssessmentSession } from '@/lib/assessment/useAssessmentSession';
import { getLessonResourcesForStandard } from '@/lib/review/getLessonResourcesForStandard';
import { getQuestionHelpForQuestion } from '@/lib/review/getQuestionHelpForQuestion';
import type { AssessmentDefinition, ReferenceSheet, StandardDefinition } from '@/types/assessment';
import { AssessmentBrowser } from '../AssessmentBrowser/AssessmentBrowser';
import { AssessmentEntryScreen } from '../AssessmentEntryScreen/AssessmentEntryScreen';
import { ReviewCompleteScreen } from '../ReviewCompleteScreen/ReviewCompleteScreen';

export function AssessmentSession({
  assessment,
  standards,
  references,
}: {
  assessment: AssessmentDefinition;
  standards: StandardDefinition[];
  references: ReferenceSheet;
}) {
  const session = useAssessmentSession(assessment);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  function closePanels() {
    setIsReferenceOpen(false);
    setIsHelpOpen(false);
  }

  if (session.stage === 'entry') {
    return (
      <AssessmentEntryScreen
        assessment={assessment}
        onStartReview={() => {
          closePanels();
          session.startSession('review');
        }}
        onStartTesting={() => {
          closePanels();
          session.startSession('testing');
        }}
      />
    );
  }

  if (session.stage === 'review-complete') {
    return (
      <ReviewCompleteScreen
        totalQuestions={assessment.questions.length}
        onReturn={() => {
          closePanels();
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
      questionHelp={getQuestionHelpForQuestion(session.currentQuestion.id)}
      references={references}
      isReferenceOpen={isReferenceOpen}
      isHelpOpen={isHelpOpen}
      questionCount={assessment.questions.length}
      currentIndex={session.currentIndex}
      scoreLabel={scoreLabel}
      canGoPrevious={session.canGoPrevious}
      isLastQuestion={session.isLastQuestion}
      onToggleReference={() => setIsReferenceOpen((current) => !current)}
      onToggleHelp={() => setIsHelpOpen((current) => !current)}
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
