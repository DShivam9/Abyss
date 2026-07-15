import { Suspense } from "react";
import ShowcasePageClient from "./ShowcasePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShowcasePage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070708] flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-[#a6a6ac]">
          Loading Showcase...
        </div>
      }
    >
      <ShowcasePageClient slug={slug} />
    </Suspense>
  );
}
