# Plan: phase-03-1-context-refactor

**Date:** 2026-03-27
**Status:** approved
**PRD Ref:** N/A

---

## 1. Phase Goal
checker의 `run(targetPath)` 시그니처를 `run(context)` 객체로 교체하여, 각 checker가 projectRoot·platform 정보를 중복 계산 없이 공통으로 받도록 한다.

## 2. Work Scope
- `src/core/checker.js` — context 객체 생성 및 각 checker에 전달
- `src/cli/commands/check.js` — context 빌드 후 runner에 전달
- `src/checkers/structure.js` / `config.js` / `docs.js` / `agents.js` / `skills.js` / `misc.js` — `run(targetPath)` → `run(context)` 교체

## 3. Preconditions
- Phase 3 완료 (13개 checker, CheckerRunner, check 명령 동작)

## 4. Completion Criteria
- [ ] 모든 checker가 `run(context)` 시그니처 사용
- [ ] context = `{ projectRoot, platform }` 포함
- [ ] `node src/cli/index.js check` 기존과 동일하게 동작
- [ ] 기존 13개 checker 결과 변화 없음

## 5. Expected Risks
| Risk | Mitigation |
|------|-----------|
| checker 파일 누락 수정 | 6개 파일 전체 일괄 수정 |

## 6. Next Document
Design: `docs/02-design/phase-03-1-context-refactor.design.md`
