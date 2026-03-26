# Phase 05-2: Suggested Init Flow — Plan

## Objective

Separate recommendation calculation from command string generation.
Introduce `SuggestedFlow` as a model object so formatters render data, not build strings.

## Scope

- `SuggestedFlow` model (type + factory)
- `buildSuggestedFlow` builder (Recommendation[] → SuggestedFlow|null)
- `buildRecommendations` update (TARGET_PRIORITY sort + invalidCount)
- `defaultFormatter` update (render flow.applyCommand + flow.previewCommand)

## Out of Scope

- `init --recommended` flag (Phase 5-3)
- Snapshot reuse (Phase 5-3)
- Interactive selection UI

## Key Decisions

- A: Command strings live in `SuggestedFlow` model, not in formatter — clean separation
- B: `buildSuggestedFlow` returns `null` when recommendations is empty — caller decides rendering
- C: Both `applyCommand` and `previewCommand` exposed — formatter shows both
- D: `invalidCount` surfaced to formatter for transparency
