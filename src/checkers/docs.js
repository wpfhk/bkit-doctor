'use strict';

const fs   = require('fs');
const path = require('path');

const DOC_DIRS = [
  { id: 'docs.plan',   title: 'docs/01-plan/ 존재',   rel: path.join('docs', '01-plan'),   label: 'Plan' },
  { id: 'docs.design', title: 'docs/02-design/ 존재', rel: path.join('docs', '02-design'), label: 'Design' },
  { id: 'docs.task',   title: 'docs/03-task/ 존재',   rel: path.join('docs', '03-task'),   label: 'Task' },
  { id: 'docs.report', title: 'docs/04-report/ 존재', rel: path.join('docs', '04-report'), label: 'Report' },
];

module.exports = DOC_DIRS.map(({ id, title, rel, label }) => ({
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
