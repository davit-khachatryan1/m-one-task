# AI Development Context

## Purpose and scope

Small React + TypeScript hiring project. Reads JSONPlaceholder users into a searchable/filterable/sortable/paginated directory, a detail route, and local name edits.

No backend, auth, analytics, server persistence, or design system. Don't add any of those without an explicit requirement.

Read `AGENTS.md` for working rules, `README.md` for decisions and setup.

## Technology and verification

- React 19, React Router 7
- Strict TypeScript (`noUncheckedIndexedAccess`)
- Vite 8, npm
- Tailwind CSS v4
- Vitest, React Testing Library, jsdom
- Lucide icons, named imports

Quality gate: `npm run lint && npm run typecheck && npm test && npm run build`.

Use the `frontend-quality-check` Claude Code skill for final verification, `project-skill-author` for new repository skills, and the read-only `frontend-reviewer` subagent for independent review — it doesn't replace the primary implementation agent.

## Architecture

`src/app` = app-wide code, `src/users` = user domain, `src/shared` = cross-boundary (`ui`, `storage`), `src/test` = shared test setup.

Each module (component/hook/helper/etc.) gets its own lower-camel-case folder with a colocated test. Providers/contexts live directly in `providers`, no extra folder. No barrel files, no generic `screens`/`utils`/`model` buckets.

`UsersListPage`/`UserDetailsPage` are separate lazy routes under `UsersProvider` (outside `Suspense`), scoped to `/users` only.


## API and data

Only endpoint: `GET https://jsonplaceholder.typicode.com/users` — no query params, fetched once.

`fetchUsers` validates the raw JSON (`unknown` → `User[]`) before use; keep this validation if the transport changes.

`UsersProvider` owns base users, name overrides, status, error, Retry, and Save Name. One `AbortController` + request id guards the fetch and Retry, so a stale or superseded response can't update state — this matters because Retry can fire again before an earlier attempt resolves.

Search/filter/sort/pagination are pure client-side derivations (`selectUsersPage`) over the cached list — no debounce, no network race, because no interaction triggers a request. The detail page reads the user from that same cached list; it never fetches on its own.

## URL contract

Params: `search`, `city`, `sort=name-desc` (default `name-asc` is omitted), `page`. None reach the network — `fetchUsers` takes no params.

`city` matches as a case-insensitive substring, same as `search`. Page size is fixed at 10 (`USERS_PAGE_SIZE` in `directoryQuery.ts`), never in the URL; pagination only appears past 10 results.

Filter/sort changes reset the page and `replace` history; pagination `push`es. Empty/default values aren't kept in the URL.

This only works because the fixture is capped at 10 records — a real dataset needs this reverted to server-driven paging.

Detail links carry the current list URL in router state; direct entry falls back to `/users`. Don't replace this with custom back-button logic.

## Name persistence

Schema (`user-name-overrides:v1`): `{ "version": 1, "names": { "<id>": "name" } }`. Bad JSON/schema/storage → empty map, no crash.

Merge rule: the local override always wins for `name`; every other field is always the fresh API value. Saving the API's own name removes the override. A failed write must not update memory or report success.

Only `name` is editable; empty is rejected; Cancel resets the draft; drafts don't survive navigation or reload.

## Theme

`light | dark`, follows `prefers-color-scheme` until the user overrides it. Schema (`app-theme:v1`): `{ "version": 1, "preference": "dark" }`. Bad storage falls back to the system theme.

Theme class applies before React mounts to avoid a flash — keep that ordering.

## UI and accessibility

Cards, not a table, at every width (1/2/3 columns at the 640/1024px breakpoints). Brand orange marks primary actions/focus; accent lime marks avatars/selected state.

Sort uses a custom listbox (`FilterDropdown`) with full keyboard/typeahead/focus-restoration behavior — preserve it. City is a plain text input, not a listbox.

Keep semantic landmarks, labels, focus order, `role="alert"`/`role="status"`, contrast in both themes, and reduced-motion behavior.

## Testing

Covers: search/city filtering, both sort orders, pagination including the >10-record activation case, page clamping, URL parsing, storage validation/precedence/failure, request retry, the detail edit flow, dropdown interaction, theme resolution, and routing.

Use `src/test/fixtures.ts`. Test observable behavior, not implementation details or empty-render assertions.

For UI changes, do browser QA in both themes at representative widths with keyboard and pointer input.

## Guardrails

- Do not weaken strict TypeScript, add `any`, suppress errors, or disable checks to pass.
- Do not remove API validation, request cancellation, URL normalization, storage validation, or accessibility behavior as "simplification."
- Do not add a state/data-fetching library, component framework, or design system without a demonstrated need.
- Do not persist full users, drafts, or derived list state — list state lives in the URL, saved names in the versioned storage schema.
- Do not create catch-all folders or abstractions without a concrete reuse benefit.
- Do not add secrets, debug logging, dead code, or stale documentation.
- Do not commit or push unless the user explicitly requests it.
