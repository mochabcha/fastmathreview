# Question Format Library

This project now has a reusable format catalog for generating new questions by plugging in values.

Source file:

- [grade4-fast-question-formats.json](/mnt/THEATTIC/dev/fast-math-review/src/content/templates/grade4-fast-question-formats.json)

Each format includes:

- `promptTemplate`
- `mathSetupTemplate`
- `translationTemplate`
- `explanationTemplate`
- placeholder `parameters`
- optional `choiceTemplates`
- `guidedStepTemplates`

## Current standard formats

### 1. Equal Groups Total Unknown

Use when:

- one amount repeats in each group
- the total is unknown

Examples:

- muffins in trays
- stickers in packs
- chairs in rows

Core structure:

```text
{{groupSize}} in each group × {{groupCount}} groups
```

### 2. Equal Groups Group Size Unknown

Use when:

- a total is shared equally
- number of groups is known
- amount in each group is unknown

Examples:

- pencils in boxes
- bottles for teams
- counters on tables

Core structure:

```text
{{total}} ÷ {{groupCount}}
```

### 3. Equal Groups Number of Groups Unknown

Use when:

- total is known
- group size is known
- number of full groups is unknown

Examples:

- buses needed
- bags that can be filled
- boxes required

Core structure:

```text
{{total}} ÷ {{groupSize}}
```

Remainder rule:

- decide whether the remainder is ignored, kept as a fraction, or means one more group is needed

### 4. Decimal Combine Total

Use when:

- two money or measurement amounts are combined

Examples:

- total cost
- total distance
- total weight

Core structure:

```text
{{amountA}} + {{amountB}}
```

### 5. Decimal Change From Payment

Use when:

- total cost must be found first
- payment amount is known
- change is unknown

Core structure:

```text
{{payment}} - ({{costA}} + {{costB}})
```

### 6. Measurement Conversion

Use when:

- one customary unit is converted to another

Examples:

- yards to feet
- quarts to cups
- hours and minutes

Core structure:

```text
{{quantity}} × or ÷ conversion fact
```

### 7. Rectangle Area and Perimeter

Use when:

- length and width are known
- area and/or perimeter must be found or compared

Core structures:

```text
Area = length × width
Perimeter = length + length + width + width
```

### 8. Angle Part-Whole

Use when:

- a whole angle is decomposed into parts
- one part is unknown

Core structure:

```text
unknown part + known part = whole angle
```

## Recommended future additions

These are not yet encoded in the template JSON, but they fit the system well:

- decimal comparison and ordering
- equivalent fraction matching
- fraction addition with like denominators
- mixed-number addition with tenths
- area/perimeter same-area-different-perimeter comparison
- line-plot interpretation and mode/median/range extraction

## Generation workflow

Recommended generation path:

1. Pick a `question format`.
2. Fill the `parameters`.
3. Render:
   - `promptTemplate`
   - `answerDisplayTemplate`
   - `explanationTemplate`
   - `mathSetupTemplate`
   - `translationTemplate`
4. If it is multiple choice:
   - render the correct choice
   - generate 2-3 distractors using the template rationale
5. Render the 3 guided breakdown steps:
   - important values
   - operation
   - main question
6. Sync the generated content into Mongo with `npm run sync:content`.

## Distractor rules

Good distractors should come from predictable student mistakes:

- adding instead of multiplying
- subtracting instead of comparing
- using the wrong conversion direction
- ignoring the remainder
- choosing the wrong quantity as the final answer
- confusing area with perimeter

## Best authoring pattern

For new content, keep one template-driven source object that can generate all of these fields together:

- question prompt
- answer choices or value answer
- explanation
- keyword support
- guided breakdown steps

That keeps the assessment JSON, help JSON, and problem-support JSON aligned instead of hand-authoring them separately.
