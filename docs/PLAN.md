# Book Worm — Front-End Plan

Status: **decisions incorporated, awaiting go-ahead** (no code written yet)

## 0. Overview

Book Worm is an online bookstore front end. Scope is the five designed screens plus `/login`, `/orders`, and two minimal pages (`/wishlist`, `/writers`), built as a client-only SPA on mock JSON data (no backend). Guests can browse, add to cart and check out; logging in is optional and adds a saved address, gift points and order history.

Sources analysed:

| File | What it shows |
| --- | --- |
| [`design/00-architecture.jpg`](../design/00-architecture.jpg) | Flow: Registered/Guest user → (User Login) → Home Page → Browse (Catalog) → Add to Cart (Order) → Payment Processing (Payment) → Shipment (Shipping) |
| [`design/01-home-catalogue.jpg`](../design/01-home-catalogue.jpg) | Category sidebar, filter bar, shelves: Recommended for You / Bestsellers this Month / New Launches |
| [`design/02-product-detail.jpg`](../design/02-product-detail.jpg) | Breadcrumb, front/back cover, publisher, price + delivery date, Add to Cart / Wishlist, language/rating/sells, writer bio, reviews, Related Reads |
| [`design/03-cart-checkout.jpg`](../design/03-cart-checkout.jpg) | Cart lines with quantity steppers, address form with "Use Saved Address", Grand Total with coupon, Pay Now |
| [`design/04-payment.jpg`](../design/04-payment.jpg) | "Complete Payment" modal-style card, vertical tabs: Credit Card / Debit card / UPI / Wallet |
| [`design/05-confirmation.jpg`](../design/05-confirmation.jpg) | Success check, purchased books, "Continue your Shopping" |

The `design/` images are layout references only. They are not bundled into the app (see D7).

Architecture-diagram annotations (handwritten clouds are low-resolution; this is a best-effort reading and should be confirmed):
- **Member:** registered users, login/logout.
- **Catalog:** browse by department; browse by category and brand; recommend products from order history; daily-sale/cross-sale products.
- **Order:** create/modify order, checkout, confirm/cancel/return order, order history, redeem gift points and coupons.
- **Payment:** payment processing via gateway, refund processing, payment confirmation, gift/wallet.
- **Shipping:** shipping rate calculation, approximate delivery time, return shipment.
- Guest users reach Home and Browse without logging in; per D3 they can also complete checkout.

---

## 1. Tech stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | React 18 + TypeScript | strict mode on |
| Build | Vite | `@vitejs/plugin-react` |
| UI kit | `@carbon/react` | dark **g100** theme applied app-wide |
| Styling | Sass (`sass`) | Carbon Sass entry configured with `$theme: g100`; Carbon spacing/type/breakpoint tokens; no extra CSS framework |
| Routing | `react-router-dom` (v6 data/`createBrowserRouter` or `BrowserRouter`) | `RequireAuth` wrapper used for `/orders` only |
| State | React Context + `useReducer` (Auth, Cart, Orders, Wishlist) | persisted to `localStorage`; no state library |
| Data | Local JSON in `src/data/*.json` behind a thin async `api/` layer | the layer is the only place that touches JSON, so a real backend can replace it later |
| Config | `src/config/` constants | `TAX_RATE = 0.12`, `CANCEL_WINDOW_HOURS = 48`, `POINT_VALUE_INR = 1`, `DELIVERY_CHARGE = 0`, `COUPONS = { BOOKWORM100: ₹100 off }` |
| Icons | `@carbon/icons-react` | cart, user, search, wishlist, check, etc. |
| Font | IBM Plex Sans (Carbon default) | visible in the designs |
| Currency / dates | INR (₹) via `Intl.NumberFormat('en-IN')`; `Intl.DateTimeFormat` for "Mon, 21 Jul" | |
| Testing | Vitest + React Testing Library (`@testing-library/react`, `jest-dom`, `user-event`, `jsdom`) | scope in ST12; pure utils take an injectable `now` so time-dependent logic is testable |
| Quality gates | ESLint, `tsc --noEmit`, `vitest run`, `vite build`, Lighthouse accessibility ≥ 90 | the last is checked in ST11 |

Proposed folder layout:

```
src/
  api/          mock data access (books, auth, orders, payment)
  config/       tax rate, coupons, cancel window, point value, delivery charge
  data/         books.json, authors.json, publishers.json, categories.json, users.json, orders.json
  types/        domain model
  context/      AuthContext, CartContext, OrdersContext, WishlistContext
  hooks/        useCatalogueFilters, useBreakpoint, useRecommendations
  components/   shared components (section 3), tests colocated as *.test.tsx
  pages/        Home, ProductDetail, Checkout, Payment, Confirmation, Login, Orders, Wishlist, Writers
  styles/       _theme.scss, _layout.scss, per-component partials
  utils/        money, dates, pricing, recommendations, cancellation, validation (tests colocated as *.test.ts)
  test/         setup.ts (jest-dom matchers), render helpers with providers
```

Carbon notes to verify against the installed version at scaffold time:
- Theme: apply `g100` via the Sass `@use '@carbon/react' with ($theme: ...)` configuration, or via Carbon's `Theme`/`GlobalTheme` component.
- Vertical tabs for the payment screen: check whether the installed `@carbon/react` provides a vertical tabs component. If not, build `PaymentMethodTabs` with `ContentSwitcher` or a custom accessible tablist.
- The header's side-nav behaviour and `Grid`/`Column` breakpoints are Carbon built-ins.

---

## 2. Routes

| Route | Screen | Auth | Notes |
| --- | --- | --- | --- |
| `/` | 01 Home & Catalogue | public | Query params drive filters: `?category=`, `?publisher=`, `?author=`, `?q=`, `?language=`, `?format=`, `?price=`, `?sort=` |
| `/books/:bookId` | 02 Product detail | public | Breadcrumb Home / Parent category / Category |
| `/checkout` | 03 Cart + address + Grand Total | **public (guest checkout)** | Logged-in users get "Use Saved Address" and gift points; guests see an optional "Log in" prompt that returns here (`/login?redirect=/checkout`) with the cart kept |
| `/payment` | 04 Payment | public | Requires a valid checkout draft in state (address, coupon, points), otherwise redirect to `/checkout` |
| `/confirmation/:orderId` | 05 Purchase confirmation | public | The order must exist in the local orders store; if it belongs to a user, only that logged-in user may view it. Guest orders are viewable on this page only |
| `/login` | Login (no design supplied) | public | Honours `?redirect=` |
| `/orders` | Order history (no design supplied) | **login required** | "Buy it again", cancel within 48h; guests are redirected to `/login?redirect=/orders` |
| `/wishlist` | My Wishlist (no design supplied) | public | Lists wishlisted books from local state; minimal |
| `/writers` | My Writers (no design supplied) | public | Simple author list linking to `/?author=`; minimal |
| `*` | Not found | public | Minimal |

---

## 3. Reusable component inventory

Legend: **H** Home, **P** Product, **C** Checkout, **Pay** Payment, **Conf** Confirmation, **L** Login, **O** Orders, **W** Wishlist, **Wr** Writers. "(v)" means a variant or placement.

### Layout and shell

| Component | Purpose | Screens |
| --- | --- | --- |
| `AppHeader` | Carbon `Header`: logo "Book Worm", nav (My Orders / My Wishlist / My Writers), cart icon with count badge, user menu (Login / Logout); collapses to hamburger on small screens. "My Orders" for a guest leads to the login redirect | all |
| `PageLayout` | Max-width content grid, breadcrumb slot | H P C O L W Wr |
| `BackdropLayout` | Full-bleed decorative background with centred card. Background is CSS-generated (gradient/shapes), not the design artwork (D7) | Pay Conf (L optional) |
| `Breadcrumbs` | Carbon `Breadcrumb` | P C |
| `RequireAuth` | Route guard that redirects to `/login?redirect=` | O |
| `EmptyState` | No results / empty cart / no orders / empty wishlist | H C O W |

### Catalogue (Home)

| Component | Purpose | Screens |
| --- | --- | --- |
| `CategorySidebar` | "All" + the 23 categories shown in the design, plus a **Publishers** group (D2); active item highlighted; drawer on small screens | H |
| `FilterBar` | Search, Language, Format, Price Range, Sort by (Relevance etc.) | H |
| `ActiveFilterTags` | Dismissible chips such as "Publisher: ABC Publishers", "Author: …" | H |
| `BookShelf` | Titled section with a responsive grid of `BookCard` | H W O (Buy it again) |
| `BookCard` | Cover, title, "by author", blurb, format, category tags, price, delivery date. Variants: `catalogue`, `related`, `cart` (adds stepper, remove), `summary` (no actions), `order` (adds Buy it again), `wishlist` (adds Remove / Add to Cart) | H P(v related) C(v cart) Conf(v summary) O(v order) W(v wishlist) |
| `CoverPlaceholder` | Generated cover from title/author text on a tinted background; used wherever `coverUrl` is absent (D7) | H P C Conf O W |
| `AuthorLink` | "by Name" link to `/?author=` | H P C Conf O W |
| `CategoryTags` | Comma-separated tag links to `/?category=` | H P C Conf |
| `PriceTag` | ₹ price, bold | H P C Conf O W |
| `DeliveryDate` | "Delivery by **Mon, 21 Jul**", or "Instant download" for eBooks (D6) | H P C Conf O W |

### Product detail

| Component | Purpose | Screens |
| --- | --- | --- |
| `BookGallery` | Front and back cover (placeholders) | P |
| `PublisherLink` | "Published by: ABC Publishers" link to `/?publisher=` | P |
| `ProductActions` | Add to Cart, Add to Wishlist (toggles local wishlist state) | P |
| `BookMeta` | Language, Rating (stars), Sells ("145 copies sold") | P |
| `RatingStars` | Display and input modes | P |
| `AuthorBio` | Photo (initials placeholder if no photo), name, bio | P |
| `ReviewForm` | Textarea with 0/100 counter, star input, Submit | P |
| `ReviewList` | Reviewer, text, stars | P |
| `RelatedReads` | Side column of `BookCard` (related) | P |

### Checkout, payment, confirmation, orders, login, writers

| Component | Purpose | Screens |
| --- | --- | --- |
| `CartLineItem` / `CartList` | `BookCard` (cart) + `QuantityStepper` + remove | C |
| `QuantityStepper` | Number input with − / + (Carbon `NumberInput`, min 1) | C |
| `AddressForm` | First/Last name, Address line 1 and 2, e-mail, City, Pin, Phone (country code + number), State, Country. "Use Saved Address" checkbox is shown only for a logged-in user with a saved address; it fills and locks the fields | C |
| `LoginPrompt` | Inline callout for guests: "Log in for your saved address, gift points and order history" (optional) | C |
| `PriceSummary` | Price (n items), Tax, Delivery charges, Discount, Total; illustration panel (generated, D7); Pay Now. Also used in compact form for `Payable Amount` | C Pay(v compact) O(v read-only) |
| `CouponInput` | Text field + Apply, with validation message (valid code: `BOOKWORM100`) | C |
| `GiftPointsRedeem` | Logged-in users only: shows available points, amount to redeem (capped), resulting discount | C |
| `PaymentMethodTabs` | Vertical tabs: Credit Card / Debit card / UPI / Wallet | Pay |
| `CardForm` | Card number, name on card, CVV, expiry (shared by credit and debit) | Pay |
| `UpiForm` | UPI ID | Pay |
| `WalletForm` | Wallet choice and balance | Pay |
| `PaymentStatus` | Processing, success ("Payment received") and failure states with retry | Pay |
| `PurchaseSuccess` | Green check, "Your purchase of the following reads is successful", summary list, order id, delivery info | Conf |
| `CancelOrderControl` | "Cancel order" button, 48h deadline, confirm modal; disabled with explanation after the window | Conf O |
| `OrderCard` | Order id, date, status, total, line items | O |
| `BuyAgainButton` | Adds the order's items to cart and goes to `/checkout` | O |
| `AuthorList` | Simple list of authors with link to their books | Wr |
| `LoginForm` | Email and password, error message, demo-account hint | L |

---

## 4. TypeScript data model

Design decisions:
- Money is stored as INR numbers rounded to 2 decimals (the cart summary in the design shows `₹508.00`); book prices are whole rupees. Gift points are integers.
- Entities reference each other by id (normalised JSON); the `api/` layer joins them.
- `Order` stores price snapshots so later catalogue changes don't alter history.
- Cover and photo URLs are optional; when absent the UI renders generated placeholders (D7).

```ts
type ID = string;

type BookFormat = 'Paperback' | 'Hardcover' | 'eBook';

interface Author {
  id: ID;
  name: string;
  bio: string;
  photoUrl?: string;          // initials placeholder when absent
  bookIds: ID[];              // "His other works…" / My Writers
}

interface Publisher {          // "brands"
  id: ID;
  name: string;               // e.g. "ABC Publishers"
  logoUrl?: string;
}

interface Category {
  id: ID;
  name: string;               // "Romance", "Self Help", …
  parentId?: ID;              // Self Help → Non-fiction (breadcrumb)
  slug: string;
}

interface Review {
  id: ID;
  bookId: ID;
  userId: ID | null;          // null = guest reviewer (see open point in section 8.3)
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;               // max 100 chars (per "0/100")
  createdAt: string;          // ISO
}

interface Book {
  id: ID;
  title: string;
  description: string;        // short blurb on cards
  longDescription?: string;
  authorId: ID;
  publisherId: ID;
  categoryIds: ID[];          // e.g. [non-fiction, self-help]
  format: BookFormat;
  language: string;           // "English"
  price: number;              // INR
  coverUrl?: string;          // absent → CoverPlaceholder
  backCoverUrl?: string;
  isbn?: string;
  rating: number;             // average
  ratingCount: number;
  copiesSold: number;         // "145 copies sold"
  isBestseller: boolean;
  publishedAt: string;        // ISO; drives "New Launches"
  deliveryDays?: number;      // mock shipping estimate; omitted for eBook → "Instant download"
  relatedBookIds: ID[];
}

interface CartItem {
  bookId: ID;
  quantity: number;           // >= 1
}

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;   // "+91"
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pin: string;
  state: string;
  country: string;            // "India"
}

interface User {
  id: ID;
  name: string;
  email: string;
  savedAddress?: Address;     // "Use Saved Address"
  giftPoints: number;         // 1 point = ₹1; demo user starts with 250
}

type PaymentMethod = 'credit-card' | 'debit-card' | 'upi' | 'wallet';
type OrderStatus = 'confirmed' | 'cancelled' | 'delivered';

interface OrderItem {
  bookId: ID;
  title: string;              // snapshot
  unitPrice: number;          // snapshot
  quantity: number;
}

interface Order {
  id: ID;
  userId: ID | null;          // null = guest order
  items: OrderItem[];
  shippingAddress: Address;   // includes the contact e-mail for guests
  subtotal: number;
  tax: number;
  deliveryCharges: number;
  couponCode?: string;
  couponDiscount: number;
  giftPointsRedeemed: number; // always 0 for guest orders
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  placedAt: string;           // ISO
  cancellableUntil: string;   // placedAt + CANCEL_WINDOW_HOURS (48h)
  estimatedDelivery?: string; // ISO date; omitted when every item is an eBook
}
```

Derived behaviour (utilities, not stored; all take an injectable `now` where time matters):
- `deliveryDate(book, now)` returns today + `book.deliveryDays`, or "Instant download" for eBooks.
- `canCancel(order, now)` is true when `status === 'confirmed'` and `now < cancellableUntil`.
- `pricing(cartLines, couponCode, giftPoints)` is the single source for Price / Tax / Delivery / Discount / Total shown in `PriceSummary`, the Payable Amount, and the saved `Order`. Tax = `TAX_RATE` (12%) × subtotal, rounded to 2 decimals. The coupon discount is applied after tax, as in the design (`508 + tax − discount`).
- `maxRedeemablePoints(user, payableBeforePoints)` is `min(user.giftPoints, floor(payableBeforePoints))`; guests get 0.
- `recommendations(user, orders, books)` ranks unpurchased books by overlap of category, author and publisher with the user's past order items. Guests and users with no orders get bestsellers.
- Validators in `utils/validation`: address (required fields, e-mail, 6-digit Pin, phone), card number/CVV/expiry, UPI id, review length (max 100).

---

## 5. Responsive behaviour

Carbon breakpoints: **sm < 672px**, **md 672–1055px**, **lg ≥ 1056px**. (The designs are lg layouts; sm and md behaviour below is proposed and follows Carbon conventions.) ST11 verifies at **390px (sm)**, **820px (md)** and **1440px (lg)**.

| Screen | < 672px | 672–1055px | ≥ 1056px |
| --- | --- | --- | --- |
| **Header** (all) | Hamburger opens nav links (Orders / Wishlist / Writers); logo, cart badge and user icon stay visible | Same as sm if the nav doesn't fit; otherwise inline | Full inline nav as designed |
| **01 Home** | Sidebar becomes an off-canvas drawer opened from a "Categories" button above the list. Filter bar stacks to one column; the search is full width and the four dropdowns sit in a 2×2 grid or a collapsible "Filters" panel. Shelves are 1 column with a compact horizontal card (small cover left, text right). | Sidebar collapsed to a drawer or a narrow rail; filter bar wraps to 2 rows (search full width, then 4 dropdowns); shelves are 2 columns | Persistent sidebar; filter bar in one row (search + 4 dropdowns); shelves are 3 columns as designed |
| **02 Product** | Single column in this order: breadcrumb (truncated), gallery (swipeable or stacked covers), title/price/actions (buttons full width), meta, About the writer (photo above text), Reviews (form then list), Related Reads (below, as a 1-column list) | Two columns: gallery + details; writer and reviews full width below; Related Reads as a 2–3 column row below | Designed layout: gallery + details, writer and reviews on the left, Related Reads as a right column with divider |
| **03 Cart & Checkout** | Everything stacked: cart lines (1 column), address form (all fields 1 column, phone code + number on one row), then Grand Total with a sticky bottom Pay Now bar; illustration hidden | Cart lines 2 columns; address and summary stacked, form in a 2-column grid | Designed layout: cart lines in a row, address form (left) and Grand Total (right) side by side |
| **04 Payment** | Card takes the full width under the header; payment methods become horizontal scrollable tabs (or a select) above the form; form fields 1 column; Pay Now full width; Payable Amount stacks under the title | Centred card (about 80% width); vertical tabs remain; form fields in 2 columns | Centred card as designed (about 650px wide), vertical tabs left, 2×2 form fields |
| **05 Confirmation** | Card full-bleed with margin; books stacked vertically; full-width CTA; cancel control below the list | Card about 80% width; books in 2 columns | Centred card as designed with 2 books side by side |
| **Login** | Full-width form on the backdrop | Centred card | Centred card |
| **Orders** | Order cards stacked, items stacked, actions full width | Order cards full width, items in 2 columns | Order cards full width, items in a row, actions right-aligned |
| **Wishlist** | 1-column shelf | 2 columns | 3 columns |
| **Writers** | 1-column list | 2-column list | 3-column list |

Cross-cutting: touch targets of at least 44px on sm; images use fixed aspect ratios so layout doesn't shift; the `useBreakpoint` hook is used only where CSS alone can't switch behaviour (drawer vs. persistent sidebar).

---

## 6. Customer journeys (acceptance criteria)

| # | Journey | Flow and notes |
| --- | --- | --- |
| J1 | **Login (optional)** | `/login` with a demo account (email + password shown as a hint). Success restores `?redirect=` or goes to `/`. Header shows the user name/menu with Logout. Guests can browse, add to cart, check out and pay without logging in (D3). Logging in adds the saved address, gift points and order history; the cart persists across login. Only `/orders` is gated. |
| J2 | **Categories** | Sidebar lists All + categories; choosing one sets `?category=` and filters shelves. Category tags on cards and PDP deep-link here. Breadcrumb on PDP uses the parent → child category. |
| J3 | **Browse by publisher ("brands")** | "Published by: <Publisher>" on PDP links to `/?publisher=<id>`. Home shows an active-filter chip and filtered results; the sidebar Publishers group offers the same entry point (D2). |
| J4 | **Product with delivery date and related books** | `/books/:id` shows cover(s), price, **Delivery by <date>** (or **Instant download** for eBooks), Add to Cart / Wishlist, language, rating, copies sold, writer bio, reviews and **Related Reads** from `relatedBookIds`. |
| J5 | **Basket** | Add to Cart updates the header badge; `/checkout` shows lines with `QuantityStepper` (min 1; remove via a remove button); totals update live; the cart persists in `localStorage`. |
| J6 | **Recommendations from order history** | "Recommended for You" shelf is computed from the logged-in user's orders; guests and users without orders see bestsellers instead, with the shelf title adjusted. |
| J7 | **Delivery address** | `AddressForm` with validation. A logged-in user with a saved address can tick "Use Saved Address" to pre-fill and lock the form; guests fill it manually and see the optional `LoginPrompt`. |
| J8 | **Payment options** | `/payment` has Credit Card / Debit card / UPI / Wallet tabs, each with its own form and validation; Payable Amount equals the computed total. |
| J9 | **Gift points (logged-in only)** | `GiftPointsRedeem` shows the balance (demo user: 250) and lets the user redeem up to `min(balance, floor(payable))`, 1 point = ₹1. It reduces the total, is stored on the order, and the balance is decremented on purchase. Cancelling the order refunds the points. Guests don't see the control. |
| J10 | **Payment confirmation** | After Pay Now, `PaymentStatus` shows processing, then a "Payment received" success state (mock gateway, with a failure path and retry), then redirects. Coupon `BOOKWORM100` (₹100 off) is applied at checkout before this step. |
| J11 | **Purchase confirmation with cancel-within-48h** | `/confirmation/:orderId` shows the success card, purchased books, delivery date and a **Cancel order** control with the deadline (`placedAt + 48h`). Cancelling opens a confirm modal, sets `status: 'cancelled'`, refunds gift points (if any) and shows a notice. After 48h the control is disabled with an explanation. Guests can cancel from this page only, since `/orders` is login-only. "Continue your Shopping" returns to `/`. The cart is cleared after the order is placed. |
| J12 | **Order history with "Buy it again"** | `/orders` (login required) lists the user's orders newest first with status, total and lines; each line has **Buy it again** (adds to cart, goes to `/checkout`); a cancel control appears while within 48h. The history also feeds J6. |

---

## 7. Sub-tasks

Each sub-task is independent enough to be implemented and reviewed on its own, in the order listed. After finishing one, tick its status and add any notes the next sub-task needs under "Handover notes".

### ST1 — Project scaffold and theming
- **Intent:** a runnable React 18 + Vite + TS app with Carbon g100, routing and test tooling in place.
- **Expected outcomes:** `npm run dev` shows an empty shell on the dark g100 theme; all routes in section 2 resolve to placeholder pages; `npm run lint`, `typecheck`, `test` (with one smoke test) and `build` pass.
- **Todo:**
  1. Scaffold Vite React-TS; add `@carbon/react`, `@carbon/icons-react`, `sass`, `react-router-dom`.
  2. Configure the Sass theme entry (g100) and global styles; load IBM Plex.
  3. Create the folder layout (including `config/` with the constants from section 1) and a router with placeholder pages; `RequireAuth` guards `/orders` only.
  4. Add ESLint and a `typecheck` script.
  5. Add Vitest + React Testing Library + jest-dom + user-event + jsdom, `test/setup.ts`, and a `test` script.
- **Relevant context:** section 1, section 2.
- **Status:** `[x] done`

### ST2 — Domain types, mock data and API layer
- **Intent:** a typed data foundation matching the designs.
- **Expected outcomes:** JSON for the books shown in the designs (Art of Focus, Art of Learning, Path to Success, Midnight Hour, Beneath the Stars, Final Frontier, Joy of Minimalism, Vanishing House, Lost Kitten), their authors, at least two publishers, the categories in the sidebar (with Non-fiction → Self Help), and one demo user with a saved address, **250 gift points** and a seeded order history. Seeded order dates are generated relative to "now" at load, with at least one order inside the 48h window and one outside, so the cancel behaviour can be demonstrated. No cover art is imported (D7). Async `api/` functions return joined data.
- **Todo:** write `types/`; author JSON; implement `api/` (list/filter/sort books, get book, related, publishers, authors, auth, orders, mock payment); implement `utils/` (money, dates incl. eBook "Instant download", pricing with `TAX_RATE` and `BOOKWORM100`, recommendations, cancellation, validation), all pure and taking `now` where relevant.
- **Relevant context:** section 4, section 1 Config row.
- **Status:** `[ ] pending`

### ST3 — App state: auth, cart, orders, wishlist
- **Intent:** shared state with persistence.
- **Expected outcomes:** optional login/logout; add/update/remove cart items with the header badge; cart survives login; orders (guest and user) persisted; gift-point balance changes persisted on top of the seed data; wishlist persisted.
- **Todo:** `AuthContext`, `CartContext`, `OrdersContext`, `WishlistContext` with `localStorage` persistence; wire `RequireAuth` for `/orders`; build `LoginForm` and the `/login` page.
- **Relevant context:** J1, J5.
- **Status:** `[ ] pending`

### ST4 — App shell
- **Intent:** shared chrome used by every screen.
- **Expected outcomes:** `AppHeader` (nav, cart badge, user menu), `PageLayout`, `BackdropLayout` (CSS-generated background), `Breadcrumbs`, `EmptyState`; responsive header per section 5.
- **Relevant context:** screenshots 01–05 header; section 3 Layout.
- **Status:** `[ ] pending`

### ST5 — Home and catalogue
- **Intent:** J2, J3, J6.
- **Expected outcomes:** sidebar with a Publishers group, filter bar, three shelves, deep-linkable filters, publisher/author chips, working Recommended shelf with guest fallback, responsive per section 5.
- **Todo:** `CategorySidebar`, `FilterBar`, `ActiveFilterTags`, `BookShelf`, `BookCard` (catalogue), `CoverPlaceholder`, `AuthorLink`, `CategoryTags`, `PriceTag`, `DeliveryDate`, `useCatalogueFilters`, `useRecommendations`; the Home page.
- **Relevant context:** screenshot 01.
- **Status:** `[ ] pending`

### ST6 — Product detail
- **Intent:** J4.
- **Expected outcomes:** full PDP including related reads, reviews (added locally, 100-char limit), Add to Cart (updates badge), Add to Wishlist (toggles local state), responsive.
- **Todo:** `BookGallery`, `PublisherLink`, `ProductActions`, `BookMeta`, `RatingStars`, `AuthorBio`, `ReviewForm`, `ReviewList`, `RelatedReads`; the PDP page.
- **Relevant context:** screenshot 02.
- **Status:** `[ ] pending`

### ST7 — Cart and checkout (guest or logged in)
- **Intent:** J5, J7, J9.
- **Expected outcomes:** cart lines with steppers, validated address form, saved-address autofill for logged-in users, optional login prompt for guests, coupon `BOOKWORM100`, gift points for logged-in users (1 point = ₹1, capped), live Grand Total, Pay Now leading to `/payment`; empty-cart state.
- **Todo:** `CartList`, `QuantityStepper`, `AddressForm`, `LoginPrompt`, `CouponInput`, `GiftPointsRedeem`, `PriceSummary`; the Checkout page; pricing utility wired in.
- **Relevant context:** screenshot 03. With the 12% tax constant the design's two-book example (subtotal ₹508) gives tax ₹60.96 and, after the ₹100 coupon, ₹468.96. The design shows ₹62.00 and ₹470, which are illustrative.
- **Status:** `[ ] pending`

### ST8 — Payment and payment confirmation
- **Intent:** J8, J10.
- **Expected outcomes:** four payment tabs with validation, Payable Amount, processing/success/failure states, and the order created on success (guest or user).
- **Todo:** `PaymentMethodTabs`, `CardForm`, `UpiForm`, `WalletForm`, `PaymentStatus`; Payment page on `BackdropLayout`; mock gateway in `api/`.
- **Relevant context:** screenshot 04.
- **Status:** `[ ] pending`

### ST9 — Purchase confirmation and cancellation
- **Intent:** J11.
- **Expected outcomes:** confirmation card, 48h cancel window with modal, cancel updates the order and refunds points, cart cleared; works for guest orders.
- **Todo:** `PurchaseSuccess`, `CancelOrderControl`; Confirmation page.
- **Relevant context:** screenshot 05.
- **Status:** `[ ] pending`

### ST10 — Order history, Buy it again, wishlist and writers
- **Intent:** J12 (feeds J6), plus the two minimal pages linked from the header.
- **Expected outcomes:** `/orders` with cards, statuses, cancel while eligible, Buy it again; `/wishlist` listing wishlisted books with remove / add to cart; `/writers` listing authors that link to `/?author=`.
- **Todo:** `OrderCard`, `BuyAgainButton`, reuse `CancelOrderControl`; `AuthorList`; `BookCard` (wishlist variant); Orders, Wishlist and Writers pages.
- **Status:** `[ ] pending`

### ST11 — Responsive, accessibility and final validation
- **Intent:** verify section 5 and polish.
- **Expected outcomes:**
  - Every screen (including login, orders, wishlist and writers) checked at **390px**, **820px** and **1440px** with no horizontal scroll or overlap, matching the section 5 layout for each breakpoint.
  - **Lighthouse accessibility score ≥ 90** on every route, run against a production build (`vite build` + `vite preview`).
  - Keyboard access and focus order, form labels and contrast reviewed.
  - `npm run lint`, `typecheck` and `build` pass with no warnings.
- **Status:** `[ ] pending`

### ST12 — Unit and component tests
- **Intent:** lock in the business rules with Vitest + React Testing Library.
- **Expected outcomes:** `npm test` passes and covers:
  - **Pricing:** 12% tax and rounding, `BOOKWORM100` (valid, invalid, case handling), gift points 1 point = ₹1, cap at payable amount and at balance, guest gets 0, total never below ₹0.
  - **Recommendations:** ranking from order history by category/author/publisher overlap, exclusion of already-purchased books, fallback to bestsellers for guests and users without orders.
  - **Cancel window:** `canCancel` just before and just after 48h, already-cancelled and delivered orders; points refund on cancel; `CancelOrderControl` enabled/disabled states.
  - **CartContext:** add, increment, set quantity (min 1), remove, clear after order, `localStorage` persistence, cart kept across login.
  - **Form validation:** address (required fields, e-mail, 6-digit Pin, phone), card number/CVV/expiry, UPI id, review max 100 chars; `AddressForm` shows errors and the saved-address checkbox appears only for logged-in users with a saved address.
  - eBook "Instant download" vs delivery date.
- **Todo:** colocate `*.test.ts(x)` with the units; add provider-aware render helpers in `test/`; finish by running the full gate: `lint`, `typecheck`, `test`, `build`.
- **Relevant context:** section 4 (derived behaviour), J6, J7, J9, J11.
- **Status:** `[ ] pending`

### Handover notes
_(append after each sub-task)_

#### ST1 handover
- **React version:** React **19.3.1** was installed (npm resolved the latest Vite template deps). The plan said 18; React 19 is a drop-in compatible upgrade — no code changes needed. Note this in any team communication.
- **TypeScript version:** TypeScript **7** was initially installed but downgraded to **5.8.3** because `@typescript-eslint` v8 does not yet support TS7. This is the version to keep for all subsequent sub-tasks.
- **Sass g100 theme:** Carbon v11 (1.119.0) does not allow `@use '@carbon/react/scss/theme' with ($theme: ...)` after `@use '@carbon/react'` has already loaded the theme module. The g100 theme is instead applied via the React `<Theme theme="g100">` wrapper in `src/App.tsx`, which sets Carbon's CSS custom properties. The Sass entry (`src/styles/_theme.scss`) only runs `@use '@carbon/react'` for the global reset and type tokens.
- **IBM Plex Sans fonts:** Carbon bundles `@ibm/plex` but Vite/Rolldown emits non-fatal warnings about unresolved `~@ibm/plex/...` tilde URLs at build time. These are resolved by the browser at runtime. No action needed in ST2; revisit only if fonts are missing in production.
- **Folder layout created:** `src/api/`, `src/config/`, `src/context/`, `src/components/`, `src/data/`, `src/hooks/`, `src/pages/`, `src/router/`, `src/styles/`, `src/test/`, `src/types/`, `src/utils/`. Each stub folder has a `.gitkeep` comment file.
- **`RequireAuth` stub:** currently redirects everyone (hardcoded `isAuthenticated = false`). ST3 must replace the constant with `AuthContext` state. Until ST3 lands, `/orders` will always redirect to login — this is intentional for scaffold; it does not block any other route.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 1 test file, 1 test passed (smoke test renders Home placeholder)
  - `npm run build` — ✓ built in ~13s; only non-fatal font-URL warnings from Carbon internals

---

## 8. Decisions and design notes

### 8.1 Decisions

| # | Decision |
| --- | --- |
| D1 | Render **My Wishlist** and **My Writers** in the header. `/wishlist` shows wishlisted books (local state, persisted to `localStorage`); `/writers` shows a simple author list. Both stay minimal. |
| D2 | Add a **Publishers** group to the category sidebar, in addition to the "Published by" link on the product page. |
| D3 | **Guest checkout is allowed.** Login is optional; logged-in users additionally get a saved address, gift points and order history. Only `/orders` requires login. |
| D4 | Gift points: **1 point = ₹1**, capped at the order total, **refunded on cancellation**. The demo user has **250 points**. |
| D5 | Coupon **`BOOKWORM100`** = ₹100 off. |
| D6 | eBooks show **"Instant download"** instead of a delivery date. |
| D7 | Covers are **generated placeholders with title/author text**; no cover art from `design/` is used (copyright). The same rule applies to author photos (initials) and the payment/confirmation backdrop (CSS-generated). |
| D8 | Add **Vitest + React Testing Library** and sub-task **ST12** (pricing, recommendations, cancel window, CartContext, form validation). |
| D9 | ST11 tests at **390px, 820px and 1440px** and requires **Lighthouse accessibility ≥ 90**. |
| D10 | Tax rate is a config constant, **12%** (`TAX_RATE = 0.12`). |

### 8.2 Assumptions made while applying the decisions (please confirm or correct)

- **"Capped at the order total"** is implemented as `min(balance, floor(payable amount after tax and coupon))`, so points never go into fractions of a rupee and the payable amount can't go below ₹0.
- **Tax** is calculated on the subtotal before the coupon and rounded to 2 decimals; the coupon is subtracted afterwards, matching the design's `508 + tax − discount` pattern.
- **Delivery charges** stay a config constant defaulting to `0` ("Free" in the design); the design states no rule.
- **Guest orders** are stored locally with `userId: null` and are not attached to an account if the guest logs in later. They are reachable via the confirmation page only.
- **The demo user** is a single account holding the saved address, 250 points and the seeded order history, so that recommendations, Buy it again and cancel-window behaviour can all be demonstrated.
- **Wishlist persistence** in `localStorage` goes slightly beyond "local state" and mirrors how the cart is persisted.

### 8.3 Inconsistencies noticed in the designs

- **Payable amount mismatch:** `04-payment` shows Payable Amount ₹580, while `03-cart-checkout` totals ₹470 for the same two books. The app uses the computed total.
- **Tax figure:** the design's ₹62 on ₹508 (about 12.2%) differs from 12% (₹60.96); the app uses the 12% constant (D10).
- **Address field label:** the form has a field labelled "Address" with the placeholder "Address Line 2"; the plan assumes Address Line 1 (required) + Line 2 (optional).
- **eBook delivery:** `The Vanishing House` (eBook) shows a delivery date in the design; superseded by D6.
- **Missing from designs:** login, orders, gift points, cancel-within-48h, publisher browsing, wishlist and writers pages have no screens. Their components are inferred from the brief and the architecture diagram.
- **Checkout breadcrumb:** it includes a catalogue path (Home / Non-Fiction / Self Help / Joy of Minimalism / Checkout), which doesn't fit a multi-item cart. The plan uses Home / Shopping Cart.
- **Reviews by guests:** the product page lets anyone "Leave Your Review", while D3 makes login optional. The data model allows `userId: null` (guest reviewer). Say if reviews should instead require login.
