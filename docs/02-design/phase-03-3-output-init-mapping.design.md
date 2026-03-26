# Design: phase-03-3-output-init-mapping

**Date:** 2026-03-27
**Status:** approved
**Plan Ref:** `docs/01-plan/phase-03-3-output-init-mapping.plan.md`

---

## 1. Background
현재 `check.js`가 출력 책임까지 가지고 있어 포맷 변경 시 명령 파일을 직접 수정해야 한다. formatter를 분리하면 출력 로직 독립, 향후 JSON/verbose 모드 추가도 용이해진다. missing 표준화는 Phase 4 init이 "무엇을 생성해야 하는가"를 결정하는 기반이 된다.

## 2. Changed Structure

```
src/
├── check/
│   ├── resultModel.js            (new: 결과 정규화 헬퍼 + JSDoc)
│   └── formatters/
│       └── defaultFormatter.js   (new: 카테고리요약+상세+총계 출력)
├── shared/
│   └── remediationMap.js         (new: checker id → initTarget + fixHint)
├── core/
│   └── checker.js               (update: missing/found/expected pass-through)
├── checkers/
│   ├── structure.js             (update: missing/expected 추가)
│   ├── config.js                (update: missing/expected 추가)
│   ├── docs.js                  (update: missing/expected 추가)
│   ├── agents.js                (update: findMissingFiles + missing/expected)
│   ├── skills.js                (update: missing/expected 명시)
│   ├── policies.js              (update: missing/expected 명시)
│   └── misc.js                  (update: missing/expected)
└── cli/commands/
    └── check.js                 (update: formatter 위임)
```

### CheckResult 필드 (완전한 형태)

```
id, category, title, status, message
missing   []  — 누락된 파일/경로 (raw, programmatic use)
found     []  — 실제 발견된 항목
expected  []  — checker 기준 전체 기대 목록
fixHint   ""  — 수정 힌트 (remediationMap 주입)
initTarget "" — init 생성 대상 키 (remediationMap 주입)
```

### 출력 포맷

```
[bkit-doctor] 진단 대상: /path

──── 카테고리 ─────────────────────────
  ✓ structure    1 pass
  ✓ config       3 pass
  ! skills       1 warn

──── 상세 ─────────────────────────────
[PASS] structure.claude-root — .claude/ 존재
[WARN] skills.required — skill 2개 SKILL.md 없음
  없음: .claude/skills/phase-check/SKILL.md
  → skill 디렉터리 + SKILL.md 생성 필요

──────────────────────────────────────
총 14개 — PASS 13 / WARN 1 / FAIL 0   상태: WARNING
```

### remediationMap 구조

```javascript
{
  'structure.claude-root': { initTarget: 'claude-root', fixHint: '...' },
  'config.claude-md':      { initTarget: 'claude-md',   fixHint: '...' },
  ...
}
```

### checker run() 반환 표준

```javascript
// pass
{ status: 'pass', message, found, expected }
// warn/fail
{ status: 'warn'|'fail', message, missing, expected }
```

## 3. Impact Scope
- `check.js`: console.log 전부 제거, formatter.format() 호출로 교체
- checker 7종: details 제거 → missing/expected 추가
- `CheckerRunner`: missing/found/expected pass-through

## 4. Alternatives Compared
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A. formatter 분리 + missing 표준화 (선택) | 책임 분리, init 연결 준비 | 파일 수 증가 | ✓ |
| B. check.js 직접 수정 | 파일 최소 | 확장 불가, 테스트 어려움 | ✗ |

## 5. Decision
**선택: Option A**
**Why:** Phase 4 init 구현 시 check 결과의 `missing` 배열을 그대로 사용해 "무엇을 생성할 것인가"를 결정한다. formatter 분리 없이는 출력 변경마다 명령 파일 수정이 필요해 단일 책임 원칙 위반이 누적된다.

## 6. Verification
- `check` → 카테고리 요약 + 상세 + 총계 출력 확인
- HEALTHY 시나리오: warn/fail 0 → fixHint 미출력
- FAILED 시나리오: missing 경로 + fixHint 표시
- check.js 내 console.log 없음 확인
