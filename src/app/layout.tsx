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
