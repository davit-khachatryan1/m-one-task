# Users

## Level

Middle Frontend Developer

## How to run

Requirements: Node.js 22 or another version supported by Vite 8, and npm.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Decisions

- The application uses React 19, strict TypeScript, React Router, Vite, and Tailwind CSS v4. Tailwind keeps responsive light/dark styling colocated without introducing a component library or design system.
- `/users` contains search by name or email, an exact single-city filter, locale-aware name sorting, and five-record client-side pagination. The fixture has only ten users, but pagination makes larger-list behavior visible. A production-scale dataset would require a server-side contract.
- List state is stored in the `q`, `city`, `sort=desc`, and `page` URL parameters. Search, filter, and sort replace history and reset page one; pagination pushes history. This preserves reload and Back behavior without duplicating state.
- `/users/:userId` is a separate lazy route. Detail links carry the originating list URL, while direct entry falls back to `/users`.
- Vercel uses the root `vercel.json` SPA rewrite so direct visits and refreshes under `/users` serve the application before React Router resolves the route. The production document also declares a favicon, crawler policy, and an early connection to the users API.
- The users route provider fetches once, validates the complete API response from `unknown`, and uses `AbortController` plus a latest-request identifier. Search and filtering are local, so typing does not create requests that can resolve out of order.
- Loading, request error with Retry, empty API data, no matching filters, and unknown user IDs have distinct UI states. No artificial failures or delays are shipped in production code.
- Only successfully saved names persist in `localStorage` under the versioned `user-name-overrides:v1` schema. A local name overrides the fresh API name; every other field remains fresh from the API. Saving the API name removes the redundant override, and a failed storage write does not update memory or report success.
- Names are trimmed and cannot be empty. Unsaved drafts do not persist because only confirmed edits represent user intent.
- The responsive UI uses one semantic table that reflows into cards below the medium breakpoint. The custom city and sort listboxes provide themed popups, keyboard navigation, typeahead, focus restoration, and appropriate ARIA state without adding a UI dependency.
- An explicit light/dark preference persists under `app-theme:v1`; otherwise the application follows system color-scheme changes. Reduced motion, visible focus, semantic feedback, keyboard use, and pointer use are supported.
- Tests are included because URL normalization, persistence precedence, storage failure, request retry/race protection, custom listbox behavior, semantic detail markup, routing, and theme behavior have meaningful regression risk. The current suite contains 27 behavior tests.
- Ambiguities were resolved as follows: city filtering is single-select; editing occurs only on the detail page; pagination is client-side; only saved names and explicit theme choice use browser storage; URL state preserves list controls; name validation adds no unrequested length or character restrictions; cross-tab synchronization, backend persistence, authentication, conflict versioning, and analytics are out of scope.
- Verification covered automated linting, strict type-checking, 27 tests, and a production build with separate list/detail chunks. Three mobile Lighthouse runs per route in isolated headless Chrome, with browser and component extensions disabled, produced median scores of 98 Performance and 100 Accessibility, Best Practices, and SEO for both `/users` and `/users/1`; median LCP was 2.18 seconds and 2.24 seconds respectively, with zero blocking time and layout shift. Regular-profile DevTools audits are not used as acceptance evidence because extension scripts can be included in their diagnostics. Browser checks covered light/dark themes, keyboard and pointer interaction, and 390, 768, 873, 1024, and 1440 pixel widths. Network failure and Retry are covered by an integration test rather than production-only simulation.

## What is still wrong with this

- Saved names and theme preference are limited to one browser profile and do not synchronize across tabs or devices.
- The entire dataset must be downloaded before client-side search, sorting, filtering, and pagination can run.
- Browser checks and focused tests are not a complete physical-device or screen-reader certification matrix.
- The current Git history contains one broad implementation commit rather than several focused commits that explain the evolution of the work.

## What I would need before building this for real

- Expected dataset size and the server contract for search, filtering, stable sorting, pagination, and totals
- Authentication, view/edit permissions, API write behavior, validation rules, and concurrent-edit conflict handling
- Required browsers, devices, screen readers, accessibility target, and cross-device persistence expectations
- Monitoring, privacy, analytics, audit-history, and error-reporting requirements
