import type { Metadata } from "next";
import { Hind_Siliguri, Lora } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { GoogleAuthProvider } from "@/providers/google-auth-provider";
import { StoreHydration } from "@/components/providers/store-hydration";
import { BotProtection } from "@/components/providers/bot-protection";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-summary";
import { Toaster } from "@/components/ui/toaster";
import { ScrollProgress } from "@/components/common/scroll-progress";
import { PromotionCampaign } from "@/components/common/promotion-campaign";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants/site";
import { getAnnouncement } from "@/lib/announcement";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import "./globals.css";

/**
 * Typography stack.
 *
 * - **Lora** is the main face — headings, page titles, section headings and other
 *   display type. Self-hosted by `next/font`, which also emits a metric-matched
 *   fallback face so the swap does not shift layout.
 * - **Satoshi** is the secondary English face — body copy, navigation, buttons,
 *   product names, prices and labels. It is served by Fontshare's hosted CSS,
 *   linked in `<head>` below; its origin is allowlisted in `lib/csp.ts`, so do not
 *   self-host or duplicate the files. Only the weights the UI actually uses
 *   (400 / 500 / 700 / 900) are requested.
 * - **Hind Siliguri** is the Bangla face. Applied through the `--font-bangla` token
 *   and the `:lang(bn)` rule in `globals.css`, so a component can mix scripts by
 *   marking the Bangla run with `lang="bn"` (or the `font-bangla` utility).
 */
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hind-siliguri",
  display: "swap",
  // The storefront shell is English; Bangla arrives only in long-form CMS copy.
  // Preloading would make every page fetch the Bengali subsets for glyphs that are
  // usually never rendered, so the face is fetched on first Bangla glyph instead.
  preload: false,
});

export const metadata: Metadata = {
  // `metadataBase` makes every relative canonical/Open Graph/Twitter URL
  // absolute. Without it Next warns and emits relative URLs, which crawlers and
  // social scrapers silently ignore.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Korean Skincare in Bangladesh`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "korean skincare",
    "k-beauty",
    "COSRX",
    "Beauty of Joseon",
    "ANUA",
    "Purito",
    "SKIN1004",
    "mioralane",
    "bangladesh",
    "dhaka",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  alternates: {
    types: {
      "application/xml": [
        { url: "/sitemap.xml", title: "Sitemap" },
      ],
    },
  },
  // Site-wide default. Transactional routes opt out with
  // `buildPageMetadata({ noIndex: true })`; there is deliberately NO root-level
  // `alternates.canonical`, because metadata is inherited — a canonical of "/"
  // here would point every page that forgets its own at the homepage.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${SITE_NAME} — Premium Korean Skincare in Bangladesh`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium Korean Skincare in Bangladesh`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  // Search Console ownership token. Rendered on every route by the root layout;
  // Next emits `<meta name="google-site-verification" content="..." />`.
  verification: {
    google: "FklR9kUZAs1rXKtF3ePdgSIznZ71hKxzW9325rHHkt8",
  },
  icons: {
    icon: [{ url: "/logo/logo_icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo/logo_icon.svg" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read here rather than inside the bar: see `lib/announcement.ts`. The value is
  // handed to the client component as its initial one, so the first paint shows the
  // campaign that is actually published instead of a stand-in that then changes.
  const announcement = await getAnnouncement();

  const fontVariables = `${lora.variable} ${hindSiliguri.variable}`;

  return (
    <html lang="en" className={fontVariables}>
      <head>
        {/* Warm the TLS connection the stylesheet below is fetched over. Same
            origin as `style-src` in `lib/csp.ts`, so no policy change is needed. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface text-ink font-sans antialiased" suppressHydrationWarning>
        <BotProtection />
        <GoogleAuthProvider>
          <QueryProvider>
            <StoreHydration />
            <ScrollProgress />
            <AnnouncementBar initial={announcement} />
            <Navbar />
            <CartDrawer />
            <Toaster />
            <PromotionCampaign />
            <main className="flex-1">{children}</main>
            <Footer />
          </QueryProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
