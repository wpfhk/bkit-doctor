# Phase 04-1: init MVP Scaffold — Plan

## Status
done

## 목표
bkit-doctor `init` 명령의 MVP를 구현한다.
프로젝트에 없는 기본 구조(.claude/, docs/)와 파일을 안전하게 생성한다.

## 범위
- `init` 명령 실제 동작 구현 (stub → 실제)
- 생성 대상: 디렉터리 13개, 파일 25개
- non-destructive: 기존 파일 보존, 없는 것만 생성
- check remediationMap과 연결 가능한 initTarget 기반 manifest 구조

## 선행조건
- Phase 3-3 완료 (remediationMap, initTarget 정의)
- `src/shared/remediationMap.js` 존재

## 완료조건
- `bkit-doctor init` 실행 시 기본 구조 생성
- 기존 파일 덮어쓰지 않음
- CREATE / SKIP 결과 요약 출력
- macOS / Windows 동작

## 리스크
- 낮음 — non-destructive 정책으로 기존 환경 영향 없음
