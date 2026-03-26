# Phase 05-1: Check Recommendation Flow — Design

## Status
done

## 구조

```
src/
├── shared/remediationMap.js                    # label / description 필드 추가
├── check/
│   ├── recommendations/
│   │   ├── recommendationModel.js              # Recommendation 타입 + makeRecommendation
│   │   └── buildRecommendations.js             # warn/fail → dedupe Recommendation[]
│   └── formatters/defaultFormatter.js          # 추천 섹션 출력
```

## 데이터 흐름

```
check results (rawResults)
  → enrich (remediationMap 주입)
  → buildRecommendations(results)
      for each warn/fail result:
        rem = REMEDIATION_MAP[r.id]
        if !rem or !rem.initTarget → unmappedCount++
        else → targetMap.set(initTarget, { target, label, description, sources[] })
      dedupe: targetMap (initTarget 기준 Map)
      return { recommendations[], unmappedCount }
  → format output
      • target — description
      Recommended next step:
      bkit-doctor init --targets <comma-joined>
```

## remediationMap 확장

| 기존 필드 | 추가 필드 |
|-----------|-----------|
| initTarget | label |
| fixHint   | description |

- `label`: 사람이 읽는 짧은 이름 (예: "hooks configuration")
- `description`: 생성 내용 설명 (예: "create the default hooks.json file")
- `config.claude-md`: initTarget=null → unmapped (수동 작성 필요)
- `context.required`: REMEDIATION_MAP에 없음 → unmapped

## dedupe 정책 (A안)
- initTarget 기준 Map으로 자동 dedupe
- 동일 target의 복수 source는 sources[] 배열에 누적
- B안(묶음 grouping)은 Phase 5-2 이후 확장 예정

## 출력 형식

```
──── 추천 ──────────────────────────────
  N개 추천 target (M개 문제 기반)

  • hooks-json — create the default hooks.json file
  • skills-core — generate default skill directories and SKILL.md files

  Recommended next step:
  bkit-doctor init --targets hooks-json,skills-core
```

## unmapped 처리
- unmappedCount: 내부 계수, 기본 출력에서는 숨김
- warn/fail 있으나 추천 0개일 때만 "(N개 항목은 자동 추천 대상이 아닙니다)" 노출
