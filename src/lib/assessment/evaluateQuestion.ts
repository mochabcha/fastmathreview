import type {
  AssessmentQuestion,
  EvaluationResult,
  QuestionResponseValue,
  ValueQuestion,
} from '@/types/assessment';
import { normalizeNumericText, normalizeText } from './normalize';

function sortedArraysMatch(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    [...left].sort().every((item, index) => item === [...right].sort()[index])
  );
}

function evaluateValueQuestion(question: ValueQuestion, value: string) {
  if (!value.trim()) {
    return false;
  }

  switch (question.validation.kind) {
    case 'numeric': {
      const normalizedValue = normalizeNumericText(value);
      return question.validation.acceptableValues.some(
        (candidate) => normalizeNumericText(candidate) === normalizedValue,
      );
    }
    case 'exact': {
      const normalizedValue = normalizeText(value);
      return question.validation.acceptableValues.some(
        (candidate) => normalizeText(candidate) === normalizedValue,
      );
    }
    default:
      return false;
  }
}

export function evaluateQuestion(
  question: AssessmentQuestion,
  response: QuestionResponseValue | undefined,
): EvaluationResult {
  if (!response) {
    return {
      isCorrect: false,
      expectedSummary: question.answerDisplay,
    };
  }

  switch (question.type) {
    case 'single':
    case 'multi': {
      if (response.type !== question.type) {
        return { isCorrect: false, expectedSummary: question.answerDisplay };
      }

      return {
        isCorrect: sortedArraysMatch(response.selectedOptionIds, question.correctOptionIds),
        expectedSummary: question.answerDisplay,
      };
    }
    case 'value': {
      if (response.type !== 'value') {
        return { isCorrect: false, expectedSummary: question.answerDisplay };
      }

      return {
        isCorrect: evaluateValueQuestion(question, response.value),
        expectedSummary: question.answerDisplay,
      };
    }
  }

  throw new Error(`Unsupported question type: ${(question as AssessmentQuestion).type}`);
}
