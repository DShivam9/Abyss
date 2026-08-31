"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-white font-sans px-6 select-none">
      <div className="text-6xl font-bold tracking-tight mb-4 text-white/20">!</div>
      <h1 className="text-lg font-semibold mb-2 tracking-tight">Something broke</h1>
      <p className="text-sm text-[#8e8e93] max-w-md text-center mb-8">
        An unexpected error occurred. You can retry or return to home.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#1a1a1c] border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
