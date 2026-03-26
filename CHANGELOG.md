# Changelog

All notable changes to **bkit-doctor** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow a phase-based progression rather than strict SemVer.

---

## [Unreleased]

---

## [0.5.2] — suggested-init-flow-and-recommended-apply — 2026-03-27

Separated recommendation calculation from command generation.
`SuggestedFlow` is now a model object; the formatter renders it — not string-builds it.

### Added

- `src/check/recommendations/suggestedFlowModel.js` — `SuggestedFlow` typedef and `makeSuggestedFlow()` helper generating both `applyCommand` and `previewCommand`
- `src/check/recommendations/buildSuggestedFlow.js` — `buildSuggestedFlow(recommendations, issueCount)` producing a `SuggestedFlow|null` from sorted recommendations
- `TARGET_PRIORITY` exported from `buildRecommendations.js` for use by formatters and tests

### Changed

- `src/check/recommendations/buildRecommendations.js` — added `TARGET_PRIORITY` constant and priority-based sort; validates targets against `VALID_TARGETS`; returns `invalidCount` alongside `unmappedCount`
- `src/check/formatters/defaultFormatter.js` — integrates `buildSuggestedFlow`; displays `flow.applyCommand` and `flow.previewCommand` as separate "Recommended next step" / "Preview first" lines; shows `invalidCount` when non-zero

---

## [0.5.1] — check-recommendation-flow — 2026-03-27

Introduced recommendation engine: `check` results now suggest which `init` targets to run.

### Added

- `src/check/recommendations/recommendationModel.js` — `Recommendation` typedef and `makeRecommendation()` helper
- `src/check/recommendations/buildRecommendations.js` — filters warn/fail results, dedupes by `initTarget`, validates against `VALID_TARGETS`, returns sorted recommendations

### Changed

- `src/shared/remediationMap.js` — added `label` and `description` fields to all 13 entries
- `src/check/formatters/defaultFormatter.js` — appended recommendation section with recommended next-step command

---

## [0.4.2] — selective-apply-and-remediation — 2026-03-27

Expanded `init` from a full-scaffold tool into a targeted, selective apply system.
Introduced a shared target registry that connects check diagnostics to init actions.

### Added

- `src/init/targetRegistry.js` — 13 named targets with descriptions, `validateTargets()`, and Dice coefficient–based `suggestTarget()` for typo hints
- Unknown target detection with `did you mean: <closest>?` suggestions and full target listing

### Changed

- `src/init/scaffoldManifest.js` — each directory entry now carries a `targets[]` array; file entries use unified target names (`*-core` pattern); `TARGET_ALIASES` introduced for aggregate targets like `docs-core`
- `src/shared/remediationMap.js` — `initTarget` values synchronized with `targetRegistry` keys; `CLAUDE.md` entry set to `null` (not scaffolded)
- `src/init/buildInitPlan.js` — supports `targets` filter option; expands aliases; computes only the directories needed by selected files
- `src/cli/commands/init.js` — `collectTargets()` merges `--target` (repeatable) and `--targets` (comma-separated); validation and hint output added; summary shows selected targets
- `src/cli/index.js` — `--target` registered with collector function; `--targets` registered as comma-separated string

---

## [0.4.1] — init-safety-preview-backup — 2026-03-27

Introduced a plan/apply architecture that separates what will happen from what actually happens.
Added `--dry-run`, `--overwrite`, and `--backup` safety controls.

### Added

- `src/init/initPlanModel.js` — `PlanItem` type definition (`mkdir`, `mkdir-skip`, `create`, `skip`, `overwrite`) and `makeItem` helper
- `src/init/buildInitPlan.js` — computes an init plan by reading the filesystem without writing anything
- `src/init/applyInitPlan.js` — executes a plan; respects `dryRun`, `backup`, and `overwrite` flags
- `src/backup/createBackupSession.js` — creates a timestamped backup session directory under `.bkit-doctor/backups/`
- `src/backup/copyToBackup.js` — copies a single file to the backup session, preserving directory structure
- `src/backup/backupManifest.js` — writes `manifest.json` listing all backed-up files

### Changed

- `src/cli/commands/init.js` — rewritten around `buildInitPlan` / `applyInitPlan`; output shows `[CREATE]`, `[SKIP]`, `[OVERWRITE]` labels
- `src/cli/index.js` — added `--dry-run`, `--overwrite`, `--backup`, `--backup-dir` options

---

## [0.4.0] — init-mvp-scaffold — 2026-03-27

Replaced the `init` command stub with a real implementation. Non-destructive scaffold generation based on a declarative manifest.

### Added

- `src/init/scaffoldManifest.js` — defines 13 directories and 25 files as the standard bkit environment scaffold; each file carries an `initTarget` key for future check integration
- `src/init/fileTemplates.js` — generates minimal but valid content for 9 file types (agent, skill, template, policy, doc, changelog, JSON configs)
- `src/init/generateScaffold.js` — iterates the manifest and delegates to write utilities
- `src/init/writeIfMissing.js` — `ensureDir` and `writeIfMissing` utilities: create if absent, skip if present, never overwrite

### Changed

- `src/cli/commands/init.js` — stub replaced with live scaffold runner; outputs `[CREATE]` / `[SKIP]` per item with a summary

---

## [0.3.2] — check-output-and-init-mapping — 2026-03-27

Standardized checker output and introduced the `remediationMap` that connects check results to future init actions.

### Added

- `src/check/resultModel.js` — `CheckResult` type definition and `normalizeResult` helper for consistent result shapes
- `src/shared/remediationMap.js` — maps each checker ID to an `initTarget` and a human-readable `fixHint`
- `src/check/formatters/defaultFormatter.js` — formats results by category with per-category summary, detailed item list, and totals line

### Changed

- `src/cli/commands/check.js` — delegates all output to `formatter.format()` instead of direct `console.log`
- All 7 checkers — `details` field removed; `missing`, `found`, and `expected` arrays standardized
- `CheckerRunner` — passes `missing`, `found`, `expected` through to caller unchanged

---

## [0.3.1] — check-expansion-set — 2026-03-27

Extended the checker set and standardized the checker invocation API.

### Added

- `src/checkers/shared/fileRules.js` — shared utilities: `findMissingFiles`, `hasAnyFile`, `hasAllFiles`
- `src/checkers/policies.js` — `policies.required` checker validating 4 policy files
- `category` field added to all checker results (automatically extracted from checker ID prefix)

### Changed

- `skills.required` — upgraded from directory presence check to SKILL.md file presence check (6 files)
- `templates.required` — upgraded from directory presence check to 4 specific template file checks
- `changelog.exists` — expanded from single path to 3 candidate paths with fallback logic
- Checker API: `run(targetPath)` → `run(context)` where `context = { projectRoot, platform }`
- `CheckerRunner.run()` — builds context object internally before dispatching to each checker

---

## [0.3.0] — check-core-bootstrap — 2026-03-26

Implemented the full diagnostic check system with categorized checkers and structured output.

### Added

- `src/checkers/` — 6 checker modules: `structure`, `config`, `docs`, `agents`, `skills`, `misc`
- 13 checker rules implemented — each returns `pass`, `warn`, or `fail`
- `src/checkers/index.js` — `DEFAULT_CHECKERS` auto-registration
- `src/cli/commands/check.js` — `[PASS]` / `[WARN]` / `[FAIL]` output format with overall status line (`HEALTHY` / `WARNING` / `FAILED`)
- `src/core/checker.js` — `title` and `details` fields added to checker result shape

### Removed

- `doctor` command removed — consolidated into `check` as the single diagnostic entry point

---

## [0.2.0] — cli-skeleton — 2026-03-26

Introduced the `CheckerRunner` core and the `check` command as the primary CLI surface.

### Added

- `src/core/checker.js` — `CheckerRunner` class with `register()` and `run()` API
- `src/checks/` — placeholder directory for diagnostic modules
- `check` command — same behavior as `doctor`, provided as the canonical entry point
- Output format: `[✓]` / `[!]` / `[✗]` per result with a statistics summary line

### Changed

- `src/cli/commands/doctor.js` — stub replaced with `CheckerRunner`-based diagnostic loop

---

## [0.1.0] — cli-foundation — 2026-03-26

Established the CLI foundation: entry point, command routing, and platform utilities.

### Added

- `src/cli/index.js` — Commander-based CLI entry point
- `version` command — prints version and platform information
- `doctor` command — stub (planned for Phase 3)
- `init` command — stub (planned for Phase 2)
- `src/utils/platform.js` — OS detection and cross-platform path utilities
- Phase 1 PDCA documents: plan, design, task, report

---

## [0.0.1] — env-setup — 2026-03-26

Initial project creation. Established the bkit-style development environment that bkit-doctor itself is built to scaffold.

### Added

- `.claude/` directory with full bkit operating environment:
  - `agents/` — planner-orchestrator, implementer, phase-reviewer, report-summarizer
  - `skills/` — phase-bootstrap, plan, design, do, check, report, work-summary
  - `templates/` — prd, plan, design, task, report, changelog
  - `context/` — project-overview, architecture, conventions, constraints, phase-index
  - `policies/` — global, output, security, documentation
- `docs/` directory structure initialized
- `CLAUDE.md` project rules authored
