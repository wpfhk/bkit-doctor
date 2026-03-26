'use strict';

const fs   = require('fs');
const path = require('path');

module.exports = [
  {
    id: 'structure.claude-root',
    title: '.claude/ 디렉터리 존재',
    severity: 'error',
    async run(context) {
      const rel    = '.claude';
      const exists = fs.existsSync(path.join(context.projectRoot, rel));
      return exists
        ? { status: 'pass', message: '.claude/ 존재', found: [rel], expected: [rel] }
        : { status: 'fail', message: '.claude/ 없음 — bkit 운영 환경 미설정', missing: [rel], expected: [rel] };
    },
  },
];
