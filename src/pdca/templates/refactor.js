'use strict';

module.exports = {
  subtitle:   'Code / Architecture Improvement',
  background: 'Describe the technical debt or structural issue motivating this refactor.',
  problem:    'What specific code/architecture problem needs restructuring?',
  goal:       'Define the target state: cleaner API, better performance, reduced coupling, etc.',
  criteria: [
    'All existing tests pass without modification (functional equivalence)',
    'Performance is equal to or better than before',
    'Code complexity or coupling metric improves measurably',
  ],
  risks: [
    { risk: 'Behavioral change hidden by insufficient test coverage', impact: 'High', mitigation: 'Increase test coverage before starting refactor' },
    { risk: 'Refactor scope grows beyond original intent', impact: 'Medium', mitigation: 'Time-box the refactor; split into phases if needed' },
  ],
  strategy:   'Describe the refactor approach: incremental vs. big-bang, migration path.',
  check:      'How will functional equivalence and performance parity be verified?',
  act:        'What further cleanup or optimization remains after this refactor?',
  followup: [
    'Remove deprecated code paths after migration period',
    'Document new architecture for team onboarding',
  ],
};
