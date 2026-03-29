# Phase 06-1 Report — fix command + init --preset support

## 결과 요약

| 항목 | 결과 |
|------|------|
| 버전 | v0.6.0 |
| 테스트 | 27/27 통과 |
| 신규 파일 | 5개 |
| 변경 파일 | 4개 |
| 안전 원칙 | 유지 |

## 구현 내용

### fix 명령

```
bkit-doctor fix [--dry-run] [--yes] [--fresh]
```

- recommendation 기반 shortcut
- snapshot 재사용 → invalid 시 fallback recompute
- plan → preview → confirm → apply 기존 흐름 그대로 사용
- overwrite 기본 금지 (안전 원칙 유지)

### init --preset

```
bkit-doctor init --preset <name> [--dry-run] [--yes]
```

사용 가능 preset:
- `default` — 전체 구조 (config + agents + skills + templates + policies + docs)
- `lean`    — 최소 구조 (config + agents만)
- `docs`    — 문서 구조만

충돌 규칙:
- `--preset + --recommended` → exitCode=1
- `--preset + --target/--targets` → exitCode=1

## 테스트 결과

### preset.test.js (17 케이스)

- resolvePreset known/unknown/null/undefined 처리
- listPresets 구조 검증
- 모든 preset target이 targetRegistry에 유효
- lean < default target 수 보장
- validatePresetTargets 정상/오류 케이스

### fix.test.js (10 케이스)

- 반환 구조 검증
- --fresh: snapshotStatus 'skipped'
- --fresh: 유효한 snapshot도 무시
- missing snapshot: recompute (snapshotStatus 'missing')
- valid snapshot: 재사용 (snapshotStatus 'used', targets 일치)
- wrong version: invalid + recompute
- wrong projectRoot: invalid + recompute
- wrong fingerprint: invalid + recompute
- healthy snapshot (empty targets): valid
- snapshotStatus 열거값 검증

## 설계 결정 기록

### repair 제외

repair와 fix는 목적이 동일하다.
두 이름이 공존하면 사용자 혼란을 초래한다.
fix 하나로 통합한다.

### preset을 init option으로

init은 이미 --target, --recommended를 지원한다.
모두 같은 plan/apply 흐름으로 수렴한다.
별도 command보다 option이 일관성 있고 구현이 간단하다.

### 기존 코드 최소 수정

computeRecommendations, buildInitPlan, applyInitPlan, confirmApply를 변경 없이 재사용했다.
init.js 변경은 preset 블록 삽입과 충돌 검사 추가에 한정했다.

## 후속 Phase 제안

### Phase 6-2: preset 관리 기능

```
bkit-doctor init --preset list     사용 가능 preset 목록
bkit-doctor init --preset show <name>  preset 상세
```

또는 별도 `preset` 서브커맨드로:

```
bkit-doctor preset list
bkit-doctor preset show default
```

### Phase 6-3: 사용자 정의 preset

`.bkit-doctor/presets.json`으로 custom preset 정의.
fix --preset 도 지원 가능.

### Phase 6-4: fix 결과 snapshot 갱신

fix 성공 후 새 상태로 snapshot을 자동 갱신하여
다음 실행 시 일관성 보장.
