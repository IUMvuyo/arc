import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Cursor } from "@/components/Cursor";

// The display face carries all the personality — variable axes we animate on scroll.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

// Quiet grotesk for body — never competes with the display face.
const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Arc — a website built from your week",
  description:
    "Hand Arc a messy week of your own notes. It finds the real shape of it and builds you a one-of-a-kind site that tells that story back.",
  openGraph: {
    title: "Arc — a website built from your week",
    description:
      "GPT-5.6 reads your raw week and finds its real shape. The engine composes a bespoke, cinematic site that tells it back — different every time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ink font-body text-paper antialiased">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
