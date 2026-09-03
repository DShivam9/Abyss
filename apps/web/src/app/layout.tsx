import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { CursorProvider } from "@/components/providers/CursorProvider";
import { TabVisibilityTitle } from "@/components/providers/TabVisibilityTitle";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Navbar import removed

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const saintRegus = localFont({
  src: "../../public/fonts/saint-regus/sonar-hubermann-saintregus-semiboldexpanded.otf",
  weight: "600",
  style: "normal",
  variable: "--font-saint-regus",
  display: "block",
});

export const metadata: Metadata = {
  title: {
    default: "Abyss",
    template: "%s ✶ Abyss",
  },
  description: "An open-source React component library for immersive, physics-driven image interactions.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased font-sans ${jetbrainsMono.variable} ${saintRegus.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&f[]=ranade@400,500,600,700,900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Allura&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#0d0d0f] text-[#ffffff] font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-semibold focus:text-xs focus:rounded-full focus:shadow-lg"
        >
          Skip to content
        </a>
        <div className="noise-bg" />
        <TabVisibilityTitle />
        <SmoothScrollProvider>
          <CursorProvider>
            {children}
          </CursorProvider>
        </SmoothScrollProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
