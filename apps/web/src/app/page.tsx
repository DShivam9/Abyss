import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col gap-4 items-center justify-center font-mono uppercase text-[10px] tracking-widest select-none">
      <span>Vessel // Blank Stage</span>
      <Link 
        href="/components" 
        className="px-4 py-2 border border-white/20 hover:border-white/60 rounded-[4px] transition-colors duration-200 mt-2 bg-neutral-900/50 text-[9px]"
      >
        Enter Stage
      </Link>
    </main>
  );
}
