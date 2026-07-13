import { Suspense } from "react";
import { DetailPageClient } from "./DetailPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComponentDetailPagePage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-[#a6a6ac]">Loading Specimen Details...</div>}>
      <DetailPageClient slug={slug} />
    </Suspense>
  );
}
