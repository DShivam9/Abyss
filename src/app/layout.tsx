import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import AgentationProvider from "@/components/AgentationProvider";
import TopNav from "@/components/TopNav";
import FilmGrain from "@/components/FilmGrain";

export const metadata: Metadata = {
  title: "Absolute UI — Image-First Interactive Components",
  description: "A living digital exhibition of premium React component craft. Experience interfaces that react, evolve, and coordinate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-base">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-bg-surface focus:text-fg-primary focus:rounded focus:shadow-lg font-sans text-sm"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          <FilmGrain />
          <TopNav />
          <div className="flex-1">
            {children}
          </div>
          <AgentationProvider />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
