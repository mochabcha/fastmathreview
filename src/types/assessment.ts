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
  explanation?: string;
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

export type QuestionHelpEntryMap = Record<string, QuestionHelpEntry>;
export type PartialQuestionHelpEntryMap = Record<string, Partial<QuestionHelpEntry>>;

export interface KeywordCatalogEntry {
  phrase: string;
  rationale: string;
}

export interface OperationKeywordCatalog {
  addition: KeywordCatalogEntry[];
  subtraction: KeywordCatalogEntry[];
  multiplication: KeywordCatalogEntry[];
  division: KeywordCatalogEntry[];
  equalGroups: KeywordCatalogEntry[];
}

export interface QuestionTemplateParameter {
  id: string;
  label: string;
  type: 'integer' | 'decimal' | 'text';
  example: string;
  notes?: string;
}

export interface QuestionTemplateChoice {
  id: string;
  contentTemplate: string;
  isCorrect: boolean;
  rationale: string;
}

export interface GuidedStepTemplate {
  id: string;
  title: string;
  promptTemplate: string;
  explanationTemplate: string;
}

export interface QuestionFormatTemplate {
  id: string;
  title: string;
  standardIds: string[];
  answerType: 'single' | 'multi' | 'value';
  operationFocus: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed' | 'measurement';
  promptTemplate: string;
  answerLabel?: string;
  answerDisplayTemplate: string;
  explanationTemplate: string;
  mathSetupTemplate: string;
  translationTemplate: string;
  parameters: QuestionTemplateParameter[];
  choiceTemplates?: QuestionTemplateChoice[];
  guidedStepTemplates: GuidedStepTemplate[];
  authorNotes: string[];
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
