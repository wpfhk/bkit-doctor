'use strict';

const fs   = require('fs');
const path = require('path');
const { DIRECTORIES, FILES, TARGET_ALIASES } = require('./scaffoldManifest');
const { makeItem }                            = require('./initPlanModel');

/**
 * buildInitPlan.js
 * 파일 시스템을 변경하지 않고 실행 계획만 계산한다.
 *
 * @param {string}   projectRoot
 * @param {Object}   opts
 * @param {boolean}  opts.overwrite   overwrite 허용 여부 (기본 false)
 * @param {string[]} opts.targets     선택 target 목록 (비어 있으면 전체)
 * @returns {PlanItem[]}
 */
function buildInitPlan(projectRoot, opts = {}) {
  const { overwrite = false, targets = [] } = opts;

  // aliases 확장 (docs-core → docs-plan, docs-design, ...)
  const expandedTargets = expandAliases(targets);
  const filterByTarget  = expandedTargets.length > 0;

  const plan = [];

  // 파일 필터링
  const filteredFiles = filterByTarget
    ? FILES.filter(f => expandedTargets.includes(f.initTarget))
    : FILES;

  // 선택된 파일에 필요한 디렉터리 계산
  const neededDirPaths = filterByTarget
    ? computeNeededDirs(filteredFiles, projectRoot)
    : null;

  // 디렉터리 계획
  for (const dir of DIRECTORIES) {
    if (filterByTarget) {
      const inNeededPaths = neededDirPaths.has(dir.path);
      const inDirTargets  = Array.isArray(dir.targets) && dir.targets.some(t => expandedTargets.includes(t));
      if (!inNeededPaths && !inDirTargets) continue;
    }
    const full   = path.join(projectRoot, dir.path);
    const exists = fs.existsSync(full);
    plan.push(makeItem(exists ? 'mkdir-skip' : 'mkdir', 'dir', dir.path));
  }

  // 파일 계획
  for (const file of filteredFiles) {
    const full   = path.join(projectRoot, file.path);
    const exists = fs.existsSync(full);

    if (!exists) {
      plan.push(makeItem('create', 'file', file.path, {
        initTarget:     file.initTarget,
        backupRequired: false,
      }));
    } else if (overwrite) {
      plan.push(makeItem('overwrite', 'file', file.path, {
        initTarget:     file.initTarget,
        backupRequired: true,
      }));
    } else {
      plan.push(makeItem('skip', 'file', file.path, {
        initTarget:     file.initTarget,
        backupRequired: false,
      }));
    }
  }

  return plan;
}

/**
 * alias target을 개별 target으로 확장한다.
 */
function expandAliases(targets) {
  const result = [];
  for (const t of targets) {
    if (TARGET_ALIASES[t]) result.push(...TARGET_ALIASES[t]);
    else                    result.push(t);
  }
  return [...new Set(result)];
}

/**
 * 선택된 파일 목록에서 필요한 디렉터리 경로 집합을 계산한다.
 */
function computeNeededDirs(filteredFiles, projectRoot) {
  const needed = new Set();
  for (const file of filteredFiles) {
    // 파일의 상위 디렉터리를 재귀적으로 추가
    let rel = path.dirname(file.path);
    while (rel && rel !== '.') {
      needed.add(rel.replace(/\\/g, '/'));
      rel = path.dirname(rel);
    }
  }
  return needed;
}

module.exports = { buildInitPlan };
