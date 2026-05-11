import helpEntries from '@/content/review/grade4-fast-question-help.json';
import type { QuestionHelpEntry } from '@/types/assessment';

export function getQuestionHelpForQuestion(questionId: string): QuestionHelpEntry | undefined {
  const entries = helpEntries as Record<string, QuestionHelpEntry>;
  return entries[questionId];
}
