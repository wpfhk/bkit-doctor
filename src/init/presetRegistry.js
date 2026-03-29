'use strict';

const { VALID_TARGETS } = require('./targetRegistry');

/**
 * presetRegistry.js
 * 사전 정의된 target 묶음(preset)을 제공한다.
 *
 * preset vs recommendation:
 *   recommendation = 현재 프로젝트 상태 기반 (동적)
 *   preset         = 미리 정의된 고정 구조 번들 (정적)
 */

const PRESETS = {
  'default': {
    description: '기본 bkit 운영 구조 전체 (설정 + 에이전트 + 스킬 + 템플릿 + 정책 + 문서)',
    targets: [
      'claude-root',
      'hooks-json',
      'settings-local',
      'agents-core',
      'skills-core',
      'templates-core',
      'policies-core',
      'docs-core',
    ],
  },
  'lean': {
    description: '최소 구조 (claude 루트 + 설정 파일 + 에이전트만)',
    targets: [
      'claude-root',
      'hooks-json',
      'settings-local',
      'agents-core',
    ],
  },
  'workflow-core': {
    description: '워크플로우 구조 (에이전트 + 스킬 + 템플릿 + 정책)',
    targets: [
      'claude-root',
      'agents-core',
      'skills-core',
      'templates-core',
      'policies-core',
    ],
  },
  'docs': {
    description: '문서 구조만 (plan, design, task, report, changelog)',
    targets: [
      'docs-core',
    ],
  },
};

/**
 * preset 이름을 해석하여 해당 preset 객체를 반환한다.
 * 존재하지 않으면 null 반환.
 * (backward compat — name 필드 미포함)
 *
 * @param {string} name
 * @returns {{ description: string, targets: string[] } | null}
 */
function resolvePreset(name) {
  if (!name || !PRESETS[name]) return null;
  return PRESETS[name];
}

/**
 * preset 이름을 해석하여 name 포함 전체 메타데이터를 반환한다.
 * 존재하지 않으면 null 반환.
 *
 * @param {string} name
 * @returns {{ name: string, description: string, targets: string[] } | null}
 */
function getPreset(name) {
  if (!name || !PRESETS[name]) return null;
  return { name, ...PRESETS[name] };
}

/**
 * 전체 preset 목록을 반환한다.
 * @returns {{ name: string, description: string, targets: string[] }[]}
 */
function listPresets() {
  return Object.entries(PRESETS).map(([name, p]) => ({ name, ...p }));
}

/**
 * preset의 모든 target이 targetRegistry에 유효한지 검증한다.
 * (preset 정의 오류 감지용)
 *
 * @param {string[]} targets
 * @returns {{ valid: boolean, invalid: string[] }}
 */
function validatePresetTargets(targets) {
  const invalid = targets.filter(t => !VALID_TARGETS.has(t));
  return { valid: invalid.length === 0, invalid };
}

module.exports = { PRESETS, resolvePreset, getPreset, listPresets, validatePresetTargets };
