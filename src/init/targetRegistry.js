'use strict';

/**
 * targetRegistry.js
 * init에서 사용할 target 이름을 상수로 정의한다.
 * remediationMap, scaffoldManifest, buildInitPlan이 이 이름을 공유한다.
 *
 * 묶음 target → 개별 파일 여러 개를 한 번에 선택
 * 개별 target → 특정 파일 하나 또는 소규모 묶음
 */

const TARGETS = {
  // 구조
  'claude-root':     'bkit .claude/ 루트 디렉터리',

  // config 파일
  'hooks-json':      '.claude/hooks.json',
  'settings-local':  '.claude/settings.local.json',

  // 에이전트
  'agents-core':     '.claude/agents/ 필수 에이전트 4종',

  // 스킬
  'skills-core':     '.claude/skills/ 필수 스킬 SKILL.md 7종',

  // 템플릿
  'templates-core':  '.claude/templates/ 템플릿 4종',

  // 정책
  'policies-core':   '.claude/policies/ 정책 파일 4종',

  // 문서 (개별)
  'docs-pdca':       'output/pdca/ 디렉터리',
  'docs-plan':       'docs/01-plan/ 디렉터리',
  'docs-design':     'docs/02-design/ 디렉터리',
  'docs-task':       'docs/03-task/ 디렉터리',
  'docs-report':     'docs/04-report/ 디렉터리',
  'docs-changelog':  'CHANGELOG.md (프로젝트 루트)',

  // 문서 묶음
  'docs-core':       'docs/ 전체 (01-plan, 02-design, 03-task, 04-report, changelog) + output/pdca/',
};

const VALID_TARGETS = new Set(Object.keys(TARGETS));

/**
 * target 이름 목록을 검증한다.
 * @param {string[]} names
 * @returns {{ valid: string[], unknown: string[] }}
 */
function validateTargets(names) {
  const valid   = [];
  const unknown = [];
  for (const n of names) {
    if (VALID_TARGETS.has(n)) valid.push(n);
    else                       unknown.push(n);
  }
  return { valid, unknown };
}

/**
 * 오타에 대한 closest match 힌트를 제공한다.
 * 전략: 공통 문자 비율(Dice coefficient 근사) 기반 최선 후보
 * @param {string} name
 * @returns {string|null}
 */
function suggestTarget(name) {
  const all = Array.from(VALID_TARGETS);
  let best = null;
  let bestScore = 0;

  for (const t of all) {
    const score = diceSimilarity(name, t);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  // 유사도 0.4 이상일 때만 힌트 제공
  return bestScore >= 0.4 ? best : null;
}

/** Dice coefficient: 2 * |bigrams(a) ∩ bigrams(b)| / (|bigrams(a)| + |bigrams(b)|) */
function diceSimilarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = s => {
    const set = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bi = s.slice(i, i + 2);
      set.set(bi, (set.get(bi) || 0) + 1);
    }
    return set;
  };
  const ba = bigrams(a);
  const bb = bigrams(b);
  let intersection = 0;
  for (const [bi, count] of ba) {
    intersection += Math.min(count, bb.get(bi) || 0);
  }
  return (2 * intersection) / (a.length - 1 + b.length - 1);
}

module.exports = { TARGETS, VALID_TARGETS, validateTargets, suggestTarget };
