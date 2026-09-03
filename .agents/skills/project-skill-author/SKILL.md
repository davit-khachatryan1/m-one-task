---
name: project-skill-author
description: Create or update repository-scoped Codex skills under .agents/skills for this project. Use when the user asks to add, design, refactor, or validate a project skill; do not use for application features, personal skills, plugins, agents, hooks, or MCP configuration.
---

# Project Skill Author

Create focused repository skills that improve repeated work without duplicating general Codex capabilities or project documentation.

## Establish the need

- Read `AGENTS.md` and `AI/context.md`, then inspect the existing `.agents/skills` folders before proposing or editing a skill.
- Confirm that the requested behavior is repeatable, repository-specific, and non-obvious enough to justify a skill. Prefer `AGENTS.md` for universal project rules and the current task prompt for one-off instructions.
- Avoid names or descriptions that shadow an existing system or repository skill. Extend or refine an existing skill when its responsibility already covers the request.

## Define the skill

- Place the skill at `.agents/skills/<skill-name>/SKILL.md`.
- Use a lowercase, hyphen-separated name of at most 64 characters and make the folder name match it.
- Write a concise description that states when the skill should and should not trigger. Keep implicit invocation enabled unless the user explicitly requests an explicit-only skill.
- Write instructions in professional English. Preserve user intent, repository scope, and existing authorization boundaries.
- Include only guidance that changes decisions or makes the workflow more reliable. Do not copy broad sections from `AGENTS.md`, `README.md`, `AI/context.md`, framework documentation, or another skill.

## Keep the structure proportional

- Create only `SKILL.md` by default.
- Add `scripts` only for repeated deterministic operations, `references` only for substantial conditional knowledge, and `assets` only for files used in generated output.
- Add `agents/openai.yaml` only when the user requests UI metadata, invocation policy, or tool dependencies.
- Do not add placeholder directories, sample files, skill-specific README files, changelogs, plugins, hooks, agents, or MCP configuration unless the request independently justifies them.

## Validate and report

- Run the current system `skill-creator` validator against every created or changed skill when it is available.
- Check the frontmatter, name/folder match, trigger boundaries, unfinished placeholders, internal links, duplication, and conflicts with repository instructions.
- Confirm discovery with a fresh Codex prompt-context check when practical. Do not start a costly agent run solely to prove discovery when local prompt inspection is sufficient.
- Report the files created or updated, validation performed, and any limitation. Do not claim a skill was discovered or behaviorally tested unless that check actually ran.
- Do not commit or push unless the user explicitly requests it.
