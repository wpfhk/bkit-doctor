# Phase 04-1: init MVP Scaffold — Design

## Status
done

## 구조

```
src/
├── cli/commands/init.js         # CLI 진입점 (업데이트)
└── init/
    ├── scaffoldManifest.js      # 생성 대상 목록 (DIRECTORIES, FILES)
    ├── fileTemplates.js         # 파일 타입별 최소 내용 생성
    ├── generateScaffold.js      # 실제 생성 로직
    └── writeIfMissing.js        # ensureDir / writeIfMissing 유틸
```

## 파일 생성 정책
- 디렉터리: 없으면 `mkdir recursive`, 있으면 skip
- 파일: 없으면 create, 있으면 skip
- 덮어쓰기 없음, 삭제 없음, 병합 없음

## 생성 대상

### 디렉터리 (13개)
.claude/, .claude/agents/, .claude/skills/, .claude/skills/phase-{bootstrap,plan,design,do,check,report}/,
.claude/templates/, .claude/context/, .claude/policies/, docs/

### 파일 (25개)
- config: hooks.json, settings.local.json
- agents: planner-orchestrator, phase-reviewer, implementer, report-summarizer (각 .md)
- skills: 6개 SKILL.md
- templates: plan, design, task, report (각 -template.md)
- policies: global, output, security, documentation (각 -policy.md)
- docs: plan, design, task, report, changelog (.md)

## remediationMap 연결
- 각 FILES 항목에 `initTarget` 필드 부여
- remediationMap.js의 initTarget 값과 일치
- Phase 4-2에서 자동 연계 실행으로 확장 가능

## 출력 포맷
```
[CREATE] .claude/hooks.json
[SKIP]   .claude/agents/implementer.md

요약
  directories created : N
  files created       : N
  files skipped       : N

init completed with skipped files
```

## 대안 비교
- 단일 파일 방식: 유지보수 어려움 → 거부
- manifest 기반 분리: 확장성 높음 → 채택
- preset 도입: Phase 4-2에서 추가 예정
