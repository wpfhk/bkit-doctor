'use strict';

const fs   = require('fs');
const path = require('path');

const DOC_DIRS = [
  { id: 'docs.pdca',   title: 'output/pdca/ 존재',   rel: path.join('output', 'pdca'),   label: 'PDCA' },
  { id: 'docs.plan',   title: 'docs/01-plan/ 존재',   rel: path.join('docs', '01-plan'),   label: 'Plan' },
  { id: 'docs.design', title: 'docs/02-design/ 존재', rel: path.join('docs', '02-design'), label: 'Design' },
  { id: 'docs.task',   title: 'docs/03-task/ 존재',   rel: path.join('docs', '03-task'),   label: 'Task' },
  { id: 'docs.report', title: 'docs/04-report/ 존재', rel: path.join('docs', '04-report'), label: 'Report' },
];

const dirCheckers = DOC_DIRS.map(({ id, title, rel, label }) => ({
  id,
  title,
  severity: 'warning',
  async run(context) {
    const expected = [rel];
    const exists   = fs.existsSync(path.join(context.projectRoot, rel));
    return exists
      ? { status: 'pass', message: `${rel} 존재`, found: expected, expected }
      : { status: 'warn', message: `${rel} 없음 — ${label} 문서 미작성`, missing: expected, expected };
  },
}));

// ── PDCA content checks ──────────────────────────────────────────────────────

const PDCA_REQUIRED_SECTIONS = ['## Meta', '## 1. Plan', '## 2. Do', '## 3. Check', '## 4. Act'];

const pdcaContentChecker = {
  id: 'docs.pdca-content',
  title: 'PDCA guide 최소 1개 존재 및 구조 검증',
  severity: 'warning',
  async run(context) {
    const pdcaDir = path.join(context.projectRoot, 'output', 'pdca');

    if (!fs.existsSync(pdcaDir)) {
      return { status: 'warn', message: 'output/pdca/ 없음 — PDCA guide 검사 생략' };
    }

    const files = fs.readdirSync(pdcaDir).filter(f => f.endsWith('.md') && f !== 'README.md');

    if (files.length === 0) {
      return { status: 'warn', message: 'output/pdca/ 에 PDCA guide 파일 없음' };
    }

    // check first guide file for required sections
    const firstFile = path.join(pdcaDir, files[0]);
    const content = fs.readFileSync(firstFile, 'utf8');
    const missing = PDCA_REQUIRED_SECTIONS.filter(s => !content.includes(s));

    if (missing.length > 0) {
      return {
        status: 'warn',
        message: `${files[0]}: 누락 섹션 — ${missing.join(', ')}`,
      };
    }

    return {
      status: 'pass',
      message: `PDCA guide ${files.length}개 존재, 구조 정상`,
    };
  },
};

module.exports = [...dirCheckers, pdcaContentChecker];
