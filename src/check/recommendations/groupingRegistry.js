'use strict';

/**
 * groupingRegistry.js
 * recommendation grouping 정책 정의
 *
 * parent target이 VALID_TARGETS에 존재해야 최종 추천에 포함된다.
 * parent가 없으면 grouping 없이 children 유지 (safe fallback).
 *
 * minChildren: 이 수 이상의 children이 있어야 parent로 묶음
 */
const GROUPS = [
  {
    parent:      'docs-core',
    children:    ['docs-pdca', 'docs-plan', 'docs-design', 'docs-task', 'docs-report', 'docs-changelog'],
    minChildren: 2,
    label:       'all docs',
    description: 'create all docs/ scaffolds (plan, design, task, report, changelog)',
  },
];

module.exports = { GROUPS };
