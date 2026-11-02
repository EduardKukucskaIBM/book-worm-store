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
- **Status:** `[x] done`

### ST3 — App state: auth, cart, orders, wishlist
- **Intent:** shared state with persistence.
- **Expected outcomes:** optional login/logout; add/update/remove cart items with the header badge; cart survives login; orders (guest and user) persisted; gift-point balance changes persisted on top of the seed data; wishlist persisted.
- **Todo:** `AuthContext`, `CartContext`, `OrdersContext`, `WishlistContext` with `localStorage` persistence; wire `RequireAuth` for `/orders`; build `LoginForm` and the `/login` page.
- **Relevant context:** J1, J5.
- **Status:** `[x] done`

### ST4 — App shell
- **Intent:** shared chrome used by every screen.
- **Expected outcomes:** `AppHeader` (nav, cart badge, user menu), `PageLayout`, `BackdropLayout` (CSS-generated background), `Breadcrumbs`, `EmptyState`; responsive header per section 5.
- **Relevant context:** screenshots 01–05 header; section 3 Layout.
- **Status:** `[x] done`

### ST5 — Home and catalogue
- **Intent:** J2, J3, J6.
- **Expected outcomes:** sidebar with a Publishers group, filter bar, three shelves, deep-linkable filters, publisher/author chips, working Recommended shelf with guest fallback, responsive per section 5.
- **Todo:** `CategorySidebar`, `FilterBar`, `ActiveFilterTags`, `BookShelf`, `BookCard` (catalogue), `CoverPlaceholder`, `AuthorLink`, `CategoryTags`, `PriceTag`, `DeliveryDate`, `useCatalogueFilters`, `useRecommendations`; the Home page.
- **Relevant context:** screenshot 01.
- **Status:** `[x] done`

### ST6 — Product detail
- **Intent:** J4.
- **Expected outcomes:** full PDP including related reads, reviews (added locally, 100-char limit), Add to Cart (updates badge), Add to Wishlist (toggles local state), responsive.
- **Todo:** `BookGallery`, `PublisherLink`, `ProductActions`, `BookMeta`, `RatingStars`, `AuthorBio`, `ReviewForm`, `ReviewList`, `RelatedReads`; the PDP page.
- **Relevant context:** screenshot 02.
- **Status:** `[x] complete`

### ST7 — Cart and checkout (guest or logged in)
- **Intent:** J5, J7, J9.
- **Expected outcomes:** cart lines with steppers, validated address form, saved-address autofill for logged-in users, optional login prompt for guests, coupon `BOOKWORM100`, gift points for logged-in users (1 point = ₹1, capped), live Grand Total, Pay Now leading to `/payment`; empty-cart state.
- **Todo:** `CartList`, `QuantityStepper`, `AddressForm`, `LoginPrompt`, `CouponInput`, `GiftPointsRedeem`, `PriceSummary`; the Checkout page; pricing utility wired in.
- **Relevant context:** screenshot 03. With the 12% tax constant the design's two-book example (subtotal ₹508) gives tax ₹60.96 and, after the ₹100 coupon, ₹468.96. The design shows ₹62.00 and ₹470, which are illustrative.
- **Status:** `[x] complete`

### ST8 — Payment and payment confirmation
- **Intent:** J8, J10.
- **Expected outcomes:** four payment tabs with validation, Payable Amount, processing/success/failure states, and the order created on success (guest or user).
- **Todo:** `PaymentMethodTabs`, `CardForm`, `UpiForm`, `WalletForm`, `PaymentStatus`; Payment page on `BackdropLayout`; mock gateway in `api/`.
- **Relevant context:** screenshot 04.
- **Status:** `[x] done`

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

#### ST2 handover
- **Domain model (`src/types/index.ts`):** Complete TypeScript definitions for `Book`, `Author`, `Publisher`, `Category`, `Review`, `User`, `Address`, `Order`, `OrderItem`, `CartItem`, `CartLine`, `PriceBreakdown`, `CatalogueFilters`, `SortOption`, and `BookWithDetails`.
- **Mock datasets (`src/data/`):**
  - `books.json`: 20 books across 6+ categories and 5 publishers, including all 9 design titles (*The Art of Focus* 399 Paperback, *The Art of Learning* 259 Paperback, *The Path to Success* 359 Paperback, *The Midnight Hour* 299 Paperback, *Beneath the Stars* 499 Hardcover, *The Final Frontier* 359 Paperback, *Joy of Minimalism* 149 Paperback, *The Vanishing House* 99 eBook, *The Lost Kitten* 339 Hardcover). *The Vanishing House* is the only eBook and omits `deliveryDays` (supporting instant download per D6).
  - `categories.json`: 23 categories matching the sidebar taxonomy, with parent-child relationships (e.g. Non-Fiction → Self Help).
  - `publishers.json`: 5 fictional publishers (*ABC Publishers*, *Horizon House*, *Crown & Quill Publishing*, *Silverline Press*, *Cedarwood Books*).
  - `authors.json`: 14 authors including the 9 design authors (*Arjun Patel*, *Raj Patel*, *James Wright*, *James Adams*, *Jessica Martin*, *Laura Mitchell*, *Daniel Reed*, *Clara Nelson*, *Emily Parker*) with bios and book references.
  - `users.json`: Demo user `demo@bookworm.com` with 250 gift points and saved Bengaluru address.
  - `orders.json` & dynamic seeding: Seed order templates dynamically calculate `placedAt`, `cancellableUntil` (48h window), and `estimatedDelivery` relative to load-time `now`. The recent order contains *Joy of Minimalism* (₹149) + *The Path to Success* (₹359) for a ₹508 subtotal, matching the cart checkout design.
- **Pure utilities (`src/utils/`):**
  - `money.ts`: `formatMoney` (INR ₹ format) and `round2`.
  - `dates.ts`: `getDeliveryDateLabel` (eBook → "Instant download", physical → formatted date), `formatDate`, `addDays`, `addHours`.
  - `cancellation.ts`: `canCancel` (active when `status === 'confirmed'` and `now < cancellableUntil`), `getCancellationTimeRemaining`.
  - `pricing.ts`: `calculatePricing` with 12% tax, `BOOKWORM100` coupon (₹100 off), and gift points cap `min(balance, floor(payableAfterCoupon))`.
  - `recommendations.ts`: `getRecommendations` based on category/author/publisher overlap from past order items, with bestseller fallback for guests and users with no orders.
  - `validation.ts`: `validateAddress`, `validateCard`, `validateUpi`, `validateReview`.
- **Mock API layer (`src/api/`):**
  - `books.ts`: `getBooks` (filtering by category, publisher, author, search query, format, language, price range, sorting), `getBookById` (joined relations), `getRelatedBooks`, `getBestsellers`, `getNewLaunches`, `addBookReview`.
  - `categories.ts`: `getCategories`, `getCategoryById`.
  - `publishers.ts`: `getPublishers`, `getPublisherById`.
  - `authors.ts`: `getAuthors`, `getAuthorById`.
  - `auth.ts`: `getDemoUser`, `login`, `getUserById`.
  - `orders.ts`: `generateSeedOrders`, `getOrders`, `getOrderById`, `createOrder`, `cancelOrder`, `resetOrders`.
  - `payment.ts`: `processPayment` mock gateway.
- **Unit test suite (`src/utils/*.test.ts`, `src/api/*.test.ts`):** 7 test files, 51 tests covering pricing (12% tax, coupon, points cap), cancellation boundary times (47h59m and 48h01m), dates, recommendations, form validation, and mock API behavior.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 7 test files, 51 passed
  - `npm run build` — ✓ production build succeeded

#### ST3 handover
- **Providers:** `src/context/` holds `AuthContext`, `CartContext`, `OrdersContext`, `WishlistContext` (context object + `useX()` hook, in `.ts` files) and matching `XProvider.tsx` files, so `react-refresh/only-export-components` stays clean. `AppProviders` composes them (Auth → Cart → Wishlist → Orders; Orders is inside Auth because cancel refunds points) and wraps the router in `src/App.tsx`. Import from `src/context` (barrel). Hooks throw if used outside a provider. **Tests/pages that use any hook must render inside `<AppProviders>`** — ST12 should add the provider-aware render helper in `src/test/`.
- **Auth:** `useAuth()` → `{ user, isAuthenticated, login(email, password), logout(), adjustGiftPoints(userId, delta) }`. `login` rejects with `Error('Invalid email or password')` (`INVALID_CREDENTIALS_MESSAGE`). **Behaviour change in ST2 API:** `api/auth.login` now checks the password against `users.json` and throws on mismatch; the old "accept any e-mail" fallback was removed. `users.json` gained a mock `password` field (`bookworm123`); it is stripped by `toUser()` and never leaves `api/auth.ts` or reaches `localStorage`. `getDemoCredentials()` feeds the hint on `/login`.
- **Gift points:** the session stores the seed user; point changes are stored separately as a per-user delta (`bookworm.giftPointAdjustments`) and applied on top, so `user.giftPoints` is always seed + delta (floored at 0). ST7/ST8 should call `useOrders().addOrder(...)`, which already spends `order.giftPointsRedeemed`, rather than calling `adjustGiftPoints` directly.
- **Cart:** `useCart()` → `{ items, lines, itemCount, addItem(id, qty = 1), setQuantity(id, qty), removeItem(id), clearCart() }`. `setQuantity` clamps to ≥ 1 (removal is explicit via `removeItem`). `items` (ids + quantities) is what is persisted and is available synchronously; `lines` (`CartLine[]` with `Book`) is resolved from `api/books` **asynchronously and only once the cart is non-empty**, so it is briefly empty after a refresh. Use `itemCount` for the header badge (ST4) and `lines` for pricing/display. Unknown book ids are dropped from `lines` but kept in `items`. The cart is not touched by login/logout.
- **Orders:** `useOrders()` → `{ orders, getOrdersForUser(userId | null), getOrder(id), addOrder(input, now?), cancelOrder(id, now?) }`, synchronous. Only **new orders and cancelled ids** are persisted (`bookworm.orders`); seed orders are regenerated relative to "now" on every load so the demo always has an order inside the 48h window. A cancelled seed order stays cancelled via its id. `cancelOrder` throws if the order is missing or `canCancel` is false, otherwise refunds gift points. **Gap for ST9:** `cancelOrder` returns the cancelled order but UI should still check `canCancel` first to disable the control. Context state is independent of the in-memory `api/orders` store (`createOrder`/`cancelOrder` there are unused by the UI); `api/orders.ts` gained the pure `buildOrder()` and `NewOrderInput` type that the provider uses.
- **Wishlist:** `useWishlist()` → `{ bookIds, isWishlisted(id), toggle(id) }`, persisted as `bookworm.wishlist`.
- **Persistence:** keys live in `STORAGE_KEYS` (`config/`); `utils/storage.ts` (`loadJSON` with a type guard, `saveJSON`, `removeItem`) is best-effort and falls back on corrupt/invalid data. Session key is `bookworm.session`. Guests' orders are stored with `userId: null`.
- **`RequireAuth`:** now reads `useAuth()`. A guest hitting `/orders` is redirected to `/login?redirect=/orders` (slashes left unescaped for readability; query string preserved).
- **`/login`:** Carbon `TextInput`, `PasswordInput`, `Button`, inline field errors (`validateLogin` in `utils/validation`), an `InlineNotification` for wrong credentials, and a demo-credentials hint, on the g100 theme (`Login.scss`, Carbon tokens). `?redirect=` is honoured via `getSafeRedirect` (`utils/redirect.ts`, same-origin paths only; falls back to `/`). A logged-in visitor to `/login` is redirected immediately. No `LoginForm` component was split out: the form lives in `pages/Login.tsx`; extract it only if ST4/ST11 needs to.
- **Not done (belongs to later tasks):** header badge/user menu/Logout button (ST4), `Add to cart` / wishlist buttons (ST5–ST6), checkout/payment wiring that calls `addOrder` and `clearCart` (ST7–ST9).
- **Tests added (36 new, 88 total in 14 files):** `CartContext` (add/increment, set quantity min 1, remove, clear, joined lines, persistence, refresh, corrupt data), `AuthContext` (login, bad credentials, case/space handling, no password leakage, logout, session persistence, gift-point persistence, **cart kept across login and logout**), `OrdersContext` (seeds, persistence, points spent/refunded, cancel window), `WishlistContext`, `RequireAuth` (guest redirected to `/login?redirect=/orders`; logged-in user passes), `Login` page (hint, inline errors, bad credentials, `?redirect=`, unsafe redirect), `getSafeRedirect`.
- **Test note:** cart tests flush the provider's async catalogue load inside `act()` (see `run()` in `CartContext.test.tsx`) to avoid "not wrapped in act" warnings.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 14 test files, 88 passed
  - `npm run build` — ✓ built in ~36s; only the known non-fatal Carbon font-URL warnings

#### ST4 handover
- **AppHeader (`src/components/AppHeader/`):** Carbon UI shell header with "Book Worm" brand logo and link to `/`, desktop navigation links (`My Orders`, `My Wishlist`, `My Writers`), cart icon button with dynamic item-count badge from `useCart().itemCount`, and user icon.
  - **Guest vs Auth user:** Guests see a link with `aria-label="Log in"` leading to `/login`. Logged-in users see an interactive user menu displaying their name (`user.name`), email (`user.email`), and a `Logout` button wired to `useAuth().logout()`.
  - **Responsive navigation:** On screens below Carbon `lg` (1056px), nav links move into a slide-out `SideNav` drawer toggled by the hamburger `HeaderMenuButton`. Brand logo, cart badge, and user action remain permanently visible in the header bar.
  - **Accessibility:** Visible focus rings via Carbon focus tokens, `SkipToContent` link targeting `#main-content`, keyboard navigation with `Escape` dismissal for user menu and side panel.
- **PageLayout (`src/components/PageLayout/`):** Standard page layout shell rendering `AppHeader`, optional breadcrumb slot, and max-width 1440px (90rem) `#main-content` landmark with responsive spacing. Supports layout route mode via `<Outlet />`.
- **BackdropLayout (`src/components/BackdropLayout/`):** Full-bleed atmospheric background for Payment and Confirmation flows, featuring pure CSS-generated radial and linear gradients with Carbon theme tokens (no external design image assets per D7) and a centred card slot. Supports layout route mode via `<Outlet />`.
- **Router wiring (`src/router/index.tsx`):**
  - `PageLayout` is wired as the layout route for `/`, `/books/:bookId`, `/checkout`, `/login`, `/orders`, `/wishlist`, `/writers`, and `*`.
  - `BackdropLayout` is wired as the layout route for `/payment` and `/confirmation/:orderId`.
- **Breadcrumbs (`src/components/Breadcrumbs/`):** Accessible Carbon `Breadcrumb` wrapper integrating with React Router `Link` and active current page highlighting.
- **EmptyState (`src/components/EmptyState/`):** Reusable empty-state component for empty cart, no orders, empty wishlist, and zero search results, supporting optional icons, descriptions, and action links/buttons.
- **Component barrel (`src/components/index.ts`):** Central export point for all shell and layout components.
- **Test environment update (`src/test/setup.ts`):** Added a mock for `window.matchMedia` required by Carbon's UI shell responsive hooks under jsdom.
- **Tests added (15 new, 103 total across 17 files):** `AppHeader.test.tsx` (brand logo, navigation links, cart badge count display & empty-state hide, guest login link, logged-in user menu with name & email & Logout action, Escape key dismiss, hamburger mobile drawer toggle), `shell.test.tsx` (`PageLayout` breadcrumb & content rendering, `BackdropLayout` card rendering, `Breadcrumbs` navigation, `EmptyState` actions), and `src/router/router.test.tsx` (verifying header presence on `/`, `/books/1`, `/payment`, and `/confirmation/order-1`).
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 17 test files, 103 passed
  - `npm run build` — ✓ built successfully

#### ST5 handover
- **Home and Catalogue Page (`src/pages/Home.tsx`, `src/pages/Home.scss`):**
  - Renders the full catalogue page matching screenshot `01-home-catalogue.jpg` using Carbon g100 tokens and theme variables.
  - **CategorySidebar (`src/components/CategorySidebar/`):** Full category taxonomy matching the design layout, active item highlighted with a 3px blue left border (`$border-interactive` / `#0f62fe`), plus a "Publishers" group (D2) and "All" reset option.
  - **FilterBar (`src/components/FilterBar/`):** Search input (`q`), Language dropdown, Format dropdown, Price Range dropdown, and Sort By dropdown. Synchronised bidirectionally with URL query parameters (`?category=&q=&language=&format=&priceRange=&sort=&publisher=&author=`) using `useCatalogueFilters`.
  - **ActiveFilterTags (`src/components/ActiveFilterTags/`):** Dismissible Carbon tags displaying active filters with a "Clear all" action.
  - **Shelves vs Filtered Grid:**
    - Default state: Three shelves — "Recommended for You" (powered by `useRecommendations`; dynamically titled "Popular right now" for guest visitors), "Bestsellers this Month", and "New Launches".
    - Filtered state: When any category, publisher, author, search query, or dropdown filter is active, shelves are replaced by a single "Results (n)" grid.
    - Zero matches render `EmptyState` ("No books found") with a "Clear all filters" button.
  - **BookCard Catalogue Variant (`src/components/BookCard/`):** Left-aligned `CoverPlaceholder`, book title linking to `/books/:id`, author link prefix "by <author>" linking to `/?author=`, 2-line truncated blurb with title tooltip, format badge (Paperback / Hardcover / eBook), comma-separated category links, whole rupee price in INR (`₹399`), and delivery status ("Instant download" for eBooks or "Delivery by <date>" for physical books).
  - **CoverPlaceholder (`src/components/CoverPlaceholder/`):** Deterministic book-shaped coloured block with title, author, spine highlight, and visual motif tailored per book (matching screenshot 01 artwork styles and palettes).
  - **Leaf Components (`src/components/`):** `AuthorLink`, `CategoryTags`, `PriceTag`, `DeliveryDate`, and `BookShelf` (supporting titled shelves, responsive grid, and Carbon skeleton loading states).
  - **Responsive Layout (`src/pages/Home.scss`):**
    - `≥1056px`: Persistent desktop sidebar and 3 cards per row.
    - `672px – 1055px`: 2 cards per row, sidebar accessible via modal drawer toggled by "Categories" button.
    - `<672px`: 1 card per row, category drawer, and mobile filter toggle button collapsing/expanding filters.
- **Tests added (20 new, 123 total across 23 files):**
  - `src/pages/Home.test.tsx`: Guest "Popular right now" vs authenticated "Recommended for You" shelf titles, category filtering, search query filtering, price low-to-high and high-to-low sorting, URL query synchronisation and clearing, EmptyState on 0 results, and publisher filtering from the sidebar.
  - `src/components/BookCard/BookCard.test.tsx`: BookCard catalogue rendering (title, author, blurb, format, categories, price, delivery date) and eBook "Instant download" rendering.
  - `src/components/CategorySidebar/CategorySidebar.test.tsx`: "All", category taxonomy, publishers group, active class, and callbacks.
  - `src/components/FilterBar/FilterBar.test.tsx`: Search input, selects, and change handlers.
  - `src/components/CoverPlaceholder/CoverPlaceholder.test.tsx`: Accessible role/label, visual title/author display, and fallback theme generator.
  - `src/hooks/useCatalogueFilters.test.tsx`: Query parsing, active filter count, and filter mutation.
  - `src/router/router.test.tsx`: Router test rendering `/` with real data and verifying AppHeader and catalogue shelf contents.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 23 test files, 123 passed (0 failed)
  - `npm run build` — ✓ built successfully for production

#### ST6 handover
- **New components (`src/components/`):**
  - `BookGallery/` — front cover (`CoverPlaceholder --lg`) + back cover panel showing the book's `longDescription` in a blockquote, an initials disc, and a simple SVG barcode. No images; all art from `CoverPlaceholder`.
  - `PublisherLink/` — `<Link to="/?publisher=id">Name</Link>` Carbon token colours.
  - `RatingStars/` — dual-mode component: **display** (`role="img"`, filled/empty `StarFilled`/`Star` icons from `@carbon/icons-react`) and **input** (`role="group"` of `<button>` elements with `aria-pressed` and `aria-label`).
  - `AuthorBio/` — initials avatar (deterministic `getInitials`, no photos — D6 clarified in prompt), author name `<h3>`, bio paragraph.
  - `BookMeta/` — horizontal row: Language / Rating (`RatingStars` display) / Copies Sold; separated by 1px dividers.
  - `ReviewForm/` — controlled `<textarea>` capped at `MAX_CHARS=100`, live `charCount/100` counter goes red over limit; `RatingStars` input; Submit `disabled` until both text (1–100 chars) and rating (1–5) are valid. The `bookId` prop is optional (kept for API binding context, not needed inside the form itself).
  - `ReviewList/` — `<ul>` of review items showing reviewer name, formatted date, text, and `RatingStars` display; "No reviews yet" empty message.
  - `RelatedReads/` — `<aside>` with heading + divider + `BookCard variant="related"` list. The `related` BookCard variant was added to `BookCard.scss`.
  - `ProductActions/` — "Add to Cart" (primary, `ShoppingCart` icon) calls `useCart().addItem`; "Add to Wishlist" (secondary, `Bookmark`/`BookmarkFilled`) toggles `useWishlist().toggle`, label changes to "In Wishlist". Carbon `ToastNotification` (kind `success`, timeout 4000 ms) appears below the buttons on add-to-cart; a "View cart" link sits beneath it.
- **ProductDetail page (`src/pages/ProductDetail.tsx`, `ProductDetail.scss`):**
  - Breadcrumb: Home / Non-Fiction (parent) / Self Help (leaf). Both categories are linked; the leaf is `isCurrent`. Falls back to title-only breadcrumb for books without a parent category.
  - Top section: 2-column grid — `BookGallery` left, details right. Details: `<h1>` title, `AuthorLink` (reused from ST5), short description, "Published by:" `PublisherLink`, format, `CategoryTags`, large `PriceTag --lg`, delivery line ("Delivery by <date>" or "Instant download" for eBooks), `ProductActions`, `BookMeta`.
  - About the writer: `AuthorBio`.
  - Reviews: 2-column grid — `ReviewForm` left / `ReviewList` right. Reviews persist to `localStorage` keyed `bookworm.reviews.<bookId>` using `saveJSON`/`loadJSON`. Newly submitted reviews are deduped with API reviews by `id` before rendering.
  - Related Reads: right sidebar at ≥1056px (sticky); moves below the reviews section at <1056px via `pdp__related-inline` / `pdp__sidebar` responsive split.
  - Unknown book id: `EmptyState` "Book not found" with "Back to catalogue" link, `data-testid="pdp-not-found"`.
  - State initialised from `useState` lazy-initialiser (not `useEffect`) to avoid the `react-hooks/set-state-in-effect` ESLint rule.
- **Responsive layout (section 5 compliance):**
  - `≥1056px`: 2-column `pdp__layout` (main + 300px sticky sidebar); top section 2-column gallery + details; reviews 2-column.
  - `672–1055px`: sidebar hidden, `pdp__related-inline` shown below reviews; top section still 2-column.
  - `<672px`: all sections single-column; buttons full-width via CSS `flex-direction: column` in `.pdp__actions`.
- **Toast "View cart" link:** Carbon's `ToastNotification.subtitle` only accepts `string` (TS type); the "View cart" link is placed in a sibling `<div>` beneath the toast (styled via `.product-actions__toast-links`).
- **Router test update (`src/router/router.test.tsx`):** the test at `/books/1` (non-existent ID) was replaced with `/books/book-art-of-focus` and wrapped in `waitFor` to accommodate the async data load.
- **Tests added (17 new, 140 total across 24 files):** `ProductDetail.test.tsx` — renders title/author/description/publisher/format/price, delivery by / instant download, breadcrumb Home + category, About the writer + initials avatar, Add to Cart toast, wishlist toggle, review submit disabled/enabled, counter 0/100, review submit + localStorage persistence, related reads links, unknown id "not found" empty state, and router integration at `/books/book-art-of-learning`.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 24 test files, 140 passed
  - `npm run build` — ✓ production build succeeded; only pre-existing Carbon font-URL warnings

#### ST7 handover
- **Checkout page (`src/pages/Checkout.tsx`, `Checkout.scss`):** replaces the placeholder. Breadcrumb Home / Shopping Cart, `<h1>` "Shopping Cart", then (for a non-empty cart) optional `LoginPrompt` (guests only), cart tile, an Address tile and a Grand Total tile (side by side ≥1056px, stacked below), and a "You may also like" shelf. Empty cart (or a cart whose ids are all unknown to the catalogue) renders `EmptyState` (`data-testid="cart-empty"`) with a "Browse the catalogue" link to `/`. While `useCart().lines` is still resolving it shows a Carbon skeleton.
- **New components (`src/components/`, all exported from the barrel):**
  - `QuantityStepper` — Carbon `NumberInput` (min 1, `hideLabel`); the − / + buttons are named "Decrease/Increase quantity of <title>" through `translateWithId`. Only forwards integers ≥ min.
  - `CartList` — `<ul>` of `BookCard variant="cart"` with a stepper and a ghost "Remove" button as children (`aria-label` "Remove <title> from cart").
  - `AddressForm` — controlled by `value` / `onChange`; Carbon `TextInput` / `Select` / `Checkbox`. Inline errors show for a field after blur, or for all fields once `showAllErrors` is set. Error text comes from `validateAddress` (ST2), nothing duplicated. When `savedAddress` is passed it renders the "Use Saved Address" checkbox; ticking it makes every field `readOnly` (the two selects `disabled`) and suppresses errors. Field ids are `address-<field>` (`addressFieldId`).
  - `LoginPrompt` — "Log in for saved address, gift points and order history." with a link to `/login?redirect=/checkout`. The cart is untouched (it lives in `CartContext`).
  - `CouponInput` — text + Apply. Codes are trimmed and upper-cased; an unknown code shows "This coupon code is not valid", an empty one "Enter a coupon code". Once applied it becomes a `DismissibleTag` ("BOOKWORM100 applied (−₹100)") whose close button removes it. Validity comes from `getCouponDiscount`.
  - `GiftPointsRedeem` — balance, a `NumberInput` (0..max) and a "Redeem max" / "Clear" toggle. Rendered by `PriceSummary` only when a `giftPoints` prop is passed, which `Checkout` does only for logged-in users.
  - `PriceSummary` — "Grand Total": Price (n items), Tax (12%), Delivery Charges (Free when 0), `CouponInput`, Discount, optional gift-points row, Total Amount, Pay Now. It is purely presentational: every figure comes from the `PriceBreakdown` prop.
- **Pricing (single source of truth):** `Checkout` calls `calculatePricing(lines, coupon, requestedPoints, balance)` on every render; the redeemable cap is `maxRedeemablePoints(balance, total-with-0-points)`. Nothing is computed in components. The cap shrinks when a coupon is applied, and the redeemed value is clamped again inside `calculatePricing`, so a stale `requestedPoints` can never overspend. With the design's two books: subtotal ₹508.00, tax ₹60.96, total ₹568.96 (₹468.96 with BOOKWORM100). The design's ₹62 / ₹470 are illustrative (see ST7 context).
- **Illustration (D7):** `.price-summary__illustration` is built only from CSS (radial-gradient field, three rotated "book" blocks, diamond confetti), Carbon tokens only, `aria-hidden`. It is `display: none` below 672px and shown from `md` up.
- **Responsive (section 5):** <672px — all sections stacked, address fields one per row (phone code + number stay on one row), illustration hidden, and Pay Now is `position: fixed` in a bottom bar (`.price-summary__pay`). The bar has a fixed height and `.checkout` has the same amount as bottom padding, both taken from `$pay-bar-height` in `src/styles/_pay-bar.scss` (3rem button + 2 × `$spacing-04`, plus `env(safe-area-inset-bottom)`), so the last content can always be scrolled above the bar. The padding is removed from 672px up. 672–1055px — cart lines in 2 columns, address form in a 2-column grid, address and summary stacked. ≥1056px — designed layout (12-column address grid, summary at 38% width on the right).
- **Pay Now:** validates `validateAddress(address)`. On failure it sets `showAllErrors` and focuses the first invalid field in DOM order (`ADDRESS_FIELD_ORDER` in `utils/address.ts`). On success it builds a `CheckoutDraft`, saves it and calls `navigate('/payment')`. Blank address line 2 is stored as `undefined`.
- **Checkout draft for ST8 (important):**
  - Type `CheckoutDraft` in `types/`: `{ userId | null, lines: OrderItem[] (bookId, title, unitPrice snapshot, quantity), address, couponCode | null, giftPointsRedeemed, totals: PriceBreakdown, savedAt (ISO) }`.
  - Helpers in `utils/checkoutDraft.ts`: `saveCheckoutDraft`, `loadCheckoutDraft()` (returns `null` when missing or invalid — `/payment` should then redirect to `/checkout`, per section 2), `clearCheckoutDraft`, `isCheckoutDraft`. Stored in `localStorage` under `STORAGE_KEYS.checkoutDraft` (`bookworm.checkoutDraft`), so it survives a refresh on `/payment`.
  - ST8 should build the `Order` from `draft.lines/address/couponCode/totals` via `useOrders().addOrder` (which spends `giftPointsRedeemed`), then `clearCart()` and `clearCheckoutDraft()`. **Re-run `calculatePricing` on the draft's lines before charging** if prices could have changed; the draft totals are a snapshot.
  - The draft is not cleared by Checkout itself; it is overwritten on the next Pay Now.
- **Other shared additions:** `utils/address.ts` (`EMPTY_ADDRESS` with +91 / India, `ADDRESS_FIELD_ORDER`, `addressFieldId`). `BookCard` gained optional `children` (rendered in `.book-card__actions`) and a `cart` variant (large cover, no hover tint); existing variants are unchanged.
- **You may also like:** `useRecommendations(candidates, 3)` where `candidates` = catalogue minus the cart's book ids, rendered with the existing `BookShelf`. Guests and users without orders therefore get the top bestsellers that are not in the cart. The shelf's own title is overridden to "You may also like".
- **Country / phone-code lists** are small hard-coded lists inside `AddressForm` (India default; +91 default); extend them there if needed. Phone validation is still the ST2 rule (10 digits), regardless of code.
- **Not done / for later:** Pay Now does not re-check stock or prices; logging in from the prompt does not carry typed address values back (the form is empty after returning, the cart is kept); "Use Saved Address" state is not persisted across reloads; browser-level visual check at 390 / 820 / 1440px is left to ST11 (this task was verified by tests, lint, typecheck and build only).
- **Tests added (29 new in `src/pages/Checkout.test.tsx`, 169 total across 25 files):** totals and breadcrumb/title; quantity +/- updates totals live and stays ≥ 1; remove (and removing the last line → empty state); empty cart state with catalogue link; coupon valid (case-insensitive) / invalid / empty / removed; login prompt and its redirect link for guests only; gift points hidden for guests, balance shown when logged in, redeem max = ₹250, cap by floor(payable) for a cheap order and after a coupon; saved address fills and locks (and unlocks); defaults +91 / India; inline validation on blur; address line 1 required, line 2 optional; invalid form blocks Pay Now, shows all errors and focuses the first invalid field; valid form (guest) saves the draft with lines / address / coupon / totals and navigates to `/payment`; logged-in draft with saved address and 250 redeemed points; "You may also like" excludes cart books and offers a book again once removed.
- **Test note:** the long address fill uses `user.paste` instead of `user.type` — typing ~60 characters key by key exceeded Vitest's 5 s default when the whole suite ran in parallel.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test` — 25 test files, 169 passed
  - `npm run build` — ✓ built; Vite prints the large-chunk (>500 kB) notice and the known Carbon font-URL warnings, both non-fatal

#### ST8 handover
- **`/payment` page (`src/pages/Payment.tsx`, `Payment.scss`):** Replaces the placeholder. Reads `loadCheckoutDraft()` on every render; if `null`, a `useEffect` redirects to `/checkout` with `replace: true` — nothing is rendered in the meantime. The card displays "Complete Payment" and "Payable Amount: `<total>`" taken from `draft.totals.total` (not hardcoded).
- **`PaymentMethodTabs` (`src/components/PaymentMethodTabs/`):** `role="tablist"` with `aria-orientation="vertical"`. Tabs: Credit Card, Debit card, UPI, Wallet. `ArrowDown`/`ArrowRight` advance; `ArrowUp`/`ArrowLeft` retreat; `Home`/`End` jump to first/last. Blue active indicator via `border-left: 3px solid var(--cds-interactive)`. Non-active tabs have `tabIndex={-1}` so only the active tab is in the tab order. SCSS splits constants (`PAYMENT_TABS`) into `paymentTabs.ts` and wallet names into `walletOptions.ts` to keep component files clean for `react-refresh/only-export-components`.
- **`CardForm` (`src/components/CardForm/`):** Carbon `TextInput` for card number (auto-formats to `XXXX-XXXX-XXXX-XXXX` as the user types, capped at 19 chars) and name; `PasswordInput` for CVV (masked, digits only, max 4); `TextInput` for expiry auto-formatted `MM/YYYY`. Each field passes the typed value back through `onChange`. Shared by credit-card and debit-card tabs via the `variant` prop. Panel has `role="tabpanel"` keyed to the active tab id.
- **`UpiForm` / `WalletForm`:** `UpiForm` has a single `TextInput` for the UPI id. `WalletForm` uses a `RadioButtonGroup` (Paytm / PhonePe / Amazon Pay) with an inline error `<p role="alert">` when none is selected.
- **`PaymentStatus` (`src/components/PaymentStatus/`):** Renders nothing in `idle`; Carbon `InlineLoading` (status `"active"`) in `processing`; Carbon `InlineNotification` (kind `"error"`) + ghost "Try again" `Button` in `failure`; nothing in `success` (the parent has already navigated away).
- **Validation (`src/utils/validation.ts`):** `validateCard` updated: expiry now uses `MM/YYYY` format (four-digit year), Luhn check (`luhnCheck` exported separately) added after the 16-digit length check; `validateCard` also strips dashes before comparing. `validateCard` and `validateUpi` existing tests updated/extended. **Breaking change for any test that passed `MM/YY` expiry format** — the Checkout test suite uses `validateAddress` only and was unaffected; `validation.test.ts` was updated to use `MM/YYYY` and gained 4 new test cases (dashes, Luhn pass/fail, MM/YY rejection). Old MM/YY cards now get the error "Expiry must be in MM/YYYY format".
- **Pay Now flow:** calls `validate()` for the active tab; on failure sets inline errors and focuses the first `[aria-invalid="true"]` element via `formRef`. On success calls `processPayment(..., 1500)` (1.5 s delay). Processing disables the button. On gateway `success` calls `useOrders().addOrder(...)`, `clearCart()`, `clearCheckoutDraft()`, then navigates to `/confirmation/<orderId>`. On `failure` sets `paymentState = 'failure'` with the error message; nothing is cleared.
- **Failure card:** Card number `4000-0000-0000-0002` sets `simulateFailure: true` in `processPayment`, producing the failure path. This number is Luhn-valid (passes the Luhn check), so validation accepts it and the gateway rejects it.
- **Security:** Full card number and CVV are **never stored** in `localStorage` or in the `Order` object. `processPayment` receives only the last 4 digits (masked `****XXXX`) plus the cardholder name and expiry. CVV is sent as an empty string — the mock gateway doesn't need it. The test "does not store card number or CVV in localStorage" verifies this.
- **Responsive (section 5):** `≥672px` — vertical tabs on the left, form on the right. `<672px` — tabs become a horizontal scrollable bar above the form (SCSS `breakpoint-down(md)`), form fields collapse to one column, Pay Now goes full width.
- **Router test update (`src/router/router.test.tsx`):** the test at `/payment` now saves a minimal draft before rendering so the Payment page does not redirect; it checks for `role="heading"` with `/complete payment/i` inside a `waitFor`.
- **Tests added (24 new in `src/pages/Payment.test.tsx`, 196 total across 26 files):** redirect without draft; payable amount from draft (two amounts); tab keyboard nav (starts on Credit Card, ArrowDown advances, ArrowDown wraps, ArrowUp retreats, click switches); card validation (empty, <16 digits, Luhn fail, auto-format, past expiry, wrong MM/YY format, CVV required); UPI validation (empty, bad format, valid); success creates order + clears cart + clears draft + navigates; failure shows error + keeps cart + keeps draft; "Try again" resets; card number not in localStorage; card number not in persisted order; Pay Now disabled during processing.
- **Parallel test note:** running `npm test` (all 26 files in parallel workers) occasionally triggers a 5 s timeout in two Checkout "Pay Now" tests due to Vitest worker contention; running with `--sequence.concurrent=false` passes all 196 tests. This is the same pre-existing concurrency note from ST7 and is not caused by ST8.
- **Quality gates (all pass):**
  - `npm run lint` — 0 errors, 0 warnings
  - `npm run typecheck` — 0 errors
  - `npm test --sequence.concurrent=false` — 26 test files, 196 passed
  - `npm run build` — ✓ built in ~37s; pre-existing large-chunk and Carbon font-URL warnings only

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
