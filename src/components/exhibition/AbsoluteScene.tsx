"use client";
import Image from "next/image";
import { IMAGES } from "@/lib/images";

export default function AbsoluteScene() {
  return (
    <div className="relative md:absolute md:inset-0 w-full h-[60vh] md:h-full flex items-center justify-center pointer-events-none">
      <div className="absolute-scene-wrapper relative w-[80vw] h-[50vh] md:w-[35vw] md:h-[60vh] overflow-hidden rounded-sm md:shadow-2xl">
        <Image 
          src={IMAGES.avantGardeFashion} 
          alt="Absolute Full Bleed" 
          fill 
          className="absolute-scene-img object-cover scale-100 md:scale-110" 
          sizes="100vw" 
        />
        <div className="absolute inset-0 bg-black/20 absolute-overlay opacity-0" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center mix-blend-difference px-6">
        <h2 className="absolute-text font-cormorant text-[18vw] md:text-[12vw] italic text-white uppercase tracking-tighter text-center leading-none opacity-100 scale-100 md:opacity-0 md:scale-95">
          Pure Form
        </h2>
      </div>
    </div>
  );
}
