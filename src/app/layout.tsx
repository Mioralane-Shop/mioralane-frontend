import type { Metadata } from "next";
import { Lora } from "next/font/google";
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

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
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

  return (
    <html lang="en" className={lora.variable}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface text-ink font-sans antialiased">
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
