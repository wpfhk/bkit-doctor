# Phase 05-3: init --recommended MVP — Design

## Flow

```
bkit-doctor init --recommended [--dry-run]
  ↓
computeRecommendations(projectRoot)
  → CheckerRunner.run() + buildRecommendations()
  → { recommendations[], issueCount, unmappedCount, invalidCount }
  ↓
recommendations.length === 0?
  → YES: "no recommended targets — ..." → exit
  → NO:  rawTargets = recommendations.map(r => r.target)
  ↓
buildInitPlan(projectRoot, { targets: rawTargets })
  ↓
applyInitPlan(...)    (or dry-run)
  ↓
summary + final status ("init completed from recommendations")
```

## Priority Policy

| Options                        | Behavior                                  |
|-------------------------------|-------------------------------------------|
| `--recommended` only           | compute targets from checks               |
| `--recommended` + `--targets`  | explicit wins, warn "[recommended] ignored" |
| `--targets` only               | selective apply (existing behavior)       |
| neither                        | full scaffold (existing behavior)         |

## New File

### `src/check/recommendations/computeRecommendations.js`

```js
async function computeRecommendations(projectRoot)
  → { recommendations, unmappedCount, invalidCount, issueCount }
```

- CheckerRunner + DEFAULT_CHECKERS 내부 실행
- buildRecommendations 재사용
- console 출력 없음 (command layer 책임)

## Output Example

```
[bkit-doctor] init: /path
[recommended] running checks to calculate targets...
[recommended] 12 targets: claude-root, hooks-json, ...
[dry-run] no files will be changed

  [MKDIR]    .claude
  [CREATE]   .claude/hooks.json
  ...

요약
  recommended targets : claude-root, hooks-json, ...
  directories created : 12
  files created       : 25
  files skipped       : 0

init completed from recommendations (dry-run)
no files changed
```

## No Recommendation Cases

| Condition             | Message                                      |
|----------------------|----------------------------------------------|
| issueCount === 0      | "no recommended targets — project looks healthy" |
| issueCount > 0, no map| "nothing to apply from recommendations"     |
