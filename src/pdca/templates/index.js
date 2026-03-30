'use strict';

/**
 * templates/index.js
 * type별 템플릿 hints를 등록하고 조회하는 레지스트리.
 * 새 type 추가 시 이 디렉터리에 파일 추가 + 여기에 등록만 하면 된다.
 */

const TEMPLATES = {
  guideline: require('./guideline'),
  feature:   require('./feature'),
  bugfix:    require('./bugfix'),
  refactor:  require('./refactor'),
};

const VALID_TYPES = Object.keys(TEMPLATES);

function getTemplate(type) {
  return TEMPLATES[type] || TEMPLATES.guideline;
}

module.exports = { TEMPLATES, VALID_TYPES, getTemplate };
