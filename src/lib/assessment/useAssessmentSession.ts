'use client';

import { useEffect, useMemo, useState } from 'react';
import { evaluateQuestion } from './evaluateQuestion';
import type {
  AssessmentDefinition,
  AssessmentMode,
  AssessmentQuestion,
  EvaluationResult,
  QuestionResponseValue,
} from '@/types/assessment';

type AssessmentStage = 'entry' | 'browser' | 'results' | 'review-complete';

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
      };

      setStage(parsed.stage);
      setMode(parsed.mode);
      setCurrentIndex(parsed.currentIndex);
      setResponses(parsed.responses);
      setEvaluations(parsed.evaluations);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ stage, mode, currentIndex, responses, evaluations }),
    );
  }, [currentIndex, evaluations, mode, responses, stage, storageKey]);

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
  }

  function returnToEntry() {
    setStage('entry');
    setCurrentIndex(0);
    setResponses({});
    setEvaluations({});
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
      setStage('results');
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
      setStage('review-complete');
      return result;
    }

    setCurrentIndex((current) => current + 1);
    return result;
  }

  function advance() {
    if (stage === 'results') {
      if (isLastQuestion) {
        returnToEntry();
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
    setStage('results');
  }

  function retryCurrentQuestion() {
    setResponses((current) => {
      const next = { ...current };
      delete next[currentQuestion.id];
      return next;
    });
    clearEvaluation(currentQuestion.id);
  }

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
    advance,
    goPrevious: () => setCurrentIndex((current) => Math.max(current - 1, 0)),
    retryCurrentQuestion,
    finishTestingNow,
  };
}
