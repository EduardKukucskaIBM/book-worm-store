# Project Documentation Rules (Non-Obvious Only)

- **Pure Client-Side SPA**: There is no live backend server or REST API; all async calls in [`src/api/`](../../src/api/index.ts:1) resolve against static data in `src/data/*.json` and persist mutations into `localStorage`.
- **Guest Access Scope**: Guests can view all catalogue pages, add books to cart, and complete orders at `/checkout` and `/payment`. Only `/orders` requires login and is protected by `RequireAuth`.
- **Theme Delivery**: The app uses the Carbon **g100** dark theme, activated at runtime via `<Theme theme="g100">` in [`src/App.tsx`](../../src/App.tsx:8) with matching CSS custom properties, while SCSS foundation tokens are declared in [`src/styles/_theme.scss`](../../src/styles/_theme.scss:1).
- **Order Cancellation Policy**: Orders are only cancellable when in `confirmed` status within 48 hours of placement (`CANCEL_WINDOW_HOURS = 48` in [`src/config/index.ts`](../../src/config/index.ts:5)). Delivered or cancelled orders cannot be cancelled.
- **Route Layout Structure**: Standard pages use `PageLayout` with max-width container, Home uses `PageLayout fullBleed` to allow flush sidebar styling, while `/payment` and `/confirmation/:orderId` use `BackdropLayout`.
