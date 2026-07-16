import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { CursorProvider } from "@/components/providers/CursorProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Navbar import removed

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

const editorialNew = localFont({
  src: [
    {
      path: "../../public/fonts/editorial-new-font-family/PPEditorialNew-Ultralight-BF644b21500d0c0.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/editorial-new-font-family/PPEditorialNew-UltralightItalic-BF644b214ff1e9b.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/editorial-new-font-family/PPEditorialNew-Regular-BF644b214ff145f.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/editorial-new-font-family/PPEditorialNew-Italic-BF644b214fb0c0a.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abyss",
  description: "An open-source React component library for immersive, physics-driven image interactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", satoshi.variable, jetbrainsMono.variable, "font-sans", geist.variable, editorialNew.variable)}>
      <body className="min-h-full flex flex-col bg-vessel-base text-vessel-text-primary font-sans">
        <div className="noise-bg" />
        <SmoothScrollProvider>
          <CursorProvider>
            {children}
          </CursorProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
