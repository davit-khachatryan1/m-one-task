# AI Development Context

## Purpose and scope

This repository contains a small, single-application React and TypeScript hiring project. It reads public user records from JSONPlaceholder and provides a searchable, filterable, sortable, paginated directory with routed details and browser-persisted name edits.

Keep changes proportional to this scope. There is no backend, authentication, authorization, analytics, server persistence, or design-system project. Do not introduce those concerns without an explicit product requirement.

Read `AGENTS.md` for repository-wide working rules and `README.md` for product decisions, setup, known limitations, and verified behavior.

## Technology and verification

- React 19 and React Router 7
- Strict TypeScript with `noUncheckedIndexedAccess`
- Vite 8 and npm
- Tailwind CSS v4 through `@tailwindcss/vite`
- Vitest, React Testing Library, and jsdom
- Lucide icons through named imports

The normal source-change quality gate is:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Use the repository skill `$frontend-quality-check` when a change needs final source or browser verification. Use `$project-skill-author` when creating or updating repository-scoped skills so their triggers, structure, and validation remain proportional. The project-scoped `frontend_reviewer` agent is a read-only independent reviewer for requested or non-trivial review work; it is not a replacement for the primary implementation agent.

## Architecture

Application-wide code lives in `src/app`. The user domain lives in `src/users`. Only UI that is genuinely useful across domain boundaries belongs in `src/shared/ui`, and shared test setup belongs in `src/test`.

Within app and user boundaries, use the established responsibility folders:

- `components` for focused presentational or interactive React components
- `hooks` for consumer-facing hooks and their tightly related pure rules
- `pages` for routed entry points
- `providers` for context ownership and shared lifecycle state
- user-specific `api`, `storage`, and `types` folders for those boundaries

Folders use lower camel case. React component filenames use PascalCase. Focused tests are colocated with the module they verify. Imports target concrete modules; do not add broad barrel files or generic `screens`, `helpers`, `utils`, or `model` buckets.

`UsersListPage` and `UserDetailsPage` are separate `React.lazy` entry points in `App.tsx`. `UsersRouteLayout` owns `UsersProvider` outside the `Suspense` boundary, which preserves fetched data and overrides during list/detail navigation. The provider is scoped to the `/users` route tree so unrelated and unknown routes do not fetch users. Do not introduce arbitrary manual chunk configuration.

## User data and API boundary

The only remote endpoint is:

```text
GET https://jsonplaceholder.typicode.com/users
```

`User`, `Address`, `Geo`, and `Company` in `src/users/types/user.ts` describe the complete fixture shape. Network JSON is untrusted: `fetchUsers` receives it as `unknown` and validates every required nested field before returning `User[]`. Keep this runtime validation if the transport code changes.

`UsersProvider` owns the base API users, local name overrides, loading status, request error, Retry action, and Save Name action. Each load has an `AbortController` and an incrementing request identifier. Starting a request aborts its predecessor, and aborted or superseded completions cannot update state. Unmounting the user route tree aborts the active request.

Search, filtering, sorting, and pagination operate only on the already loaded users. They must not start network requests, so fast typing cannot create search-response races.

## Directory and URL contract

`useUserDirectory` owns URL parsing, URL normalization, derived directory results, and list-control actions. The pure query behavior is colocated in `directoryQuery.ts`.

The query-string contract is:

- `q`: name/email search; outer whitespace is trimmed, repeated internal whitespace is collapsed, and comparison is case-insensitive
- `city`: one exact city value
- `sort=desc`: descending name sort; ascending is the default and is omitted
- `page`: one-based page number; page one and invalid or excessive pages are normalized away

The page size is five. Search, city, and sort updates reset the page and replace the current history entry. Pagination pushes a history entry. Empty/default values are not retained in the URL.

Detail links carry the complete current list URL in router state. The visible Back to users link returns to that URL, while direct detail entry falls back to `/users`. Do not replace browser history with custom back-button logic.

## Name persistence and merge rule

Only saved user names are persisted. Base API records remain separate and are never copied into storage. The storage key and schema are:

```json
{
  "version": 1,
  "names": {
    "1": "Locally edited name"
  }
}
```

The key is `user-name-overrides:v1`. Malformed JSON, an unsupported schema, or unavailable storage returns an empty override map without crashing.

The merged name comes from the local override when one exists; all other fields come from the latest API record. Saving the current API base name removes the redundant override. A storage write must succeed before in-memory overrides change or a success status is shown.

Only the name is editable. Save trims the draft and rejects an empty value. Cancel restores the latest merged name. Unsaved drafts do not survive navigation or reload.

## Theme contract

The resolved theme is `light | dark`. On first use, it follows `prefers-color-scheme` and continues responding to system changes until the user explicitly toggles the theme.

An explicit preference uses the `app-theme:v1` key and this schema:

```json
{
  "version": 1,
  "preference": "dark"
}
```

Malformed or unavailable storage falls back to the system theme. Initialization occurs before React mounts and applies the root `dark` class plus the document `color-scheme`. Preserve that pre-render initialization to avoid a noticeable theme flash.

## UI and accessibility contracts

The interface is functional and data-first. Light mode uses warm neutral surfaces; dark mode uses near-black and charcoal surfaces. Orange is reserved for primary actions, links, focus indicators, and small identity accents. Red and green remain semantic error and success colors.

At medium and larger widths, users render as one semantic table with compact, truncating columns. Below the medium breakpoint, those same table rows reflow into cards without a duplicate mobile DOM tree.

City and sort controls use the feature-specific `FilterDropdown` select-only combobox/listbox. Preserve its label association, expanded/controls/active-descendant state, selected option state, scrolling, outside-click dismissal, focus restoration, typeahead, and keyboard behavior for Arrow keys, Home, End, Enter, Space, Escape, and Tab.

Keep semantic headings and landmarks, associated form labels, visible focus states, keyboard order, `role="alert"` errors, `role="status"` success/loading feedback, sufficient contrast in both themes, and reduced-motion behavior. Do not solve visual changes by removing accessibility state.

## Testing strategy

Tests focus on behavior with meaningful regression value:

- directory search normalization, exact city filtering, both sort directions, pagination, and page clamping
- URL parsing and list-control updates
- storage validation, override precedence, initialization, redundant override removal, and write failure
- request failure followed by Retry success
- detail validation, Cancel, Save success, and persistence failure
- dropdown pointer, outside-click, focus, keyboard, and typeahead behavior
- theme system resolution, system changes, persisted preference, DOM application, and storage fallback
- root redirect, lazy list/detail routes, unknown routes without a user fetch, and list-state restoration

Use typed fixtures from `src/test/fixtures.ts`; do not ship mock records in production modules. Add tests for changed observable behavior, not private implementation details or assertions that only prove a component rendered.

For UI changes, supplement automated checks with browser QA in both themes, using keyboard and pointer input at representative mobile, tablet, and desktop widths. Record only checks that actually ran.

## Guardrails

- Do not weaken strict TypeScript, add `any`, suppress errors, or disable checks to make a change pass.
- Do not remove API validation, request cancellation, latest-request protection, URL normalization, storage validation, or accessibility behavior as simplification.
- Do not add a global state library, data-fetching library, component framework, custom design system, or dependency without a demonstrated need.
- Do not persist full users, unsaved drafts, search results, or derived list state. Keep list state in the URL and saved names in the existing versioned storage schema.
- Do not move user-domain rules into generic catch-all folders or create abstractions without a concrete reuse or ownership benefit.
- Do not add secrets, credentials, credential-bearing remotes, debug logging, dead code, or stale documentation.
- Do not create commits or push changes unless the user explicitly requests it.
