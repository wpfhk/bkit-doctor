# Phase 05-3: init --recommended MVP — Report

## Status
done

## 구현 내용

### 신규 파일
- `src/check/recommendations/computeRecommendations.js`
  - CheckerRunner + DEFAULT_CHECKERS로 check 실행
  - buildRecommendations 재사용
  - 반환: `{ recommendations, unmappedCount, invalidCount, issueCount }`
  - 콘솔 출력 없음 — command layer 책임

### 변경 파일
- `src/cli/index.js` — `--recommended` 옵션 등록
- `src/cli/commands/init.js` — async 전환, --recommended 처리 로직
  - explicit targets 우선 정책
  - no recommendation 처리 (정상 종료)
  - "recommended targets" vs "selected targets" 요약 레이블 구분
  - "init completed from recommendations" 최종 상태 메시지

## 검증

```
# 시나리오 B — empty dir + --recommended --dry-run
[recommended] running checks to calculate targets...
[recommended] 12 targets: claude-root, hooks-json, ...
[dry-run] no files will be changed
  [MKDIR]    .claude
  ...
init completed from recommendations (dry-run)
no files changed

# 시나리오 C — healthy project
no recommended targets — project looks healthy

# 시나리오 D — explicit wins
[recommended] explicit targets provided — --recommended ignored
[targets] hooks-json
```

## 설계 결정
- A안(즉시 재실행) 채택: snapshot 없음, 상태 일관성 보장
- formatter 재사용 없음: init은 데이터 모델만 소비
- invalid target: buildRecommendations가 VALID_TARGETS로 이미 방어

## 다음 단계
Phase 5-4: recommendation grouping + snapshot 재사용 검토
- docs-core 같은 상위 그룹 target 제안
- cached check results snapshot
- grouped recommendation 출력
