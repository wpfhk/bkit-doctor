'use strict';

/**
 * recommendationModel.js
 * recommendation 항목의 타입 정의
 *
 * @typedef {Object} Recommendation
 * @property {string}      target       — initTarget 이름 (targetRegistry 키)
 * @property {string}      [label]      — 사람이 읽는 짧은 이름
 * @property {string}      [description]— 생성 내용 설명
 * @property {string[]}    sources      — 이 추천을 발생시킨 checker id 목록
 */

/**
 * Recommendation 항목 생성 헬퍼
 * @param {string}   target
 * @param {string}   [label]
 * @param {string}   [description]
 * @param {string[]} sources
 * @returns {Recommendation}
 */
function makeRecommendation(target, label, description, sources) {
  return { target, label: label || null, description: description || null, sources };
}

module.exports = { makeRecommendation };
