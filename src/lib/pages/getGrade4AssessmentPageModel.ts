import assessment from '@/content/assessments/grade4-fast-review.json';
import standards from '@/content/standards/grade4-fast-standards.json';
import references from '@/content/reference/grade4-fast-reference.json';
import type {
  AssessmentDefinition,
  ReferenceSheet,
  StandardDefinition,
} from '@/types/assessment';

export function getGrade4AssessmentPageModel(): {
  assessment: AssessmentDefinition;
  standards: StandardDefinition[];
  references: ReferenceSheet;
} {
  return {
    assessment: assessment as AssessmentDefinition,
    standards: standards as StandardDefinition[],
    references: references as ReferenceSheet,
  };
}
