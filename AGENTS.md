# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands

- Build: `npm run build` (`tsc -b && vite build`)
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Lint: `npm run lint` or `npx eslint .`
- Run all tests: `npm test` (`vitest run`) - must pass in the default parallel mode
- Test coverage: `npm run coverage` (`vitest run --coverage`)
- Run single test file: `npx vitest run src/utils/payment.test.ts`
- Run single test by name: `npx vitest run -t "matches regex"`

## Code Style & Conventions

- **Component exports**: Never export helper constants or non-components from component files (triggers `react-refresh/only-export-components`). Extract constants to standalone `.ts` files (e.g., `paymentTabs.ts`, `walletOptions.ts`).
- **Carbon SCSS imports**: Do not `@use '@carbon/react'` directly in styles. Foundation and component SCSS partials are loaded selectively in [`src/styles/_theme.scss`](src/styles/_theme.scss:1). When adding a new Carbon component, register its `@use '@carbon/react/scss/components/<name>'` partial in `_theme.scss`.
- **State & Storage**: All persistence uses safe helpers in [`src/utils/storage.ts`](src/utils/storage.ts:1) (`loadJSON`, `saveJSON`, `removeItem`) with `bookworm.*` keys from [`src/config/index.ts`](src/config/index.ts:19) to prevent crashes under storage quota or private browsing.
- **Checkout to Payment handoff**: Flow state transfers via `saveCheckoutDraft()` into localStorage; `/payment` expects this draft on mount or redirects to `/checkout`.
- **Testing & Timers**: Vitest runs with `pool: 'vmThreads'` and default timeouts (5s). Lazy routes are preloaded synchronously in [`src/test/setup.ts`](src/test/setup.ts:4) via `preloadRoutes()`. Tests must never wait real time: pass `paymentDelayMs={0}` or `navigationDelayMs={0}` to components with simulated async delays, or use `vi.useFakeTimers()`. For form tests, use `fireEvent.change` or `userEvent.paste` instead of typing character-by-character. Pure date/pricing functions accept an optional `now: Date` parameter.
- **Pricing calculations**: All cart, order, and checkout pricing must go through `calculatePricing()` in [`src/utils/pricing.ts`](src/utils/pricing.ts:40) to guarantee unified tax (12%), coupon, and gift point rules.

## Project rules (learned during development)

- Work from `docs/PLAN.md`: one sub-task at a time; update its status, handover notes and `PROMPTS.md`.
- Carbon design tokens only: no raw colours except `var()` fallbacks and `CoverPlaceholder` artwork.
- Data must match the design screens exactly (titles, prices, formats, authors).
- New components must be wired into the router/pages and covered by an integration test, not only unit tests.
- Never store card numbers or CVV; only the last 4 digits on the order.
- Quality gate = lint, typecheck, plain `npm test`, build.
- Say explicitly when something was not checked in a browser.
