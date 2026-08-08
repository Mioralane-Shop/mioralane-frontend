import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { GoogleAuthProvider } from "@/providers/google-auth-provider";
import { StoreHydration } from "@/components/providers/store-hydration";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-summary";
import { Toaster } from "@/components/ui/toaster";
import { ScrollProgress } from "@/components/common/scroll-progress";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants/site";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
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
  authors: [{ name: "Mioralane" }],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "https://mioralane.com",
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.variable}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface text-ink font-sans antialiased">
        <GoogleAuthProvider>
          <QueryProvider>
          <StoreHydration />
          <ScrollProgress />
          <AnnouncementBar />
          <Navbar />
          <CartDrawer />
          <Toaster />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
