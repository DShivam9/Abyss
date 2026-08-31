import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPONENT_DETAILS } from "@/lib/registry/component-details";
import ShowcasePageClient from "./ShowcasePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = COMPONENT_DETAILS[slug];
  if (!comp) {
    return {
      title: "404 — Component Not Found",
      description: "The requested component could not be found.",
    };
  }

  return {
    title: comp.label,
    description: comp.desc || "Abyss component showcase.",
  };
}

export default async function ShowcasePage({ params }: PageProps) {
  const { slug } = await params;
  const comp = COMPONENT_DETAILS[slug];
  if (!comp) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070708]" />}>
      <ShowcasePageClient slug={slug} />
    </Suspense>
  );
}
