'use strict';

const fs   = require('fs');
const path = require('path');

const STATE_DIR  = '.bkit-doctor';
const STATE_FILE = 'pdca-state.json';

/**
 * state.js
 * PDCA 문서 생성/진행 상태를 추적하는 최소 상태 파일.
 * 복잡한 상태 전이 로직은 포함하지 않는다.
 *
 * 구조:
 * {
 *   "topics": {
 *     "<slug>": {
 *       "topic": "...",
 *       "slug": "...",
 *       "type": "...",
 *       "owner": "...",
 *       "priority": "...",
 *       "createdAt": "...",
 *       "updatedAt": "...",
 *       "currentStage": "create" | "plan" | "do" | "check" | "report",
 *       "files": { "create": "path", "plan": "path", ... }
 *     }
 *   }
 * }
 */

function statePath(projectRoot) {
  return path.join(projectRoot, STATE_DIR, STATE_FILE);
}

function loadState(projectRoot) {
  const p = statePath(projectRoot);
  if (!fs.existsSync(p)) return { topics: {} };

  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return { topics: {} };
  }
}

function saveState(projectRoot, state) {
  const dir = path.join(projectRoot, STATE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath(projectRoot), JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function updateTopic(projectRoot, { slug, topic, type, owner, priority, stage, filePath }) {
  const state = loadState(projectRoot);
  const now   = new Date().toISOString().slice(0, 10);

  const existing = state.topics[slug] || {
    topic,
    slug,
    type,
    owner,
    priority,
    createdAt: now,
    updatedAt: now,
    currentStage: stage,
    files: {},
  };

  existing.updatedAt    = now;
  existing.currentStage = stage;
  existing.type         = type || existing.type;
  existing.owner        = owner || existing.owner;
  existing.priority     = priority || existing.priority;

  if (filePath) {
    existing.files[stage] = filePath;
  }

  state.topics[slug] = existing;
  saveState(projectRoot, state);

  return existing;
}

function getTopic(projectRoot, slug) {
  const state = loadState(projectRoot);
  return state.topics[slug] || null;
}

function listTopics(projectRoot) {
  const state = loadState(projectRoot);
  return Object.values(state.topics);
}

module.exports = { loadState, saveState, updateTopic, getTopic, listTopics, statePath };
