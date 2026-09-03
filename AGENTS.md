# Project Guidance

## Read first

- This is a small, single-application React and TypeScript hiring project. Keep changes proportional to that scope.
- Read `README.md` for setup and product behavior. Read `AI/context.md` before changing architecture, routing, persistence, request lifecycle, theme behavior, or accessibility contracts.
- Write source code, tests, comments, and repository documentation in professional English.

## Stack and commands

- Use npm and preserve `package-lock.json`.
- The stack is React 19, strict TypeScript, Vite, React Router, Tailwind CSS v4, Vitest, and React Testing Library.
- Available checks are `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- Do not add a dependency when the platform or current stack already provides a clear solution.

## Architecture

- Keep application-wide code in `src/app`, user-domain code in `src/users`, genuinely cross-boundary UI in `src/shared/ui`, and shared test support in `src/test`.
- Within app and users boundaries, keep React modules in the established `components`, `hooks`, `pages`, and `providers` sections.
- Use lower-camel-case folder names and PascalCase filenames for React components. Keep focused tests beside the modules they verify.
- Import concrete modules. Do not add broad barrel exports or generic `screens`, `helpers`, `utils`, or `model` buckets.
- Keep `UsersListPage` and `UserDetailsPage` as separate lazy route entry points. Keep `UsersProvider` above their `Suspense` boundary and scoped to user routes so unrelated routes do not fetch users.

## Data and state invariants

- Treat API and persisted data as untrusted. Parse API JSON as `unknown` and validate the complete user shape before use.
- Preserve request cancellation and latest-request protection. Search, filtering, sorting, and pagination remain client-side derived data and must not trigger requests.
- Keep list state in the `q`, `city`, `sort=desc`, and `page` URL parameters with the existing normalization and history behavior.
- Preserve the versioned `user-name-overrides:v1` and `app-theme:v1` schemas. Store only user-name overrides, never complete API records.
- Keep base API users separate from local overrides. A failed storage write must not update in-memory state or report success.
- Do not introduce duplicated derived state or a global state library for the current scope.

## Implementation quality

- Keep TypeScript strict. Do not introduce `any`, suppress type errors, or disable lint rules to make checks pass.
- Prefer small, responsibility-based components and hooks, but do not extract single-use wrappers or create abstractions without a concrete reuse or boundary benefit.
- Preserve semantic HTML, labels, keyboard behavior, visible focus states, live status/error semantics, dark-mode contrast, and reduced-motion behavior.
- Use Tailwind utilities in components. Keep `src/app/styles.css` limited to the Tailwind import, theme tokens, dark variant, global base rules, and reduced-motion fallback.
- Use named Lucide imports. Remove debug output, dead code, and stale documentation as part of each change.
- Never add secrets, tokens, credentials, or credential-bearing Git URLs to the repository.

## Verification and delivery

- For source changes, run lint, strict type-checking, the full test suite, and the production build. Confirm the list and detail route chunks remain separate when routing or imports change.
- For visual changes, also check light and dark themes, mobile/tablet/desktop layouts, keyboard order, focus states, and relevant loading/error/empty states in a browser.
- Use `$frontend-quality-check` when asked to verify or finalize source and UI changes. Use the read-only `frontend_reviewer` agent for requested independent reviews or non-trivial changes that materially benefit from a separate review pass; do not delegate routine edits merely because the agent exists.
- Use `$project-skill-author` when asked to create or update a repository-scoped skill. Keep skill additions focused and avoid duplicating built-in capabilities or durable guidance already owned by this file.
- Report only checks that were actually completed. Update `README.md` and `AI/context.md` whenever documented behavior or architecture changes.
- Do not create Git commits or push changes unless the user explicitly requests it.
