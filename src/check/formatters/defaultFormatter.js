'use strict';

const { REMEDIATION_MAP }      = require('../../shared/remediationMap');
const { buildRecommendations } = require('../recommendations/buildRecommendations');
const { buildSuggestedFlow }   = require('../recommendations/buildSuggestedFlow');

const STATUS_LABEL = { pass: '[PASS]', warn: '[WARN]', fail: '[FAIL]' };
const CAT_ICON     = { ok: '✓', warn: '!', fail: '✗' };

const CATEGORY_ORDER = [
  'structure', 'config', 'docs',
  'agents', 'skills', 'policies', 'templates', 'context', 'changelog',
];

function overallStatus(pass, warn, fail) {
  if (fail > 0) return 'FAILED';
  if (warn > 0) return 'WARNING';
  return 'HEALTHY';
}

/** remediationMap의 fixHint / initTarget / label / description 주입 */
function enrich(results) {
  return results.map(r => {
    const rem = REMEDIATION_MAP[r.id] || {};
    return {
      ...r,
      fixHint:     rem.fixHint,
      initTarget:  rem.initTarget,
      label:       rem.label,
      description: rem.description,
    };
  });
}

/** 카테고리별 { pass, warn, fail } 집계 */
function groupByCategory(results) {
  const groups = {};
  for (const r of results) {
    const cat = r.category || r.id.split('.')[0];
    if (!groups[cat]) groups[cat] = { pass: 0, warn: 0, fail: 0 };
    groups[cat][r.status]++;
  }
  return groups;
}

/** 카테고리 한 줄 포맷 */
function catLine(cat, c) {
  const icon  = c.fail > 0 ? CAT_ICON.fail : c.warn > 0 ? CAT_ICON.warn : CAT_ICON.ok;
  const parts = [];
  if (c.pass > 0) parts.push(`${c.pass} pass`);
  if (c.warn > 0) parts.push(`${c.warn} warn`);
  if (c.fail > 0) parts.push(`${c.fail} fail`);
  return `  ${icon} ${cat.padEnd(12)}${parts.join('  ')}`;
}

/**
 * check 결과 전체 출력
 * @param {string}   targetPath
 * @param {Object[]} rawResults
 */
function format(targetPath, rawResults) {
  const results = enrich(rawResults);

  const pass   = results.filter(r => r.status === 'pass').length;
  const warn   = results.filter(r => r.status === 'warn').length;
  const fail   = results.filter(r => r.status === 'fail').length;
  const status = overallStatus(pass, warn, fail);

  console.log(`[bkit-doctor] 진단 대상: ${targetPath}`);
  console.log('');

  // ── 카테고리 요약 ──
  const groups      = groupByCategory(results);
  const orderedCats = [
    ...CATEGORY_ORDER.filter(c => groups[c]),
    ...Object.keys(groups).filter(c => !CATEGORY_ORDER.includes(c)),
  ];

  console.log('──── 카테고리 ' + '─'.repeat(26));
  for (const cat of orderedCats) {
    console.log(catLine(cat, groups[cat]));
  }
  console.log('');

  // ── 상세 ──
  console.log('──── 상세 ' + '─'.repeat(30));
  for (const r of results) {
    const label = STATUS_LABEL[r.status] || '[?]  ';
    console.log(`${label} ${r.id} — ${r.message}`);

    if (r.missing && r.missing.length > 0) {
      r.missing.forEach(m => console.log(`  없음: ${m}`));
    }
    if (r.fixHint && r.status !== 'pass') {
      console.log(`  → ${r.fixHint}`);
    }
  }

  // ── 총계 ──
  console.log('');
  console.log('──────────────────────────────────────');
  console.log(`총 ${results.length}개 — PASS ${pass} / WARN ${warn} / FAIL ${fail}   상태: ${status}`);

  // ── 추천 ──
  const { recommendations, unmappedCount, invalidCount } = buildRecommendations(results);
  const flow = buildSuggestedFlow(recommendations, warn + fail);

  if (!flow) {
    if (warn > 0 || fail > 0) {
      // 문제는 있으나 자동 추천 불가 (unmapped)
      console.log('');
      console.log('──── 추천 ' + '─'.repeat(30));
      console.log('  추천 가능한 init target이 없습니다.');
      if (unmappedCount > 0) {
        console.log(`  (${unmappedCount}개 항목은 자동 추천 대상이 아닙니다)`);
      }
    }
    return;
  }

  console.log('');
  console.log('──── 추천 ' + '─'.repeat(30));
  console.log(`  ${recommendations.length}개 추천 target (${warn + fail}개 문제 기반)`);
  console.log('');

  for (const rec of recommendations) {
    const desc = rec.description ? ` — ${rec.description}` : '';
    console.log(`  • ${rec.target}${desc}`);
  }

  if (invalidCount > 0) {
    console.log(`  (${invalidCount}개 항목은 유효하지 않은 target으로 제외)`);
  }

  console.log('');
  console.log('  Recommended next step:');
  console.log(`  ${flow.applyCommand}`);
  console.log('');
  console.log('  Preview first:');
  console.log(`  ${flow.previewCommand}`);
}

module.exports = { format };
