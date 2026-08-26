import { Suspense } from "react";
import type { Metadata } from "next";
import { COMPONENT_DETAILS } from "@/lib/registry/component-details";
import PreviewPageClient from "./PreviewPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = COMPONENT_DETAILS[slug];
  const title = comp ? `${comp.label} (Preview)` : "Preview";

  return {
    title,
    description: comp?.desc || "Abyss component isolated preview.",
  };
}

export default async function PreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const isLightBg = slug === "cascade-gallery";
  return (
    <Suspense fallback={<div className={`min-h-screen ${isLightBg ? "bg-[#f4f1ea]" : "bg-[#070708]"}`} />}>
      <PreviewPageClient slug={slug} />
    </Suspense>
  );
}
