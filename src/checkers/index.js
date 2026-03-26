'use strict';

const structureCheckers = require('./structure');
const configCheckers    = require('./config');
const docsCheckers      = require('./docs');
const agentCheckers     = require('./agents');
const skillCheckers     = require('./skills');
const policiesCheckers  = require('./policies');
const miscCheckers      = require('./misc');

const DEFAULT_CHECKERS = [
  ...structureCheckers,
  ...configCheckers,
  ...docsCheckers,
  ...agentCheckers,
  ...skillCheckers,
  ...policiesCheckers,
  ...miscCheckers,
];

module.exports = { DEFAULT_CHECKERS };
