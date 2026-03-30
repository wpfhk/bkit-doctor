'use strict';

/**
 * claudeTemplate.js
 * Default CLAUDE.md content template for new projects.
 *
 * Generates a practical CLAUDE.md that gives Claude Code enough context
 * to work effectively: project identity, conventions, workflow rules.
 */

function buildClaudeContent(projectName, options = {}) {
  const name = projectName || 'my-project';
  const lang = options.language || 'en';

  return `# ${name} — Project Rules

> This file is the primary context for Claude Code. It is loaded automatically at session start.

---

## Project

- **Name**: ${name}
- **Description**: (describe your project in 1-2 sentences)
- **Tech Stack**: (e.g., Node.js, React, Python, Go)
- **Node Version**: (e.g., >= 18)

---

## Conventions

### Code Style
- Follow existing patterns in the codebase
- Prefer small, focused functions
- Use descriptive variable names

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/) format
- Keep commits small and atomic
- Write commit messages that explain "why", not just "what"

### File Organization
- Source code: \`src/\`
- Tests: \`tests/\`
- Documentation: \`docs/\`

---

## Workflow

1. Understand the task before writing code
2. Check existing code for similar patterns
3. Write tests for new functionality
4. Keep changes minimal and focused

---

## Restrictions

- Do not auto-deploy
- Do not expose secrets or credentials
- Do not modify files outside the project directory without confirmation

---

## Documentation

This project uses bkit-doctor for structure management:

\`\`\`bash
bkit-doctor check          # diagnose project structure
bkit-doctor fix --yes      # auto-fix structural issues
bkit-doctor pdca "<topic>" # generate PDCA guide documents
\`\`\`
`;
}

module.exports = { buildClaudeContent };
