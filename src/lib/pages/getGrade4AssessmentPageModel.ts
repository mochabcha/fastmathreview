import assessment from '@/content/assessments/grade4-fast-review.json';
import questionHelpEntries from '@/content/review/grade4-fast-question-help.json';
import problemSupportEntries from '@/content/review/grade4-fast-problem-support.json';
import operationKeywords from '@/content/review/grade4-fast-operation-keywords.json';
import standards from '@/content/standards/grade4-fast-standards.json';
import references from '@/content/reference/grade4-fast-reference.json';
import {
  getAssessmentContent,
  getKeywordCatalogContent,
  getProblemSupportContent,
  getQuestionHelpContent,
  getReferenceContent,
  getStandardsContent,
} from '@/lib/server/contentStore';
import { resolveQuestionHelpEntries } from '@/lib/review/resolveQuestionHelpEntries';
import type {
  AssessmentDefinition,
  OperationKeywordCatalog,
  PartialQuestionHelpEntryMap,
  QuestionHelpEntryMap,
  ReferenceSheet,
  StandardDefinition,
} from '@/types/assessment';

export async function getGrade4AssessmentPageModel(): Promise<{
  assessment: AssessmentDefinition;
  standards: StandardDefinition[];
  references: ReferenceSheet;
  questionHelpEntries: QuestionHelpEntryMap;
}> {
  const fallbackAssessment = assessment as AssessmentDefinition;
  const fallbackStandards = standards as StandardDefinition[];
  const fallbackReferences = references as ReferenceSheet;
  const fallbackQuestionHelpEntries = questionHelpEntries as QuestionHelpEntryMap;
  const fallbackProblemSupportEntries = problemSupportEntries as PartialQuestionHelpEntryMap;
  const fallbackKeywordCatalog = operationKeywords as OperationKeywordCatalog;

  const [
    resolvedAssessment,
    resolvedStandards,
    resolvedReferences,
    resolvedQuestionHelpEntries,
    resolvedProblemSupportEntries,
    resolvedKeywordCatalog,
  ] = await Promise.all([
    getAssessmentContent(fallbackAssessment),
    getStandardsContent(fallbackStandards),
    getReferenceContent(fallbackReferences),
    getQuestionHelpContent(fallbackQuestionHelpEntries),
    getProblemSupportContent(fallbackProblemSupportEntries),
    getKeywordCatalogContent(fallbackKeywordCatalog),
  ]);

  return {
    assessment: resolvedAssessment,
    standards: resolvedStandards,
    references: resolvedReferences,
    questionHelpEntries: resolveQuestionHelpEntries({
      questions: resolvedAssessment.questions,
      helpEntries: resolvedQuestionHelpEntries,
      supportEntries: resolvedProblemSupportEntries,
      keywordCatalog: resolvedKeywordCatalog,
    }),
  };
}
