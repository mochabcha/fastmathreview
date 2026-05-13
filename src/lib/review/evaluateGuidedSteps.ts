import type {
  GuidedStepOption,
  GuidedStepPrompt,
  GuidedStepResponseMap,
} from '@/types/assessment';

export interface GuidedStepEvaluation {
  stepId: string;
  selectedOptionId?: string;
  selectedOption?: GuidedStepOption;
  correctOption: GuidedStepOption;
  isAnswered: boolean;
  isCorrect: boolean;
  explanation: string;
}

function getFallbackExplanation(step: GuidedStepPrompt, correctOption: GuidedStepOption) {
  const normalizedStep = `${step.id} ${step.title}`.toLowerCase();

  if (normalizedStep.includes('value')) {
    return `${correctOption.content} are the quantities that belong in the setup. Those are the numbers and units the problem actually uses.`;
  }

  if (normalizedStep.includes('operation')) {
    return `${correctOption.content} matches the relationship in the word problem, so that is the operation you should use to solve it.`;
  }

  if (normalizedStep.includes('question')) {
    return `${correctOption.content} names the actual quantity the problem is asking you to find at the end.`;
  }

  return `${correctOption.content} is the best match for the structure of this problem.`;
}

export function evaluateGuidedStep(
  step: GuidedStepPrompt,
  selectedOptionId?: string,
): GuidedStepEvaluation {
  const correctOption = step.options.find((option) => option.isCorrect);

  if (!correctOption) {
    throw new Error(`Guided step "${step.id}" is missing a correct option.`);
  }

  const selectedOption = step.options.find((option) => option.id === selectedOptionId);

  return {
    stepId: step.id,
    selectedOptionId,
    selectedOption,
    correctOption,
    isAnswered: Boolean(selectedOptionId),
    isCorrect: selectedOption?.id === correctOption.id,
    explanation: correctOption.explanation ?? getFallbackExplanation(step, correctOption),
  };
}

export function areAllGuidedStepsCorrect(
  steps: GuidedStepPrompt[],
  responses: GuidedStepResponseMap | undefined,
) {
  return steps.length > 0 && steps.every((step) => evaluateGuidedStep(step, responses?.[step.id]).isCorrect);
}
