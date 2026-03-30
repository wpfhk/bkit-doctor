'use strict';

module.exports = {
  subtitle:   'New Feature Development',
  background: 'Describe the user need or business opportunity behind this feature.',
  problem:    'What specific user pain point or missing capability does this solve?',
  goal:       'Define what the user can do after this feature ships.',
  criteria: [
    'Feature is functional and passes acceptance tests',
    'User-facing documentation or changelog is updated',
    'No regressions in existing functionality',
  ],
  risks: [
    { risk: 'Scope creep during implementation', impact: 'High', mitigation: 'Lock scope at Plan phase; defer extras to backlog' },
    { risk: 'Dependency on external API or service', impact: 'Medium', mitigation: 'Identify fallback or mock early' },
  ],
  strategy:   'Describe the implementation approach: architecture, dependencies, and rollout plan.',
  check:      'How will feature correctness and user impact be validated?',
  act:        'What follow-up improvements or iterations are needed post-launch?',
  followup: [
    'Monitor usage metrics after launch',
    'Collect user feedback and plan iteration',
  ],
};
