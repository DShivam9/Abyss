import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection",
  description: "Curated archive of web experiments, creative code, and visual artifacts.",
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
