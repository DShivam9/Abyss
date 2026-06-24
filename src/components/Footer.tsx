"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { IMAGES } from "@/lib/images";

const FOOTER_IMAGES = IMAGES.footer;

const ArrowIcon = () => (
  <svg 
    width="1em" 
    height="1em" 
    viewBox="0 0 12 12" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="ml-2"
  >
    <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const RollUpLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => {
  return (
    <Link href={href} className={`group relative overflow-hidden inline-flex ${className}`}>
      <span className="flex items-center group-hover:-translate-y-[100%] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
        {children}
      </span>
      <span className="flex items-center absolute top-0 left-0 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
        {children}
      </span>
    </Link>
  );
};

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % FOOTER_IMAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {

    
    const ctx = gsap.context(() => {
      // Massive text animation
      if (textRef.current) {
        const chars = textRef.current.querySelectorAll('.char');
        gsap.fromTo(chars, 
          { y: "110%", rotate: 5, transformOrigin: "left top" },
          { 
            y: "0%", 
            rotate: 0,
            stagger: 0.04, 
            duration: 1.4, 
            ease: "expo.out",
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 95%",
            }
          }
        );
      }

      // Columns stagger animation
      if (columnsRef.current) {
        const colLinks = columnsRef.current.querySelectorAll('.col-link');
        gsap.fromTo(colLinks,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.03,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: columnsRef.current,
              start: "top 80%",
            }
          }
        );
      }

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="bg-white text-black min-h-[90vh] flex flex-col justify-between pt-12 uppercase font-sans tracking-tighter relative z-10 overflow-hidden"
    >
      {/* Scattered Columns */}
      <div ref={columnsRef} className="grid grid-cols-1 md:grid-cols-3 w-full flex-1 px-4 md:px-8 py-20 relative gap-8">
        
        {/* Col 1: Home... (Top aligned) */}
        <div className="flex flex-col justify-start gap-2 md:gap-4 text-base md:text-xl lg:text-2xl font-black pt-12 md:pl-8">
          <RollUpLink href="#" className="col-link w-fit">HOME</RollUpLink>
          <RollUpLink href="#" className="col-link w-fit">PHILOSOPHY</RollUpLink>
          <RollUpLink href="#" className="col-link w-fit">EXHIBITION</RollUpLink>
          <RollUpLink href="#" className="col-link w-fit">MANIFESTO</RollUpLink>
        </div>

        {/* Col 2: Components... (Bottom aligned) */}
        <div className="flex flex-col justify-end pb-12 gap-2 md:gap-4 text-base md:text-xl lg:text-2xl font-black md:pl-12">
          <RollUpLink href="#" className="col-link w-fit">COMPONENTS</RollUpLink>
          <RollUpLink href="#" className="col-link w-fit">DOCS</RollUpLink>
          <RollUpLink href="#" className="col-link w-fit">INSTALL</RollUpLink>
        </div>

        {/* Col 3: Github */}
        <div className="flex flex-col justify-start pt-32 gap-2 md:gap-4 text-base md:text-xl lg:text-2xl font-black md:pl-20">
          <RollUpLink href="#" className="col-link w-fit">
            GITHUB <ArrowIcon />
          </RollUpLink>
        </div>

      </div>

      {/* Massive Text */}
      <div className="w-full flex items-end justify-between text-[15vw] leading-[0.78] font-black tracking-tighter px-4 pb-6 overflow-hidden">
        <div ref={textRef} className="flex w-full items-end justify-between">
          
          <div className="relative inline-flex">
            {/* The Image Slideshow (Bottom Layer) */}
            <div className="absolute inset-0 z-0">
              {FOOTER_IMAGES.map((src, i) => (
                <div 
                  key={src}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                    currentImage === i ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="50vw"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* The Text Mask (Top Layer via mix-blend-screen) */}
            <div className="relative z-10 flex bg-white text-black mix-blend-screen pr-[2vw]">
              {"ABSOLUTE".split("").map((char, i) => (
                <span key={i} className="inline-block overflow-hidden">
                  <span className="char inline-block">{char}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="inline-block overflow-hidden ml-[2vw]">
            <div className="char relative inline-block">
              <div className="absolute inset-0 bg-black"></div>
              
              <div className="absolute inset-0 z-0 pointer-events-none">
                {FOOTER_IMAGES.map((src, i) => (
                  <div 
                    key={src}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                      currentImage === i ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="50vw"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              <div className="relative z-10 bg-black text-white mix-blend-multiply px-[2vw] pt-[2vw] pb-[1vw]">
                UI
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}


