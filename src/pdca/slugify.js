'use strict';

/**
 * slugify.js
 * topic 문자열을 파일명에 안전한 slug로 변환
 * 한글/영문/숫자 대응
 */

function slugify(topic) {
  const slug = topic
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'untitled';
}

module.exports = { slugify };
