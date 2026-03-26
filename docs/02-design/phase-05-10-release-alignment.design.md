# Phase 05-10: Release Alignment Before Main Merge — Design

## 설계 결정

### docs 경로 정책 (source of truth)

check (`docs.js`) 기준을 진실의 원천으로 채택.
→ init이 check 기준에 맞춰 정렬.

| target | init이 생성하는 것 |
|--------|-----------------|
| `docs-plan` | `docs/01-plan/` 디렉터리 |
| `docs-design` | `docs/02-design/` 디렉터리 |
| `docs-task` | `docs/03-task/` 디렉터리 |
| `docs-report` | `docs/04-report/` 디렉터리 |
| `docs-changelog` | `docs/changelog.md` 파일 (변경 없음) |

이유: check는 이미 디렉터리 기준으로 동작하고 있고 현재 프로젝트도 디렉터리 구조를 사용 중.
flat file 방식은 phase-based workflow의 의도와 맞지 않음.

### scaffoldManifest 변경

**DIRECTORIES에 추가 (각 docs target 전용):**
```js
{ path: 'docs/01-plan',   targets: ['docs-plan'] },
{ path: 'docs/02-design', targets: ['docs-design'] },
{ path: 'docs/03-task',   targets: ['docs-task'] },
{ path: 'docs/04-report', targets: ['docs-report'] },
```

**FILES에서 제거:**
```js
{ path: 'docs/plan.md',   ... }   // ← 삭제
{ path: 'docs/design.md', ... }   // ← 삭제
{ path: 'docs/task.md',   ... }   // ← 삭제
{ path: 'docs/report.md', ... }   // ← 삭제
```

**FILES에 유지:**
```js
{ path: 'docs/changelog.md', initTarget: 'docs-changelog', ... }
```

### buildInitPlan 디렉터리 필터 확장

현재: 디렉터리는 filtered files의 parent dir에만 포함됨.
변경: `dir.targets` 배열이 `expandedTargets`와 교집합이 있으면 포함.

```js
// 변경 전
if (neededDirPaths !== null && !neededDirPaths.has(dir.path)) continue;

// 변경 후
if (filterByTarget) {
  const inNeededPaths = neededDirPaths.has(dir.path);
  const inDirTargets  = Array.isArray(dir.targets) && dir.targets.some(t => expandedTargets.includes(t));
  if (!inNeededPaths && !inDirTargets) continue;
}
```

이 변경은 기존 동작에 영향 없음:
- target 없음(전체): `filterByTarget = false` → 조건 분기 진입 안 함
- target 있고 file 있는 경우: `inNeededPaths`가 true → 기존과 동일
- target 있고 file 없는 경우(신규): `inDirTargets`가 true → 디렉터리 포함

### version 갱신

`package.json` version: `"0.1.0"` → `"0.5.6"`

`version` 명령은 `package.json`을 읽으므로 자동 반영.
README/CHANGELOG는 이미 `0.5.6`.

## 변경 파일 목록

| 파일 | 변경 유형 |
|------|---------|
| `src/init/scaffoldManifest.js` | DIRECTORIES 추가, FILES 제거 |
| `src/init/buildInitPlan.js` | 디렉터리 필터 로직 수정 |
| `src/init/targetRegistry.js` | docs-* 설명 갱신 |
| `src/shared/remediationMap.js` | fixHint 갱신 |
| `package.json` | version 갱신 |
