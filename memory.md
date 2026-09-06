# Mioralane Frontend — Project Memory

Customer-facing storefront for **Mioralane** — curated Korean skincare and routine bundles (COSRX, Beauty of Joseon, ANUA, Purito, SKIN1004, etc.), based in Bangladesh.

## Tech Stack
- **Next.js 14.2.35** (App Router) + **React 18** + TypeScript 5
- **Tailwind CSS 3.4** (config in `tailwind.config.ts`)
- **TanStack React Query v5**, **axios** (interceptors in `src/lib/axios.ts`)
- **zustand** stores (`src/store/`)
- **react-hook-form** + **zod** validation
- **Radix UI** (dialog, dropdown-menu, label, select, slot) + **@base-ui/react** + shadcn-style `components/ui`
- **@react-oauth/google** for Google sign-in; **lucide-react** icons
- Path alias `@/*` → `./src/*`

## Commands
- `npm run dev` · `npm run build` · `npm run start` · `npm run lint`

## Structure
```
src/
├── app/
│   ├── (auth)/  (dashboard)/  (public)/   # route groups
│   ├── (public)/  about, authenticity, blog, cart, checkout, combo, contact,
│   │               delivery, faq, order-success, product, returns, shop,
│   │               skincare-quiz, track-order, page.tsx
│   ├── fonts/  globals.css  layout.tsx
├── components/
│   ├── auth/  cart/  common/  layout/  orders/  product/  providers/  search/  ui/
├── constants/       # site.ts (NAV_LINKS, BRANDS, CATEGORIES, DUMMY_PRODUCTS, CATALOG_2026_PRODUCTS), combo.ts (COMBO_META)
├── hooks/
├── lib/             # axios.ts, auth-session.ts, utils.ts, validators/
├── providers/       # query-provider, google-auth-provider
├── services/        # auth.service, product.service, combo.service, order.service, wishlist.service
├── store/           # auth.store, cart.store, toast.store, wishlist.store
└── types/           # order.ts, product.ts
```

## Layout & Theme
- Root layout uses **Lora** (`next/font/google`, `--font-lora`) for serif + **Satoshi** (Fontshare, via `<link>`) for sans. `bg-surface text-ink`.
- Header stack: `AnnouncementBar` (fixed 36px) → `Navbar` (top row `top-[36px]`, bottom nav `top-[116px]`, scrolled `top-0`); spacer `h-[80px] lg:h-[129px]`.
- Theme tokens (tailwind.config): `brand`/`accent` pink `#D4637A`, `surface`/`ink` neutrals, `success #6B8F71`, `gold #8B7355`, `peach #E8A69A`. Custom radii (sm 8 / DEFAULT 12 / lg 20 / xl 28) and custom shadows. `twinkle` animation added for combo hero sparkle.
- Currency: `formatPrice` → `৳` using `en-IN` locale. Use `formatPrice` from `src/lib/utils.ts`.

## API / Services
- Base URL: `process.env.NEXT_PUBLIC_API_URL`; axios `withCredentials: true`, 10s timeout.
- `src/lib/axios.ts` auto-handles 401 by clearing auth state (`handleUnauthorizedSession` in `auth-session.ts`).
- Services: `auth.service` (login/register/googleLogin/getMe/logout — maps `_id`→`id`), `product.service` (getAll/getBySlug/getFeatured/getRelated/getByTab), `combo.service`, `order.service`, `wishlist.service`.

## Combo / Bundles
- `src/constants/combo.ts`: `COMBO_META`, `getComboProducts()`, `getComboMeta()`. `ComboCardMeta` includes `badge`/`savings`/`includedItems`/`routineTag`.
- Dedicated page: `src/app/(public)/combo/page.tsx` + `src/components/common/combo-section.tsx` (client bundle grid).
- `ComboNavItem` in `navbar.tsx` — hover dropdown; all combo links point to `/combo`.
- On `ProductCard`, combo features auto-render when `product.category === "combo"` or a `combo` prop is passed (bundle descriptor, savings, compact metadata, bundle image badge, dual price display).

## Site config (`src/constants/site.ts`)
- `SITE_NAME = "Mioralane"`, `SITE_DESCRIPTION`, `SITE_URL = "https://mioralane.com"`.
- `SITE_WHATSAPP = "8801700000000"` — placeholder, replace with real number.
- `NAV_LINKS`, `BRANDS` (~30 brands), `CATEGORIES`, `DUMMY_PRODUCTS` + `CATALOG_2026_PRODUCTS`.

## Images
`next.config.mjs` `images.remotePatterns` allow: images.unsplash.com, encrypted-tbn0.gstatic.com, `**.googleapis.com`, picsum.photos, images.squarespace-cdn.com, skynellebeauty.com, lavishta.com.
