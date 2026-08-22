"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { CliTerminal, PackageManager } from "./CliTerminal";

// Dynamically import isolated 3D Logo Piece (SSR false)
const Abyss3DLogoPiece = dynamic(
  () =>
    import("@/components/shared/Abyss3DLogoPiece").then(
      (mod) => mod.Abyss3DLogoPiece
    ),
  { ssr: false }
);

const COMPONENT_CLI_COMMANDS: Record<PackageManager, string> = {
  pnpm: "pnpm dlx abyss add <component-name>",
  npm: "npx abyss add <component-name>",
  bun: "bunx abyss add <component-name>",
  yarn: "yarn abyss add <component-name>",
};

const CORE_PACKAGE_COMMANDS: Record<PackageManager, string> = {
  pnpm: "pnpm add abyss/core",
  npm: "npm install abyss/core",
  bun: "bun add abyss/core",
  yarn: "yarn add abyss/core",
};

const TECH_STACK = [
  { name: "React", iconSrc: "/icons/tech/React.svg" },
  { name: "Three.js", iconSrc: "/icons/tech/threedotjs.svg" },
  { name: "WebGL / GLSL", iconSrc: "/icons/tech/webgl.svg" },
  { name: "GSAP", iconSrc: "/icons/tech/gsap.svg" },
  { name: "Anime.js", iconSrc: "/icons/tech/animedotjs.svg" },
  { name: "TypeScript", iconSrc: "/icons/tech/TypeScript.svg" },
  { name: "Tailwind CSS", iconSrc: "/icons/tech/tailwind-css.svg" },
  { name: "Lenis", iconSrc: "/icons/tech/lenis.svg" },
];

function HorizonLaserUnrollTypography({
  text,
  isInView,
  origin,
  delay = 0,
}: {
  text: string;
  isInView: boolean;
  origin: "left" | "right";
  delay?: number;
}) {
  // If origin is "right", unmask flows from right to left (originating from center star)
  // If origin is "left", unmask flows from left to right (originating from center star)
  const initialClip = origin === "right" ? "inset(0 0% 0 100%)" : "inset(0 100% 0 0)";
  const finalClip = "inset(0 0% 0 0%)";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        paddingBottom: "4px",
      }}
    >
      <motion.div
        initial={{
          clipPath: initialClip,
          opacity: 0,
          letterSpacing: "-0.05em",
        }}
        animate={
          isInView
            ? {
                clipPath: finalClip,
                opacity: 1,
                letterSpacing: "-0.03em",
              }
            : {
                clipPath: initialClip,
                opacity: 0,
                letterSpacing: "-0.05em",
              }
        }
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          delay,
        }}
        style={{
          fontFamily: "Ranade, -apple-system, sans-serif",
          fontSize: "clamp(26px, 3.6vw, 48px)",
          fontWeight: 900,
          lineHeight: 1,
          color: "#ffffff",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          willChange: "clip-path, opacity",
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}

function FinaleHorizonSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once: true,
    amount: 0.5,
    margin: "0px 0px -40px 0px",
  });

  return (
    <section
      ref={containerRef}
      style={{
        width: "100vw",
        maxWidth: "1280px",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        paddingLeft: "32px",
        paddingRight: "32px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        paddingTop: "120px",
        paddingBottom: "70px",
      }}
    >
      {/* Left Typography — Horizon Unroll (originates from center star) */}
      <HorizonLaserUnrollTypography
        text="MAKE SOMETHING"
        isInView={isInView}
        origin="right"
        delay={0.15}
      />

      {/* Center 3D Logo Piece — Cinematic Hyperspin & Celestial Bloom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.18, rotate: -180, filter: "brightness(2)" }}
        animate={
          isInView
            ? { opacity: 1, scale: 1, rotate: 0, filter: "brightness(1)" }
            : { opacity: 0, scale: 0.18, rotate: -180, filter: "brightness(2)" }
        }
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        style={{
          width: "270px",
          height: "270px",
          flex: "0 0 270px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity, filter",
        }}
      >
        <Abyss3DLogoPiece size={270} />
      </motion.div>

      {/* Right Typography — Horizon Unroll (originates from center star) */}
      <HorizonLaserUnrollTypography
        text="UNFORGETTABLE"
        isInView={isInView}
        origin="left"
        delay={0.15}
      />
    </section>
  );
}

export function DocsSections() {
  return (
    <main
      style={{
        width: "100%",
        maxWidth: "680px",
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: "220px",
        paddingBottom: "40px",
        paddingLeft: "24px",
        paddingRight: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "150px",
      }}
    >
      {/* Block 01: Quick Intro */}
      <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13.5px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8e8e93",
          }}
        >
          Quick Intro
        </div>

        <div
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "22px",
            lineHeight: 1.6,
            color: "#ededee",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            letterSpacing: "-0.015em",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#ffffff", fontWeight: 600 }}>Abyss</strong> is a creative collection of interactive components. We draw inspiration from across the web, redesigning and reshaping each piece with our own vision, craft, and taste.
          </p>
          <p style={{ margin: 0, color: "#a1a1aa" }}>
            Every component is free to use, adapt, and customize to your liking.
          </p>
        </div>
      </section>

      {/* Block 02: How It Works */}
      <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13.5px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8e8e93",
          }}
        >
          How It Works
        </div>

        <div
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "22px",
            lineHeight: 1.6,
            color: "#ededee",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            letterSpacing: "-0.015em",
          }}
        >
          <p style={{ margin: 0 }}>
            Pick a component you like from the collection, copy the code, and paste it into your project. That&apos;s pretty much it.
          </p>
          <p style={{ margin: 0, color: "#a1a1aa" }}>
            You can tweak parameters live in the preview to test different settings, but for full customization, feel free to edit the code directly to fit your exact needs and aesthetics.
          </p>
        </div>
      </section>

      {/* Block 03: Installation & CLI */}
      <section
        id="installation-and-cli"
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: "28px" }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13.5px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8e8e93",
          }}
        >
          Installation &amp; CLI
        </div>

        {/* Method 1: Add a specific component */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <span
            style={{
              fontFamily: "Switzer, -apple-system, sans-serif",
              fontSize: "17px",
              lineHeight: 1.5,
              color: "#ededee",
              fontWeight: 500,
            }}
          >
            Add a specific component directly into your project:
          </span>

          <CliTerminal
            commands={COMPONENT_CLI_COMMANDS}
            layoutPrefix="cli-add"
          />
        </div>

        {/* Method 2: Install full core package */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
          <span
            style={{
              fontFamily: "Switzer, -apple-system, sans-serif",
              fontSize: "17px",
              lineHeight: 1.5,
              color: "#ededee",
              fontWeight: 500,
            }}
          >
            Or install the full core package:
          </span>

          <CliTerminal
            commands={CORE_PACKAGE_COMMANDS}
            layoutPrefix="cli-core"
          />
        </div>
      </section>

      {/* Block 04: Built With */}
      <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13.5px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8e8e93",
          }}
        >
          Built With
        </div>

        <div
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "22px",
            lineHeight: 1.6,
            color: "#ededee",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            letterSpacing: "-0.015em",
          }}
        >
          <p style={{ margin: 0 }}>
            Not every component uses all of these technologies. Each piece only includes what it actually needs.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "4px",
          }}
        >
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#111114",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "8px",
                padding: "7px 13px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                color: "#ededee",
                fontFamily: "Switzer, -apple-system, sans-serif",
                fontSize: "13.5px",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                transition: "all 180ms ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#17171b";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#111114";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tech.iconSrc}
                alt={tech.name}
                style={{
                  width: tech.name.includes("WebGL") ? "22px" : "15px",
                  height: "15px",
                  display: "block",
                  objectFit: "contain",
                }}
              />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Block 05: Credits */}
      <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13.5px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8e8e93",
          }}
        >
          Credits
        </div>

        <div
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "22px",
            lineHeight: 1.6,
            color: "#ededee",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            letterSpacing: "-0.015em",
          }}
        >
          <p style={{ margin: 0 }}>
            Many of these components are inspired by creative experiments, designers, and developers across the web.
          </p>
          <p style={{ margin: 0, color: "#a1a1aa" }}>
            Full respect and credit goes to the original creators who push web design forward. If you recognize an interaction or built the original concept, reach out and we will gladly add direct attribution.
          </p>
        </div>
      </section>

      {/* Block 06: Contribute & Usage */}
      <section
        id="contribute-&-usage"
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13.5px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8e8e93",
          }}
        >
          Contribute &amp; Usage
        </div>

        <div
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "22px",
            lineHeight: 1.6,
            color: "#ededee",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            letterSpacing: "-0.015em",
          }}
        >
          <p style={{ margin: 0 }}>
            Abyss is completely open source and free for personal and commercial projects. You are free to use any component in your work and contribute new ideas or fixes on GitHub.
          </p>
          <p style={{ margin: 0, color: "#a1a1aa" }}>
            If you use these components in your work, please make sure proper attribution is given. All we ask is that you do not resell or redistribute them as standalone paid libraries.
          </p>
        </div>
      </section>

      {/* Block 07: Finale — Wide Horizon Poster with 3D Centerpiece */}
      <FinaleHorizonSection />
    </main>
  );
}
