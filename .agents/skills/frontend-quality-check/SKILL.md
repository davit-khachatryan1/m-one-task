---
name: frontend-quality-check
description: Verify frontend source or UI changes in this React repository before delivery. Use when reviewing, finalizing, or validating behavior, accessibility, responsiveness, tests, build output, or documentation; do not use for ordinary questions that do not change the repository.
---

# Frontend Quality Check

Validate the change against repository contracts and report evidence, not assumptions.

## Ground the review

- Read `AGENTS.md`, `README.md`, and `AI/context.md` before checking behavior or architecture.
- Inspect `git status` and the relevant diff. Preserve unrelated user changes and do not broaden the requested scope.
- Identify which documented contracts the change can affect before choosing focused checks.

## Run automated checks

- For source changes, run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- If routing or imports changed, confirm the build still emits separate `UsersListPage` and `UserDetailsPage` JavaScript chunks.
- Treat every warning or failure as evidence to investigate. Do not disable checks or rewrite unrelated files to obtain a passing result.

## Audit the affected code

- Check for unsafe types, TypeScript suppressions, disabled lint rules, debug output, dead code, stale imports, invalid Tailwind utility names, secrets, and documentation drift.
- Recheck the relevant URL, storage, request-lifecycle, provider-ownership, route-splitting, and accessibility contracts documented in `AI/context.md`.
- Ensure tests cover observable behavior and failure modes rather than implementation wording or empty render assertions.

## Perform browser QA when the UI changes

- Use the available browser tooling against the local application. Start the existing npm development server only when needed.
- Check both themes and representative widths: 390, 768, 873, 1024, and 1440 pixels.
- Exercise the changed flow with keyboard and pointer input. Inspect focus visibility and order, responsive layout, relevant loading/error/empty states, and the browser console.
- Test only failure states that can be exercised safely. Do not add artificial production behavior solely to make QA convenient.

## Report results

- Lead with the overall outcome, then list failures or residual risks with reproduction details.
- State exactly which automated and browser checks ran. Never claim a viewport, theme, input method, error state, or command was verified when it was not.
- Do not commit, push, publish, or mutate external systems unless the user explicitly requests it.
