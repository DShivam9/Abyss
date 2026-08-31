"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ShowcaseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Showcase component error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-white font-sans px-6 select-none">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white/40 mb-4">
        !
      </div>
      <h1 className="text-xl font-semibold mb-2 tracking-tight">Component Encountered an Error</h1>
      <p className="text-sm text-[#8e8e93] max-w-md text-center mb-8">
        This interactive component failed to load or render. You can try refreshing it or explore the collection.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          Retry Component
        </button>
        <Link
          href="/collection"
          className="px-5 py-2.5 bg-[#1a1a1c] border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-colors"
        >
          Back to Collection
        </Link>
      </div>
    </div>
  );
}
