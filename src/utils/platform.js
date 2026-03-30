'use strict';

/**
 * 현재 OS 플랫폼 반환
 * @returns {'mac' | 'windows' | 'linux' | 'unknown'}
 */
function getPlatform() {
  const p = process.platform;
  if (p === 'darwin') return 'mac';
  if (p === 'win32') return 'windows';
  if (p === 'linux') return 'linux';
  return 'unknown';
}

module.exports = { getPlatform };
