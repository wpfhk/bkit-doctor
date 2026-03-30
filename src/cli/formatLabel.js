'use strict';

/**
 * plan item action → 출력 레이블
 * @param {{ action: string }} item
 * @returns {string}
 */
function formatLabel(item) {
  switch (item.action) {
    case 'mkdir':     return '[MKDIR]    ';
    case 'mkdir-skip':return '[DIR-OK]   ';
    case 'create':    return '[CREATE]   ';
    case 'skip':      return '[SKIP]     ';
    case 'overwrite': return '[OVERWRITE]';
    default:          return '[?]        ';
  }
}

module.exports = { formatLabel };
