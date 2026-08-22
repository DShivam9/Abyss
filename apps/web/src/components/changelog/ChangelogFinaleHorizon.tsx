"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";

// Dynamically import isolated 3D Logo Piece for Changelog (SSR false)
const Changelog3DLogoPiece = dynamic(
  () =>
    import("@/components/changelog/Changelog3DLogoPiece").then(
      (mod) => mod.Changelog3DLogoPiece
    ),
  { ssr: false }
);

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
  const initialClip =
    origin === "right" ? "inset(0 0% 0 100%)" : "inset(0 100% 0 0)";
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
                letterSpacing: "-0.02em",
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
          fontSize: "clamp(16px, 2.3vw, 36px)",
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

export function ChangelogFinaleHorizon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once: true,
    amount: 0.3,
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
        gap: "16px",
        paddingTop: "60px",
        paddingBottom: "50px",
      }}
    >
      {/* Left Typography — Horizon Unroll (originates from center star) */}
      <div style={{ flex: "1 1 0%", display: "flex", justifyContent: "flex-end" }}>
        <HorizonLaserUnrollTypography
          text="YOU'RE ALL CAUGHT UP"
          isInView={isInView}
          origin="right"
          delay={0.15}
        />
      </div>

      {/* Center 3D Logo Piece — Cinematic Hyperspin & Celestial Bloom */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.18,
          rotate: -180,
          filter: "brightness(2)",
        }}
        animate={
          isInView
            ? { opacity: 1, scale: 1, rotate: 0, filter: "brightness(1)" }
            : {
                opacity: 0,
                scale: 0.18,
                rotate: -180,
                filter: "brightness(2)",
              }
        }
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        style={{
          width: "200px",
          height: "200px",
          flex: "0 0 200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity, filter",
        }}
      >
        <Changelog3DLogoPiece size={200} />
      </motion.div>

      {/* Right Typography — Horizon Unroll (originates from center star) */}
      <div style={{ flex: "1 1 0%", display: "flex", justifyContent: "flex-start" }}>
        <HorizonLaserUnrollTypography
          text="CRAFTING THE NEXT DROP"
          isInView={isInView}
          origin="left"
          delay={0.15}
        />
      </div>
    </section>
  );
}
