'use client';

import { useEffect, useMemo, useState } from 'react';
import { evaluateQuestion } from './evaluateQuestion';
import type {
  AssessmentDefinition,
  AssessmentSessionReport,
  GuidedStepResponseMap,
  AssessmentMode,
  AssessmentQuestion,
  EvaluationResult,
  QuestionResponseValue,
} from '@/types/assessment';

type AssessmentStage = 'entry' | 'browser' | 'results-intro' | 'results' | 'session-complete';

const STORAGE_PREFIX = 'fast-math-review-session';

function isAnswered(response: QuestionResponseValue | undefined) {
  if (!response) {
    return false;
  }

  switch (response.type) {
    case 'single':
    case 'multi':
      return response.selectedOptionIds.length > 0;
    case 'value':
      return response.value.trim().length > 0;
    default:
      return false;
  }
}

function evaluateAllQuestions(
  questions: AssessmentQuestion[],
  responses: Record<string, QuestionResponseValue>,
) {
  return questions.reduce<Record<string, EvaluationResult>>((accumulator, question) => {
    accumulator[question.id] = evaluateQuestion(question, responses[question.id]);
    return accumulator;
  }, {});
}

export function useAssessmentSession(assessment: AssessmentDefinition) {
  const storageKey = `${STORAGE_PREFIX}:${assessment.id}`;
  const [stage, setStage] = useState<AssessmentStage>('entry');
  const [mode, setMode] = useState<AssessmentMode>('review');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponseValue>>({});
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationResult>>({});
  const [guidedStepResponses, setGuidedStepResponses] = useState<Record<string, GuidedStepResponseMap>>({});
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        stage: AssessmentStage;
        mode: AssessmentMode;
        currentIndex: number;
        responses: Record<string, QuestionResponseValue>;
        evaluations: Record<string, EvaluationResult>;
        guidedStepResponses: Record<string, GuidedStepResponseMap>;
        startedAt: string | null;
        completedAt: string | null;
      };

      setStage(parsed.stage);
      setMode(parsed.mode);
      setCurrentIndex(parsed.currentIndex);
      setResponses(parsed.responses);
      setEvaluations(parsed.evaluations);
      setGuidedStepResponses(parsed.guidedStepResponses ?? {});
      setStartedAt(parsed.startedAt ?? null);
      setCompletedAt(parsed.completedAt ?? null);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        stage,
        mode,
        currentIndex,
        responses,
        evaluations,
        guidedStepResponses,
        startedAt,
        completedAt,
      }),
    );
  }, [completedAt, currentIndex, evaluations, guidedStepResponses, mode, responses, stage, startedAt, storageKey]);

  const totalQuestions = assessment.questions.length;
  const currentQuestion = assessment.questions[currentIndex];
  const answeredCount = assessment.questions.filter((question) => isAnswered(responses[question.id])).length;
  const correctCount = Object.values(evaluations).filter((result) => result.isCorrect).length;
  const incorrectCount = Object.values(evaluations).filter((result) => !result.isCorrect).length;

  const currentResponse = currentQuestion ? responses[currentQuestion.id] : undefined;
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : undefined;

  const canGoPrevious = currentIndex > 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const statuses = useMemo(() => {
    return assessment.questions.reduce<
      Record<string, 'unanswered' | 'in-progress' | 'correct' | 'incorrect'>
    >((accumulator, question) => {
      const evaluation = evaluations[question.id];
      if (evaluation) {
        accumulator[question.id] = evaluation.isCorrect ? 'correct' : 'incorrect';
        return accumulator;
      }

      accumulator[question.id] = isAnswered(responses[question.id]) ? 'in-progress' : 'unanswered';
      return accumulator;
    }, {});
  }, [assessment.questions, evaluations, responses]);

  function clearEvaluation(questionId: string) {
    setEvaluations((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function updateResponse(questionId: string, response: QuestionResponseValue) {
    setResponses((current) => ({ ...current, [questionId]: response }));
    clearEvaluation(questionId);
  }

  function startSession(nextMode: AssessmentMode) {
    setMode(nextMode);
    setStage('browser');
    setCurrentIndex(0);
    setResponses({});
    setEvaluations({});
    setGuidedStepResponses({});
    setStartedAt(new Date().toISOString());
    setCompletedAt(null);
  }

  function returnToEntry() {
    setStage('entry');
    setCurrentIndex(0);
    setResponses({});
    setEvaluations({});
    setGuidedStepResponses({});
    setStartedAt(null);
    setCompletedAt(null);
  }

  function checkCurrentQuestion() {
    const result = evaluateQuestion(currentQuestion, responses[currentQuestion.id]);
    setEvaluations((current) => ({ ...current, [currentQuestion.id]: result }));
    return result;
  }

  function goNextInTesting() {
    if (isLastQuestion) {
      const nextEvaluations = evaluateAllQuestions(assessment.questions, responses);
      setEvaluations(nextEvaluations);
      setCurrentIndex(0);
      setStage('results-intro');
      return nextEvaluations[currentQuestion.id];
    }

    setCurrentIndex((current) => current + 1);
    return undefined;
  }

  function goNextInReview() {
    const result = checkCurrentQuestion();

    if (!result.isCorrect) {
      return result;
    }

    if (isLastQuestion) {
      setCompletedAt(new Date().toISOString());
      setStage('session-complete');
      return result;
    }

    setCurrentIndex((current) => current + 1);
    return result;
  }

  function advance() {
    if (stage === 'results') {
      if (isLastQuestion) {
        setCompletedAt(new Date().toISOString());
        setStage('session-complete');
        return undefined;
      }

      setCurrentIndex((current) => current + 1);
      return currentEvaluation;
    }

    return mode === 'review' ? goNextInReview() : goNextInTesting();
  }

  function finishTestingNow() {
    const nextEvaluations = evaluateAllQuestions(assessment.questions, responses);
    setEvaluations(nextEvaluations);
    setCurrentIndex(0);
    setStage('results-intro');
  }

  function retryCurrentQuestion() {
    setResponses((current) => {
      const next = { ...current };
      delete next[currentQuestion.id];
      return next;
    });
    clearEvaluation(currentQuestion.id);
  }

  function beginResultsReview() {
    setCurrentIndex(0);
    setStage('results');
  }

  function updateGuidedStepResponse(questionId: string, stepId: string, optionId: string) {
    setGuidedStepResponses((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] ?? {}),
        [stepId]: optionId,
      },
    }));
  }

  const sessionReport: AssessmentSessionReport | null =
    startedAt && completedAt
      ? {
          assessmentId: assessment.id,
          assessmentTitle: assessment.title,
          mode,
          startedAt,
          completedAt,
          correctCount,
          totalQuestions,
          scorePercent,
          questionReports: assessment.questions.map((question) => ({
            questionId: question.id,
            standardId: question.standardId,
            prompt: question.prompt,
            response: responses[question.id],
            evaluation: evaluations[question.id],
            guidedStepResponses: guidedStepResponses[question.id],
          })),
        }
      : null;

  return {
    stage,
    mode,
    currentIndex,
    totalQuestions,
    currentQuestion,
    currentResponse,
    currentEvaluation,
    responses,
    evaluations,
    guidedStepResponses,
    statuses,
    answeredCount,
    correctCount,
    incorrectCount,
    scorePercent,
    canGoPrevious,
    isLastQuestion,
    startSession,
    returnToEntry,
    updateResponse,
    updateGuidedStepResponse,
    advance,
    beginResultsReview,
    goPrevious: () => setCurrentIndex((current) => Math.max(current - 1, 0)),
    retryCurrentQuestion,
    finishTestingNow,
    sessionReport,
  };
}
