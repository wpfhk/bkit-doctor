'use strict';

const fs   = require('fs');
const path = require('path');
const { getContent }            = require('./fileTemplates');
const { FILES }                 = require('./scaffoldManifest');
const { createBackupSession }   = require('../backup/createBackupSession');
const { copyToBackup }          = require('../backup/copyToBackup');
const { writeBackupManifest }   = require('../backup/backupManifest');

// filePath → file manifest entry lookup
const FILE_MAP = Object.fromEntries(FILES.map(f => [f.path, f]));

/**
 * applyInitPlan.js
 * buildInitPlan이 반환한 plan을 실제로 실행한다.
 *
 * @param {string}     projectRoot
 * @param {PlanItem[]} plan
 * @param {Object}     opts
 * @param {boolean}    opts.dryRun     true면 아무것도 쓰지 않음
 * @param {boolean}    opts.backup     true면 overwrite 전 백업 수행
 * @param {string}     [opts.backupDir]사용자 지정 백업 루트
 * @param {string}     [opts.preset]   preset 이름 (파일 내용 결정에 사용)
 * @returns {{ applied: PlanItem[], skipped: PlanItem[], blocked: PlanItem[], backupSession: string|null }}
 */
function applyInitPlan(projectRoot, plan, opts = {}) {
  const { dryRun = false, backup = false, backupDir, preset } = opts;
  const contentContext = preset ? { preset } : {};

  const applied  = [];
  const skipped  = [];
  const blocked  = [];
  let   backupSession = null;
  const backedUp = [];

  // 백업 세션 — overwrite 대상 있고 backup 옵션 켜진 경우에만 생성
  const needsBackup = backup && plan.some(p => p.action === 'overwrite');
  let sessionDir = null;
  let timestamp  = null;

  if (needsBackup && !dryRun) {
    const session = createBackupSession(projectRoot, backupDir);
    sessionDir    = session.sessionDir;
    timestamp     = session.timestamp;
    backupSession = sessionDir;
  }

  for (const item of plan) {
    if (item.kind === 'dir') {
      if (item.action === 'mkdir' && !dryRun) {
        fs.mkdirSync(path.join(projectRoot, item.path), { recursive: true });
      }
      if (item.action === 'mkdir') applied.push(item);
      else                          skipped.push(item);
      continue;
    }

    // 파일
    switch (item.action) {
      case 'create': {
        if (!dryRun) {
          const fileEntry = FILE_MAP[item.path];
          const content   = fileEntry ? getContent(fileEntry, contentContext) : '';
          const full      = path.join(projectRoot, item.path);
          fs.mkdirSync(path.dirname(full), { recursive: true });
          fs.writeFileSync(full, content, 'utf8');
        }
        applied.push(item);
        break;
      }

      case 'overwrite': {
        if (!dryRun) {
          // 백업 수행
          if (sessionDir) {
            copyToBackup(projectRoot, item.path, sessionDir);
            backedUp.push(item.path);
          }
          const fileEntry = FILE_MAP[item.path];
          const content   = fileEntry ? getContent(fileEntry, contentContext) : '';
          const full      = path.join(projectRoot, item.path);
          fs.writeFileSync(full, content, 'utf8');
        }
        applied.push(item);
        break;
      }

      case 'skip':
      default:
        skipped.push(item);
        break;
    }
  }

  // 백업 manifest 기록
  if (sessionDir && backedUp.length > 0) {
    writeBackupManifest(sessionDir, timestamp, backedUp);
  }

  return { applied, skipped, blocked, backupSession };
}

module.exports = { applyInitPlan };
