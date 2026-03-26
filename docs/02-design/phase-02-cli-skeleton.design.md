# Design: phase-02-cli-skeleton

**Date:** 2026-03-26
**Status:** approved
**Plan Ref:** `docs/01-plan/phase-02-cli-skeleton.plan.md`

---

## 1. Background
Phase 1에서 `doctor` / `init`은 stub으로만 구현되었다. Phase 2에서 doctor 명령이 실제 CheckerRunner를 사용하는 구조로 교체하고, 빈 상태에서 "진단 항목 없음"을 출력한다. `check` 커맨드도 추가하여 동일 동작을 제공한다.

## 2. Changed Structure

변경 전:
```
src/cli/commands/doctor.js  → console.log stub
```

변경 후:
```
src/
├── cli/
│   ├── index.js              (update: 'check' command 추가)
│   └── commands/
│       └── doctor.js         (update: CheckerRunner 사용)
├── core/
│   └── checker.js            (new: CheckerRunner class)
└── checks/
    └── .gitkeep              (new: Phase 3 진단 모듈 위치)
```

### CheckerRunner API
```javascript
class CheckerRunner {
  constructor() { this.checks = []; }
  register(check) { ... }       // check: { id, name, run: async(targetPath) }
  async run(targetPath) { ... } // returns: [{ id, status, message }]
  // status: 'pass' | 'warn' | 'fail'
}
```

### doctor.js 흐름
```
doctorCommand(options)
  → new CheckerRunner()
  → runner.run(options.path)
  → 결과 없음: "진단 항목 없음 (no checks loaded)"
  → 결과 있음 (Phase 3): [✓/!/✗] id: message
```

### 출력 포맷
```
[bkit-doctor] 진단 대상: /path/to/dir
진단 항목 없음 (no checks loaded)
```

## 3. Impact Scope
- `src/cli/commands/doctor.js` 전체 교체 (stub → runner)
- `src/cli/index.js` — `check` 명령 2줄 추가

## 4. Alternatives Compared
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A. CheckerRunner class (선택) | register/run 인터페이스 명확, Phase 3 확장 용이 | 약간 복잡 | ✓ |
| B. 함수형 배열 방식 | 단순 | Phase 3 확장 시 리팩토링 필요 | ✗ |

## 5. Decision
**선택: Option A — CheckerRunner class**
**Why:** register/run 분리로 Phase 3에서 진단 항목 추가 시 runner 수정 없이 checks/ 디렉터리에 모듈만 추가하면 된다. 단일 책임 원칙 유지.

## 6. Verification
- `node src/cli/index.js doctor` → "진단 항목 없음 (no checks loaded)" 메시지 출력 확인
- `node src/cli/index.js check` → 동일 메시지 확인
- `node src/cli/index.js check --path /some/dir` → 경로 반영 확인
