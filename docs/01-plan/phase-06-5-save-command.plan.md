# Phase 06-5 — save command (기본 동작 설정 저장)

## 목표

처음 배포 전까지 CLI를 최대한 단순하고 직관적으로 정리한다.
복잡한 preset 확장 대신 최소한의 `save` 커맨드만 도입한다.

사용자에게 주로 보여야 할 핵심 명령 3개:
- `bkit-doctor fix`   → 추천 기반 자동 적용
- `bkit-doctor init`  → 구조 시작/적용
- `bkit-doctor save`  → 기본 동작 선호 저장

## 제품 원칙

1. 가장 단순하고 직관적인 방향 우선
2. 사용자가 외워야 하는 핵심 명령 최소화
3. 복잡한 고급 기능은 지금 넣지 않는다
4. 확장 기능은 backlog으로만 남긴다
5. 처음 보는 사람도 대충 보고 이해 가능한 수준

## 범위

### 포함

- `save` top-level 커맨드
- 저장 범위: `--local` / `--global` / `--both`
- 저장 대상: `--recommended` / `--preset <name>`
- 저장 위치:
  - local: `.bkit-doctor/settings.local.json`
  - global: `~/.bkit-doctor/settings.global.json`
- `src/config/configPaths.js` + `saveConfig.js`
- 테스트 26 케이스
- verify-release Phase 6-5 체크 6종

### 제외 (backlog)

- custom preset create/edit/delete
- preset import/export
- interactive wizard
- scoring personalization
- AI 추천 저장
- 설정 계층 우선순위 고도화

## 완료 조건

- [ ] `save --local --recommended` 성공, 파일 생성
- [ ] `save --global --preset <name>` 성공, 파일 생성
- [ ] `save --both --preset <name>` 성공, 양쪽 파일 생성
- [ ] scope 없음 → non-zero exit
- [ ] target 없음 → non-zero exit
- [ ] `--recommended --preset` 동시 사용 → non-zero exit
- [ ] unknown preset → non-zero exit
- [ ] 기존 fix / init --preset regression 없음
- [ ] verify-release 전체 PASS
