# Design: phase-03-init-doctor-mvp

**Date:** 2026-03-26
**Status:** approved
**Plan Ref:** `docs/01-plan/phase-03-init-doctor-mvp.plan.md`

---

## 1. Background
Phase 2에서 CheckerRunner 인터페이스가 완성되었지만 실제 checker가 없어 "no checks loaded"가 출력된다. Phase 3에서 13개 checker를 카테고리별로 구현하고 check 명령에 자동 등록하여 MVP를 완성한다. `doctor` 명칭을 제거하고 `check` 기준으로 통일한다.

## 2. Changed Structure

변경 전:
```
src/
├── checks/               (빈 디렉터리)
├── core/checker.js       (id, name, run)
└── cli/commands/doctor.js
```

변경 후:
```
src/
├── checkers/
│   ├── index.js          (DEFAULT_CHECKERS 내보내기)
│   ├── structure.js      (1개: .claude/ 존재)
│   ├── config.js         (3개: CLAUDE.md, hooks.json, settings.local.json)
│   ├── docs.js           (4개: 01-plan ~ 04-report 디렉터리)
│   ├── agents.js         (1개: 필수 agent 4종)
│   ├── skills.js         (1개: 필수 skill 6종)
│   └── misc.js           (3개: templates, context, CHANGELOG.md)
├── core/checker.js       (title·details 추가, 하위 호환)
└── cli/
    ├── index.js          (doctor 제거, check → checkCommand)
    └── commands/
        └── check.js      (doctor.js 대체, auto-register + 출력 포맷)
```

### CheckerRunner 인터페이스 (확장)

```javascript
// 등록 형식
{
  id:       string,             // 'structure.claude-root'
  title:    string,             // '.claude/ 디렉터리 존재'
  severity: 'error'|'warning', // fail 시 기본 status 결정 (문서용)
  run:      async (targetPath) => { status, message, details? }
}

// 결과 형식
{
  id:      string,
  title:   string,
  status:  'pass' | 'warn' | 'fail',
  message: string,
  details: string[]
}
```

### 출력 포맷

```
[bkit-doctor] 진단 대상: /path/to/project

[PASS] structure.claude-root — .claude/ 존재
[WARN] config.settings-local — .claude/settings.local.json 없음 — 로컬 설정 미적용
[FAIL] docs.plan — docs/01-plan/ 없음 — Plan 문서 미작성

──────────────────────────────────────
총 13개 — PASS 10 / WARN 2 / FAIL 1
상태: FAILED
```

### 종합 상태 로직

```
fail > 0          → FAILED
fail == 0, warn>0 → WARNING
모두 pass         → HEALTHY
```

### Checker 목록 (13개)

| id | severity | 검사 대상 |
|----|----------|---------|
| structure.claude-root | error | `.claude/` 존재 |
| config.claude-md | error | `CLAUDE.md` 존재 |
| config.hooks-json | warning | `.claude/hooks.json` 존재 |
| config.settings-local | warning | `.claude/settings.local.json` 존재 |
| docs.plan | warning | `docs/01-plan/` 존재 |
| docs.design | warning | `docs/02-design/` 존재 |
| docs.task | warning | `docs/03-task/` 존재 |
| docs.report | warning | `docs/04-report/` 존재 |
| agents.required | warning | `.claude/agents/` + 필수 4종 존재 |
| skills.required | warning | `.claude/skills/` + 필수 6종 존재 |
| templates.required | warning | `.claude/templates/` 존재 |
| context.required | warning | `.claude/context/` 존재 |
| changelog.exists | warning | `CHANGELOG.md` 존재 |

## 3. Impact Scope
- `src/cli/commands/doctor.js` 삭제 → `check.js` 신규
- `src/cli/index.js` — doctor 커맨드 제거, check action 교체
- `src/core/checker.js` — run() 결과에 title·details 포함 (하위 호환)
- `src/checks/` — 빈 상태 유지 (Phase 4+ init 시 활용 가능)

## 4. Alternatives Compared

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A. 카테고리별 파일 (선택) | 관심사 분리, Phase 4 확장 용이 | 파일 수 증가 | ✓ |
| B. 단일 checkers.js | 단순 | checker 증가 시 비대화 | ✗ |

## 5. Decision
**선택: Option A — 카테고리별 파일**
**Why:** checker는 Phase 3 이후 계속 추가된다. 카테고리 분리로 `src/checkers/{category}.js` 하나 추가만으로 확장이 완결된다.

## 6. Verification
- `node src/cli/index.js check` → 13개 결과 + 요약 + 종합 상태
- 시나리오 1: 빈 임시 디렉터리 → fail/warn 다수
- 시나리오 2: `.claude/`만 있는 디렉터리 → structure pass, 나머지 warn
- 시나리오 3: bkit-doctor 자신 대상 → HEALTHY 예상
