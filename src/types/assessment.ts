export type AssessmentMode = 'testing' | 'review';

export interface AssessmentCategory {
  id: string;
  title: string;
  shortTitle: string;
  benchmarkShare: string;
  description: string;
}

export interface StandardDefinition {
  id: string;
  strand: string;
  categoryId: string;
  title: string;
  summary: string;
}

export interface LessonResource {
  id: string;
  title: string;
  href: string;
  provider: string;
  summary?: string;
  videos?: VideoLesson[];
}

export interface VideoLesson {
  id: string;
  title: string;
  youtubeId: string;
}

export interface ReferenceGroup {
  id: string;
  title: string;
  items: string[];
}

export interface ReferenceSheet {
  title: string;
  groups: ReferenceGroup[];
}

export type OperationHint =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'comparison'
  | 'measurement';

export interface KeywordHint {
  phrase: string;
  operation: OperationHint;
  rationale: string;
}

export interface GuidedStepOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface GuidedStepPrompt {
  id: string;
  title: string;
  prompt: string;
  options: GuidedStepOption[];
}

export interface QuestionHelpEntry {
  mathSetup: string;
  translation: string;
  keywords?: KeywordHint[];
  guidedSteps?: GuidedStepPrompt[];
}

export interface ChoiceOption {
  id: string;
  content: string;
}

export type ValueValidation =
  | {
      kind: 'numeric';
      acceptableValues: string[];
    }
  | {
      kind: 'exact';
      acceptableValues: string[];
    };

interface QuestionBase {
  id: string;
  sequence: number;
  standardId: string;
  prompt: string;
  contextLines?: string[];
  answerLabel?: string;
  explanation: string;
  answerDisplay: string;
  referenceGroupIds?: string[];
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single';
  options: ChoiceOption[];
  correctOptionIds: string[];
}

export interface MultiChoiceQuestion extends QuestionBase {
  type: 'multi';
  options: ChoiceOption[];
  correctOptionIds: string[];
}

export interface ValueQuestion extends QuestionBase {
  type: 'value';
  validation: ValueValidation;
}

export type AssessmentQuestion = SingleChoiceQuestion | MultiChoiceQuestion | ValueQuestion;

export interface AssessmentDefinition {
  id: string;
  title: string;
  subtitle: string;
  sourceNote: string;
  questions: AssessmentQuestion[];
}

export type QuestionResponseValue =
  | {
      type: 'single';
      selectedOptionIds: string[];
    }
  | {
      type: 'multi';
      selectedOptionIds: string[];
    }
  | {
      type: 'value';
      value: string;
    };

export interface EvaluationResult {
  isCorrect: boolean;
  expectedSummary: string;
}

export type GuidedStepResponseMap = Record<string, string>;

export interface QuestionSessionReport {
  questionId: string;
  standardId: string;
  prompt: string;
  response?: QuestionResponseValue;
  evaluation?: EvaluationResult;
  guidedStepResponses?: GuidedStepResponseMap;
}

export interface AssessmentSessionReport {
  assessmentId: string;
  assessmentTitle: string;
  mode: AssessmentMode;
  startedAt: string;
  completedAt: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  questionReports: QuestionSessionReport[];
}

export interface AssessmentOverview {
  kicker: string;
  title: string;
  summary: string;
  highlights: string[];
}
