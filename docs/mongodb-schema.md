# MongoDB Schema

The app uses two MongoDB collections:

- `content`
- `sessionReports`

## `content`

This collection stores versioned JSON blobs by `key`. The app reads these at runtime through the server content store.

Document shape:

```json
{
  "_id": "ObjectId",
  "key": "assessment:grade4-fast-review",
  "value": {},
  "updatedAt": "2026-05-13T03:36:14.740Z"
}
```

Current keys:

- `assessment:grade4-fast-review`
- `standards:grade4-fast-standards`
- `references:grade4-fast-reference`
- `question-help:grade4-fast-question-help`
- `problem-support:grade4-fast-problem-support`
- `keyword-catalog:grade4-fast-operation-keywords`
- `question-templates:grade4-fast-question-formats`

### `assessment:grade4-fast-review`

Top-level assessment definition.

```ts
interface AssessmentDefinition {
  id: string;
  title: string;
  subtitle: string;
  sourceNote: string;
  questions: AssessmentQuestion[];
}
```

```ts
type AssessmentQuestion = SingleChoiceQuestion | MultiChoiceQuestion | ValueQuestion;

interface QuestionBase {
  id: string;                // Stable ID like "q5"
  sequence: number;          // Display order
  standardId: string;        // BEST benchmark ID
  prompt: string;            // Main question sentence
  contextLines?: string[];   // Optional supporting lines under prompt
  answerLabel?: string;      // For value-entry items
  explanation: string;       // Main answer explanation
  answerDisplay: string;     // Human-readable correct answer
  referenceGroupIds?: string[];
}

interface SingleChoiceQuestion extends QuestionBase {
  type: 'single';
  options: { id: string; content: string }[];
  correctOptionIds: string[]; // Exactly one ID
}

interface MultiChoiceQuestion extends QuestionBase {
  type: 'multi';
  options: { id: string; content: string }[];
  correctOptionIds: string[]; // One or more IDs
}

interface ValueQuestion extends QuestionBase {
  type: 'value';
  validation:
    | { kind: 'numeric'; acceptableValues: string[] }
    | { kind: 'exact'; acceptableValues: string[] };
}
```

Question authoring rules:

- `id` should stay stable forever once created.
- `sequence` should stay unique within the assessment.
- `standardId` must match a standard in `standards:grade4-fast-standards`.
- `answerDisplay` should be student-readable, not just machine-readable.
- For `single`, use one correct ID.
- For `multi`, list every correct ID.
- For `value`, keep `acceptableValues` normalized as strings.

### `question-help:grade4-fast-question-help`

Base setup/explanation content per question.

```ts
type QuestionHelpEntryMap = Record<string, QuestionHelpEntry>;

interface QuestionHelpEntry {
  mathSetup: string;
  translation: string;
  keywords?: KeywordHint[];
  guidedSteps?: GuidedStepPrompt[];
}
```

This document is the base help layer. It is merged with `problem-support:grade4-fast-problem-support`.

### `problem-support:grade4-fast-problem-support`

Per-question support extensions, primarily:

- inline keyword overrides
- 3-step breakdown content

```ts
type PartialQuestionHelpEntryMap = Record<string, Partial<QuestionHelpEntry>>;
```

### `guidedSteps`

Breakdown-mode structure:

```ts
interface GuidedStepPrompt {
  id: string;         // "values" | "operation" | "question" recommended
  title: string;
  prompt: string;
  options: GuidedStepOption[];
}

interface GuidedStepOption {
  id: string;         // "A", "B", "C", etc.
  content: string;
  isCorrect: boolean;
  explanation?: string; // Optional explicit feedback shown after selection
}
```

Authoring rules:

- Every step must have exactly one `isCorrect: true`.
- Use 3 steps in this order when possible:
  - `values`
  - `operation`
  - `question`
- `explanation` is optional but recommended. If omitted, the app generates a fallback explanation from the step type.

### `keyword-catalog:grade4-fast-operation-keywords`

Shared keyword library used to auto-highlight phrases found in prompts and context lines.

```ts
interface OperationKeywordCatalog {
  addition: { phrase: string; rationale: string }[];
  subtraction: { phrase: string; rationale: string }[];
  multiplication: { phrase: string; rationale: string }[];
  division: { phrase: string; rationale: string }[];
  equalGroups: { phrase: string; rationale: string }[];
}
```

Notes:

- You do not need to add every keyword manually to each question.
- The app now scans question text for these phrases and merges matches with question-specific keyword overrides.
- If a question needs a special phrase not in the global catalog, add it to `problem-support`.

### `question-templates:grade4-fast-question-formats`

Reusable authoring formats for generating new questions from placeholders.

Source file:

- [grade4-fast-question-formats.json](/mnt/THEATTIC/dev/fast-math-review/src/content/templates/grade4-fast-question-formats.json)

## `sessionReports`

This collection stores completed student sessions.

```ts
interface AssessmentSessionReport {
  assessmentId: string;
  assessmentTitle: string;
  mode: 'testing' | 'review';
  startedAt: string;
  completedAt: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  questionReports: QuestionSessionReport[];
}

interface QuestionSessionReport {
  questionId: string;
  standardId: string;
  prompt: string;
  response?: QuestionResponseValue;
  evaluation?: {
    isCorrect: boolean;
    expectedSummary: string;
  };
  guidedStepResponses?: Record<string, string>;
}
```

Stored document shape:

```json
{
  "_id": "ObjectId",
  "assessmentId": "grade4-fast-review",
  "assessmentTitle": "Florida FAST Grade 4 Math Review",
  "mode": "review",
  "startedAt": "2026-05-13T03:00:00.000Z",
  "completedAt": "2026-05-13T03:15:00.000Z",
  "correctCount": 42,
  "totalQuestions": 50,
  "scorePercent": 84,
  "questionReports": [],
  "createdAt": "2026-05-13T03:15:00.000Z"
}
```

## Adding a new question

1. Add the question to `assessment:grade4-fast-review`.
2. Add or update its base help entry in `question-help:grade4-fast-question-help`.
3. If it is a word problem, add `guidedSteps` in `problem-support:grade4-fast-problem-support`.
4. Add any missing phrase to `keyword-catalog:grade4-fast-operation-keywords` only if the global list does not already cover it.
5. Run `npm run sync:content` to push the latest JSON into Atlas.

## Sync path

The sync script is:

- [sync-content-to-mongo.mjs](/mnt/THEATTIC/dev/fast-math-review/scripts/sync-content-to-mongo.mjs)

Command:

```bash
npm run sync:content
```
