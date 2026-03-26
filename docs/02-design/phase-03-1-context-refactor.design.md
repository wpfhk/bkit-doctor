# Design: phase-03-1-context-refactor

**Date:** 2026-03-27
**Status:** approved
**Plan Ref:** `docs/01-plan/phase-03-1-context-refactor.plan.md`

---

## 1. Background
Phase 3에서 모든 checker는 `run(targetPath: string)`을 받는다. 경로 계산이 각 checker 내부에서 중복되며, 플랫폼 정보 등 공통 값을 추가할 때마다 시그니처가 달라진다. `run(context)` 객체로 통일하면 checker 내부는 `context.projectRoot` 하나만 참조하면 된다.

## 2. Changed Structure

변경 전:
```javascript
// checker 정의
{ id, title, severity, run: async (targetPath) => result }

// CheckerRunner.run()
const result = await check.run(targetPath);

// check.js
const results = await runner.run(targetPath);
```

변경 후:
```javascript
// checker 정의
{ id, title, severity, run: async (context) => result }
// context = { projectRoot: string, platform: string }

// CheckerRunner.run()
const context = { projectRoot: targetPath, platform: getPlatform() };
const result  = await check.run(context);

// check.js — 변경 없음 (runner가 context 생성)
const results = await runner.run(targetPath);
```

### context 객체 형식

```javascript
{
  projectRoot: string,   // 진단 대상 절대 경로
  platform: string,      // 'mac' | 'windows' | 'linux' | 'unknown'
}
```

checker 내부에서의 경로 처리:
```javascript
// 변경 전
const exists = fs.existsSync(path.join(targetPath, '.claude'));

// 변경 후
const exists = fs.existsSync(path.join(context.projectRoot, '.claude'));
```

## 3. Impact Scope
- `src/core/checker.js` — run() 내부에서 context 빌드
- checker 6개 파일 — `targetPath` → `context.projectRoot` 치환
- `src/cli/commands/check.js` — 변경 없음

## 4. Alternatives Compared
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A. context 객체 (선택) | 확장 용이, 공통값 한 곳 관리 | 기존 코드 일괄 수정 필요 | ✓ |
| B. targetPath 유지 | 변경 없음 | 향후 인자 추가 시 시그니처 변경 불가피 | ✗ |

## 5. Decision
**선택: Option A — context 객체**
**Why:** checker 수가 늘어날수록 공통 값을 한 곳에서 관리하는 구조가 유지보수에 유리하다. Phase 4+에서 `context.ignorePatterns`, `context.strict` 등 옵션 추가 시 checker 시그니처 변경이 불필요해진다.

## 6. Verification
- `node src/cli/index.js check` → 기존 13개 결과 동일
- `node src/cli/index.js check --path /tmp/empty` → fail/warn 동일
