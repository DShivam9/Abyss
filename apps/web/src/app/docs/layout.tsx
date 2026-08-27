import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Architecture, component specifications, and engineering documentation for Abyss.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
