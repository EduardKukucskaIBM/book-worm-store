# Project Architecture Rules (Non-Obvious Only)

- **Checkout/Payment Decoupling**: `/checkout` and `/payment` communicate solely through a persistent snapshot object (`CheckoutDraft`) in `localStorage` under key `bookworm.checkoutDraft`, preventing state loss across page reloads without polluting global context.
- **Gift Point Delta Layer**: User sessions in `AuthProvider` do not overwrite seed user data in `src/data/users.json`. Instead, mutations are stored as a separate delta map in `localStorage` under `bookworm.giftPointAdjustments` and applied on top of the session user.
- **Tree-Shaken Carbon Styling**: Carbon component SCSS files are imported individually in `src/styles/_theme.scss` rather than loading the monolithic bundle, saving ~1.27 MB of CSS payload.
- **Async Route Preloading in Tests**: Routes are code-split using `React.lazy` in [`src/router/lazyPages.ts`](../../src/router/lazyPages.ts:1). `src/test/setup.ts` eagerly preloads all route chunks via `preloadRoutes()` so test suites run against resolved components with default timeouts instead of relying on raised async timeouts.
- **Deterministic Time Injections**: Business logic calculating expiry, delivery dates, and cancellation windows relies on explicit `now: Date` arguments rather than ambient `Date.now()`.
