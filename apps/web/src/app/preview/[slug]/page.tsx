import { Suspense } from "react";
import type { Metadata } from "next";
import { COMPONENT_DETAILS } from "@/lib/registry/component-details";
import { getComponentBg } from "@/lib/registry/layout-utils";
import PreviewPageClient from "./PreviewPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(COMPONENT_DETAILS).map((slug) => ({ slug }));
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
  const comp = COMPONENT_DETAILS[slug];
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: getComponentBg(slug, comp) }} />}>
      <PreviewPageClient slug={slug} />
    </Suspense>
  );
}
