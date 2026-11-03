# Book Worm - responsive e-bookstore

Book Worm is a responsive, accessible modern e-bookstore web application built with React, TypeScript, Vite, and IBM Carbon Design System. Developed with **IBM Bob** as the capstone project for the Applied AI Specialist-Experience Front End Reskill (Experienced) learning path, it delivers an end-to-end book shopping experience—from catalogue exploration and personalized recommendations to checkout, multi-method payment simulation, and order management with a 48-hour cancellation window.

---

## Features (Customer Journeys)

All 12 core customer journeys defined in [`docs/PLAN.md`](docs/PLAN.md) are fully implemented:

1. **J1 — Login (optional):** Authenticate with demo credentials or continue as a guest; cart contents persist seamlessly across login state transitions.
2. **J2 — Categories:** Filter catalogue shelves and views via parent and leaf category navigation in the sidebar and deep-links.
3. **J3 — Browse by publisher ("brands"):** Discover titles by specific publishing houses through PDP badges and sidebar publisher links.
4. **J4 — Product with delivery date and related books:** View detailed book metadata, format badges, dynamic delivery dates (or instant eBook downloads), reviews, and related reads.
5. **J5 — Basket:** Manage item quantities with step controls, remove items, and see immediate live subtotal, tax, and discount updates.
6. **J6 — Recommendations from order history:** Receive personalized "Recommended for You" suggestions based on past purchases, falling back to curated bestsellers for guests.
7. **J7 — Delivery address:** Complete structured shipping address forms with field validation and one-click autofill for logged-in users with saved profiles.
8. **J8 — Payment options:** Select across Credit Card, Debit Card, UPI, and Digital Wallet tabs with format masking and client-side validation.
9. **J9 — Gift points (logged-in only):** Redeem accrued reward points (1 point = ₹1) against payable totals with automatic balance updates and refund on cancellation.
10. **J10 — Payment confirmation:** Experience simulated gateway processing with coupon discount application (`BOOKWORM100`) and deterministic success/failure test pathways.
11. **J11 — Purchase confirmation with cancel-within-48h:** Review confirmed order summaries and cancel eligible orders within a 48-hour window with automatic point restoration.
12. **J12 — Order history with "Buy it again":** Access previous order receipts, monitor statuses, initiate cancellations, or instantly re-add past items to the basket.

---

## Tech Stack

- **Core & Framework:** React 19, TypeScript 5.8, Vite 8
- **Design System & Styling:** IBM Carbon Design System (`@carbon/react`, `@carbon/icons-react`, Sass)
- **Routing:** React Router v7 (`react-router-dom`)
- **Testing & Tooling:** Vitest, React Testing Library, `@testing-library/user-event`, `@vitest/coverage-v8`, ESLint 9 (`eslint-plugin-jsx-a11y`, `eslint-plugin-react-hooks`)

---

## Folder Structure

```text
book-worm-store/
├── docs/                     # Architecture, project plan, OpenAPI specs, and data models
│   ├── PLAN.md               # Master blueprint, sub-tasks, and implementation handovers
│   ├── data-model.md         # PostgreSQL database schema & ER diagram
│   └── openapi.yaml          # OpenAPI 3.0 specification for backend services
├── src/
│   ├── api/                  # Async data access layer & mock backend services
│   ├── components/           # Carbon-themed reusable UI components
│   ├── config/               # Application constants (tax rates, cancel windows, storage keys)
│   ├── context/              # React Context providers (Auth, Cart, Orders, Wishlist)
│   ├── data/                 # Seed JSON datasets (books, authors, categories, publishers, users)
│   ├── hooks/                # Custom React hooks (filtering, recommendations)
│   ├── pages/                # Lazy-loaded route views (Home, ProductDetail, Checkout, Payment, etc.)
│   ├── router/               # Route declarations, layout definitions, and route preloading
│   ├── styles/               # Selective Carbon partials and global SCSS themes
│   ├── test/                 # Test helpers, mocks, and global setup
│   ├── types/                # Domain TypeScript models and interfaces
│   ├── utils/                # Pure utility functions (pricing, dates, cards, cancellation)
│   ├── App.tsx               # Root application entry
│   └── main.tsx              # DOM mount entry point
├── AGENTS.md                 # Agent development guidelines and repository rules
├── PROMPTS.md                # Audit trail of AI-assisted engineering prompts and reviews
├── package.json              # Project scripts and dependencies
└── vite.config.ts            # Vite bundler & Vitest test runner configuration
```

---

## Getting Started

### Installation

```bash
# Clone repository and install dependencies
npm install
```

### Development & Build Commands

```bash
# Start local development server with HMR
npm run dev

# Run static type checking
npm run typecheck

# Execute ESLint validation (including accessibility rules)
npm run lint

# Run all unit and integration tests (Vitest parallel execution)
npm test

# Generate test coverage report
npm run coverage

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Demo Credentials & Test Data

The application comes pre-loaded with mock datasets in [`src/data/`](src/data/):

- **Demo User Login:**
  - Email: `demo@bookworm.com`
  - Password: `bookworm123`
  - Seed state: Saved shipping address, 250 gift points, and historical orders.
- **Promotional Coupon:**
  - Code: `BOOKWORM100` (Reduces payable order total by ₹100).
- **Test Payment Cards:**
  - **Success Card:** `4111-1111-1111-1111` (Standard Luhn-valid card, triggers successful payment).
  - **Simulated Failure Card:** `4000-0000-0000-0002` (Luhn-valid test card designated to trigger simulated gateway decline).

---

## Quality & Performance

Quality checks:

- **Automated Tests:** 284 tests across 42 test suites (`100% passing` in default parallel `vmThreads` mode).
- **Code Coverage:** **90.6%** line coverage / **81.7%** branch coverage across utility, context, and component layers.
- **Lighthouse (home page, mobile):** **100** Accessibility, **100** Best Practices.
- **Bundle Optimization:**
  - Selective Carbon component styling (only required partials imported).
  - Route-level code splitting via `React.lazy` with eager route preloading.

| Asset Metric         | Pre-optimization             | Production Bundle                                  |
| -------------------- | ---------------------------- | -------------------------------------------------- |
| **Main CSS**         | 1,274.59 kB (gzip 119.53 kB) | **421.74 kB** (gzip 38.89 kB)                      |
| **Total CSS**        | 1,274.59 kB                  | **≈ 465.5 kB**                                     |
| **Largest JS Chunk** | 621.66 kB (gzip 184.43 kB)   | **268.51 kB** (gzip 83.94 kB)                      |
| **Total JS Bundle**  | 621.66 kB (monolithic)       | **≈ 642.2 kB** (split across ~45 on-demand chunks) |
| **Chunk Warning**    | Exceeded 500 kB limit        | **0 warnings** (all chunks < 270 kB)               |

---

## How I used IBM Bob

- **Plan before code.** I gave Bob the six design screens in Plan mode and asked for a plan
  only. It produced `docs/PLAN.md` (routes, components, data model, responsive rules,
  12 sub-tasks) and flagged inconsistencies in the designs. I answered its open questions and
  overrode some proposals: I required tests (it proposed none) and allowed guest checkout.
- **One sub-task per chat.** Each sub-task ran in a fresh Agent-mode chat, with handover notes
  in the plan as persistent context. Later I formalised this with `/init` and `AGENTS.md`,
  adding the project rules I had learned.
- **Review everything in the browser, not just the tests.** Bob's gates were often green while
  the app was wrong: the header was built but never wired into the router (99 tests passed),
  7 of 9 prices didn't match the designs, raw hex colours slipped in despite "tokens only",
  and a fixed Pay Now bar covered content on mobile.
- **Don't accept masked problems.** When Bob ran tests in sequential mode and raised timeouts
  to hide slow tests, I required the root fix: injectable delays brought the suite from
  ~60–130 s to ~35 s with default timeouts.
- **Where Bob shone.** Scaffolding, resolving a TypeScript/ESLint version conflict on its own,
  an open-redirect guard I hadn't asked for, code splitting that cut the CSS from 1.27 MB to
  422 kB, and running Lighthouse and responsive checks in headless Chrome.
- **What I'd do differently.** Run `/init` on day one, and write the browser checks into each
  prompt from the start.

Every prompt and my review of the result is logged in [`PROMPTS.md`](PROMPTS.md).

---

## Known Limitations

As outlined in the architectural specification in [`docs/PLAN.md`](docs/PLAN.md):

- **Guest orders:** a guest's order confirmation can be opened by anyone who has its link.
- **Mock Payment Gateway:** Payment transactions simulate realistic asynchronous gateway processing delays (1.5s), but do not connect to a real banking network. Card details are validated client-side and never stored or transmitted.
- **Mock Authentication:** Login authenticates against local seeded data without server-side JWT issuance or session expiry. Session state is retained in browser storage (`bookworm.session`).
- **Client-Side Storage Isolation:** Shopping cart, order history, wishlist, and user reviews reside within browser `localStorage`. Data is local to each browser instance.
- **Static Catalogue Pricing:** Book prices, inventory metadata, and estimated delivery dates are derived from static JSON datasets without real-time inventory backend locking.
