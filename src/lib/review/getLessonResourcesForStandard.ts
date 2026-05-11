import lessons from '@/content/review/grade4-fast-lessons.json';
import type { LessonResource, StandardDefinition } from '@/types/assessment';

interface LessonRule extends LessonResource {
  matchPrefixes?: string[];
}

export function getLessonResourcesForStandard(standard: StandardDefinition | undefined): LessonResource[] {
  if (!standard) {
    return [];
  }

  return (lessons as LessonRule[]).filter((lesson) =>
    lesson.matchPrefixes?.some((prefix) => standard.id.startsWith(prefix)),
  );
}
