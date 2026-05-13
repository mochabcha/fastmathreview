import assessment from '@/content/assessments/grade4-fast-review.json';
import standards from '@/content/standards/grade4-fast-standards.json';
import references from '@/content/reference/grade4-fast-reference.json';
import {
  getAssessmentContent,
  getReferenceContent,
  getStandardsContent,
} from '@/lib/server/contentStore';
import type {
  AssessmentDefinition,
  ReferenceSheet,
  StandardDefinition,
} from '@/types/assessment';

export async function getGrade4AssessmentPageModel(): Promise<{
  assessment: AssessmentDefinition;
  standards: StandardDefinition[];
  references: ReferenceSheet;
}> {
  const fallbackAssessment = assessment as AssessmentDefinition;
  const fallbackStandards = standards as StandardDefinition[];
  const fallbackReferences = references as ReferenceSheet;

  const [resolvedAssessment, resolvedStandards, resolvedReferences] = await Promise.all([
    getAssessmentContent(fallbackAssessment),
    getStandardsContent(fallbackStandards),
    getReferenceContent(fallbackReferences),
  ]);

  return {
    assessment: resolvedAssessment,
    standards: resolvedStandards,
    references: resolvedReferences,
  };
}
