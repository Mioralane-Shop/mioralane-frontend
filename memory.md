# Mioralane Frontend — Project Memory

Customer-facing storefront for **Mioralane** — curated Korean skincare and routine bundles (COSRX, Beauty of Joseon, ANUA, Purito, SKIN1004, etc.), based in Bangladesh.

## Tech Stack
- **Next.js 16.3.7** (App Router, Turbopack) + **React 19** + TypeScript 5
- **Tailwind CSS 4** — CSS-first. Theme tokens live in the `@theme` block of
  `src/app/globals.css`; there is NO `tailwind.config.ts` (deleted in P1.8d).
  PostCSS plugin is `@tailwindcss/postcss`.
- **TanStack React Query v5**, **axios** (interceptors in `src/lib/axios.ts`)
- **zustand** stores (`src/store/`)
- **react-hook-form** + **zod** validation
- **Radix UI** (dialog, dropdown-menu, label, select, slot) + shadcn-style `components/ui`
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
- Typography tokens (`@theme` in `src/app/globals.css`), all family names live here — no component hardcodes one: `font-display` = **Lora** (main face: headings, titles; self-hosted via `next/font`, `--font-lora`), `font-sans` = **Satoshi** (secondary English: body, nav, buttons, product names, prices; Fontshare hosted CSS via `<link>` in `src/app/layout.tsx`, weights 400/500/700/900, CSP-allowlisted in `src/lib/csp.ts`), `font-bangla` = **Hind Siliguri** (Bangla; `next/font`, `preload: false` because the shell is English). `h1`–`h6` are Lora 500 via an unlayered rule; Bangla runs use `lang="bn"` (or `font-bangla`), matched by the unlayered `:lang(bn)` rule. `bg-surface text-ink`.
- Header stack: `AnnouncementBar` (fixed 36px) → `Navbar` (top row `top-[36px]`, bottom nav `top-[116px]`, scrolled `top-0`); spacer `h-[80px] lg:h-[129px]`.
- Theme tokens (`@theme` in `src/app/globals.css`): `brand`/`accent` pink `#FB6F92`, `surface`/`ink` neutrals, `success #006400`, `gold #8B7355`, `peach #FCA1B8`. Custom radii (`sm` 8 / `base` 12 / `lg` 20 / `xl` 28) and custom shadows (`sm`, `card`, `lg`). `twinkle` animation for the combo hero sparkle. The bare radius/shadow utilities are NOT usable at these values in v4 — a variable or class named exactly `rounded`/`shadow` behaves differently, see the note in `globals.css`.
- Currency: `formatPrice` → `৳` using `en-IN` locale. Use `formatPrice` from `src/lib/utils.ts`.

## Product detail page (`app/(public)/product/[brand]/[slug]/page.tsx`)
- **Canonical URL is nested: `/product/<brandSlug>/<productSlug>`.** Build every product link with `productPath(product)` from `src/lib/product-path.ts` — never hand-write `/product/${slug}`. `brandSlug` comes from the API (backend `slugify(brand)`); `productPath` falls back to slugifying `brand` for bundled/legacy data, and to the flat path when either segment is missing.
- **Legacy flat URLs redirect with a real 301 from `src/middleware.ts`** (`/^\/product\/([^/]+)\/?$/` → API lookup → `NextResponse.redirect(..., 301)`). It must live in middleware: a Server Component cannot emit a 3xx once streaming has started, so the `[brand]` page's `permanentRedirect()` degrades to a 200 + `<meta http-equiv="refresh">`. That page remains as the fallback when the API is unreachable.
- `[brand]` is the segment name at BOTH levels (`product/[brand]/page.tsx` = legacy redirect, `product/[brand]/[slug]/` = PDP). Next.js rejects two different dynamic names at the same level, so the legacy page's param is a legacy *product slug* despite the name.
- The page is `"use client"`; SEO lives in `[brand]/[slug]/layout.tsx` (metadata, canonical, JSON-LD, breadcrumbs). That layout also permanently redirects a brand segment that does not match the product's own brand slug (200 + client redirect in practice, because of streaming).
- Sitemap, JSON-LD defaults and the SEO harness all go through `productPath`; `src/lib/product-path.ts` must stay import-free (it is loaded by `scripts/verify-seo.ts` under Node type stripping).
- **Typography is centralised in `src/lib/product-typography.ts`** — `SECTION_EYEBROW`, `BODY_COPY`, `SPEC_CHIP`. The page and `components/product/product-reviews.tsx` both import it, so the eight section labels ("About This Product", "Best For", "How To Use", "The Mioralane Promise", "Key Ingredients", "Delivery", "Returns", "Authenticity Guarantee", "Customer Reviews") cannot drift.
- Section eyebrows are **`<p>` elements, not `<h3>`**: the unlayered `h1–h6` rule in `globals.css` forces Lora + weight 500 and beats `font-sans`/`font-semibold` utilities, so a heading element always renders in the display face regardless of class.
- Palette used there: eyebrow `#3A3531`, body `#453F3B`, card title `#262120`, secondary/muted `#6B655F`, inactive tab `#5B5550`. Do not reintroduce the older `#6E6966`/`#5F5A57`/`#6A6561` (they read washed out at 11px).
- Overview tab: About This Product, How To Use (separate section, only when present), Best For (skin types + concerns), The Mioralane Promise.
- Ingredients tab: **Key Ingredients only** — a compact `flex-wrap` row of name pills (max 5, name only; the old per-ingredient description and the tall card grid were removed). The full `ingredients` INCI text is still accepted from legacy records but deliberately not rendered; an empty `keyIngredients` array shows a short fallback line, never an empty list.

## Hero slider (homepage)
- `src/services/hero-slide.service.ts` + `src/hooks/use-hero-slides.ts` fetch `GET /hero-slides` with `staleTime: 10 min`, `retry: 1`.
- `components/common/hero-section.tsx` renders whatever the API returns when there is at least one slide; otherwise (loading, error, empty) it falls back to the bundled `/slider/slider1.png` / `slider2.png`. The top of the homepage is never blank.
- Each slide is **finished artwork** — no headline/badge/CTA is rendered by code, so the whole banner is the link. `https://` targets open in a new tab with `rel="noopener noreferrer"`; site paths use `next/link`.
- Posters are rendered with a plain `<img>` (host-agnostic) and ImageKit URLs get `?tr=w-1600,q-85,f-auto` appended, unless they already carry a `tr=`. **CSP caveat:** the storefront's `img-src` is deliberately pinned to `ik.imagekit.io` (+ Google/GA hosts), so a non-ImageKit poster host must be added to `src/lib/csp.ts` or its image will be blocked in production.

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
`next.config.mjs` `images.remotePatterns` allows **one** host — `ik.imagekit.io` with `pathname: "/7sz3r4tou/**"` (P1.5b). Eight scaffold-era hosts (images.unsplash.com, encrypted-tbn0.gstatic.com, `**.googleapis.com`, picsum.photos, example.com, images.squarespace-cdn.com, skynellebeauty.com, lavishta.com) were removed: none was referenced anywhere in `src/`, and each one widened the image-optimizer attack surface behind GHSA-2xp9-vwfh-vxw4. The pathname pins the optimizer to our own ImageKit endpoint, because `ik.imagekit.io` is multi-tenant. An image URL stored on a removed host now renders `ProductImage`'s placeholder.
