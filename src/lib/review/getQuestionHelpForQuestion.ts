import helpEntries from '@/content/review/grade4-fast-question-help.json';
import problemSupportEntries from '@/content/review/grade4-fast-problem-support.json';
import type { QuestionHelpEntry } from '@/types/assessment';

export function getQuestionHelpForQuestion(questionId: string): QuestionHelpEntry | undefined {
  const entries = helpEntries as Record<string, QuestionHelpEntry>;
  const problemSupport = problemSupportEntries as Record<string, Partial<QuestionHelpEntry>>;
  const helpEntry = entries[questionId];
  const supportEntry = problemSupport[questionId];

  if (!helpEntry && !supportEntry) {
    return undefined;
  }

  return {
    ...(helpEntry ?? { mathSetup: '', translation: '' }),
    ...(supportEntry ?? {}),
  };
}
