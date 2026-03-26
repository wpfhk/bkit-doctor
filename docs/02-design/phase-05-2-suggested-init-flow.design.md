# Phase 05-2: Suggested Init Flow — Design

## Architecture

```
buildRecommendations(results)
  → { recommendations[], unmappedCount, invalidCount }
      ↓
buildSuggestedFlow(recommendations, issueCount)
  → SuggestedFlow | null
      ↓
defaultFormatter (render)
  → "Recommended next step: bkit-doctor init --targets ..."
  → "Preview first:        bkit-doctor init --targets ... --dry-run"
```

## Types

### SuggestedFlow

```js
{
  targets:        string[],   // priority-sorted target names
  applyCommand:   string,     // "bkit-doctor init --targets a,b,c"
  previewCommand: string,     // "bkit-doctor init --targets a,b,c --dry-run"
  reasonSummary:  string,     // "N recommended targets from M issue(s)"
}
```

## Files

| File | Change |
|------|--------|
| `src/check/recommendations/suggestedFlowModel.js` | NEW — SuggestedFlow type + makeSuggestedFlow() |
| `src/check/recommendations/buildSuggestedFlow.js` | NEW — buildSuggestedFlow(recs, issueCount) |
| `src/check/recommendations/buildRecommendations.js` | UPDATE — TARGET_PRIORITY sort, invalidCount, export TARGET_PRIORITY |
| `src/check/formatters/defaultFormatter.js` | UPDATE — import buildSuggestedFlow, render flow |

## Priority Order (TARGET_PRIORITY)

Infrastructure → Config → Agents/Skills/Templates → Docs

```
claude-root → hooks-json → settings-local → policies-core →
agents-core → skills-core → templates-core → docs-core →
docs-plan → docs-design → docs-task → docs-report → docs-changelog
```

## Formatter Output Example

```
──── 추천 ──────────────────────────────
  12개 추천 target (14개 문제 기반)

  • claude-root — create the .claude/ root directory for bkit environment
  • hooks-json — create the default hooks.json file
  ...

  Recommended next step:
  bkit-doctor init --targets claude-root,hooks-json,...

  Preview first:
  bkit-doctor init --targets claude-root,hooks-json,... --dry-run
```
