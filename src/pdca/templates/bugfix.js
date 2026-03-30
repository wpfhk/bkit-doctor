'use strict';

module.exports = {
  subtitle:   'Bug Fix / Incident Response',
  background: 'Describe when and how the bug was discovered, and its impact.',
  problem:    'What is the root cause? Include reproduction steps if known.',
  goal:       'Define what "fixed" looks like — expected behavior after the fix.',
  criteria: [
    'Bug no longer reproduces under original conditions',
    'Regression test added to prevent recurrence',
    'Affected users or systems are verified to work correctly',
  ],
  risks: [
    { risk: 'Fix introduces a new regression', impact: 'High', mitigation: 'Add targeted regression tests before merging' },
    { risk: 'Root cause is misidentified', impact: 'High', mitigation: 'Verify fix against multiple reproduction scenarios' },
  ],
  strategy:   'Describe the fix approach and how to avoid regressions.',
  check:      'How will the fix be verified? Include regression test criteria.',
  act:        'What systemic changes prevent recurrence (monitoring, tests, process)?',
  followup: [
    'Add monitoring or alerting for the failure mode',
    'Update runbook if this is a recurring issue pattern',
  ],
};
