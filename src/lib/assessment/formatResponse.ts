import type { AssessmentQuestion, QuestionResponseValue } from '@/types/assessment';

function formatChoiceResponse(question: AssessmentQuestion, selectedOptionIds: string[]) {
  if (question.type !== 'single' && question.type !== 'multi') {
    return selectedOptionIds.join(', ');
  }

  return selectedOptionIds
    .map((optionId) => question.options.find((option) => option.id === optionId)?.content ?? optionId)
    .join(', ');
}

export function formatResponse(
  question: AssessmentQuestion,
  response: QuestionResponseValue | undefined,
): string {
  if (!response) {
    return 'No answer selected';
  }

  switch (response.type) {
    case 'single':
    case 'multi':
      return formatChoiceResponse(question, response.selectedOptionIds);
    case 'value':
      return response.value.trim() || 'No answer entered';
    default:
      return 'No answer selected';
  }
}
