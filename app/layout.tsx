import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Space_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { Cursor } from "@/components/Cursor";
import { CloudProvider } from "@/components/CloudProvider";

// The display face carries the emotion. Variable axes animate on scroll.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

// Quiet grotesk for reading. Never competes with the display face.
const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

// The editorial voice: labels, numbers, metadata. Held in tension with the serif.
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://arc-gold-beta.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Arc / a site built from your week",
  description:
    "Hand Arc a messy week of your own notes. It finds the real shape of it and builds you a one of a kind site that tells that story back.",
  openGraph: {
    title: "Arc / a site built from your week",
    description:
      "GPT-5.6 reads your raw week and finds its real shape. The engine composes a bespoke, cinematic site that tells it back. Different every time.",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0E10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-ink font-body text-paper antialiased">
        {/* Honor prefers-reduced-motion globally: animations snap to their end
            state (content visible) instead of animating. */}
        <MotionConfig reducedMotion="user">
          <CloudProvider>
            <Cursor />
            {children}
          </CloudProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
