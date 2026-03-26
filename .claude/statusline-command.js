#!/usr/bin/env node
'use strict';

// Claude Code statusLine — stdin으로 session JSON 수신
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(Buffer.concat(chunks).toString()); } catch {}

  const model     = data.model?.display_name || '';
  const ctx       = data.context_window || {};
  const usedPct   = ctx.used_percentage;
  const ctxSize   = ctx.context_window_size || 200000;
  const usage     = ctx.current_usage || {};
  const totalUsed = (usage.input_tokens || 0)
                  + (usage.cache_read_input_tokens || 0)
                  + (usage.cache_creation_input_tokens || 0);

  const cost      = data.cost?.total_cost_usd;
  const rate5h    = data.rate_limits?.five_hour?.used_percentage;

  // git branch (동기 실행)
  let branch = '';
  try {
    const { execSync } = require('child_process');
    branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe']
    }).toString().trim();
  } catch {}

  // context 색상 아이콘
  let ctxIcon = '🟢';
  if      (usedPct >= 80) ctxIcon = '🔴';
  else if (usedPct >= 50) ctxIcon = '🟡';

  // 출력 조합
  const parts = [];

  if (model) parts.push(model);

  if (usedPct !== undefined) {
    const kUsed = Math.round(totalUsed / 1000);
    const kMax  = Math.round(ctxSize  / 1000);
    parts.push(`${ctxIcon} ctx ${usedPct}% (${kUsed}k/${kMax}k)`);
  }

  if (rate5h !== undefined) {
    const rateIcon = rate5h >= 80 ? '⚠️ ' : '';
    parts.push(`${rateIcon}rate ${rate5h}%`);
  }

  if (cost !== undefined) {
    parts.push(`$${cost.toFixed(3)}`);
  }

  if (branch) parts.push(`⎇ ${branch}`);

  process.stdout.write(parts.length ? parts.join(' │ ') : 'bkit-doctor');
});
