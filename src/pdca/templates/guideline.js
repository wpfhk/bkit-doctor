'use strict';

module.exports = {
  subtitle:   'Policy / Operational Standard',
  background: 'Describe the policy or operational context that requires this guideline.',
  problem:    'What gap in current process or standard does this address?',
  goal:       'Define the standard or criteria this guideline establishes.',
  criteria: [
    'Guideline is reviewed and approved by stakeholders',
    'Target audience has been notified and trained',
    'Compliance can be measured or audited',
  ],
  risks: [
    { risk: 'Guideline is too vague to enforce consistently', impact: 'Medium', mitigation: 'Include concrete examples and decision criteria' },
    { risk: 'Stakeholders are not aware of the new standard', impact: 'High', mitigation: 'Send announcement and run walkthrough session' },
  ],
  strategy:   'Describe the rollout approach: communication, training, or phased adoption.',
  check:      'How will compliance or adoption be measured?',
  act:        'What refinements are needed based on adoption feedback?',
  followup: [
    'Schedule periodic review to keep guideline current',
    'Collect feedback from teams applying the guideline',
  ],
};
