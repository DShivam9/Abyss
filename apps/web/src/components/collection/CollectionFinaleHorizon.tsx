"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";

// Dynamically import shared 3D Logo Piece (SSR false)
const Abyss3DLogoPiece = dynamic(
  () =>
    import("@/components/layout/Abyss3DLogoPiece").then(
      (mod) => mod.Abyss3DLogoPiece
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
          fontSize: "clamp(26px, 3.8vw, 54px)",
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

export function CollectionFinaleHorizon() {
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
        width: "100%",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: "24px",
        paddingTop: "80px",
        paddingBottom: "40px",
        transform: "translateX(-90px)",
      }}
    >
      {/* Left Typography — Horizon Unroll (originates from center star) */}
      <div style={{ justifySelf: "end", display: "flex", justifyContent: "flex-end" }}>
        <HorizonLaserUnrollTypography
          text="FIND YOUR SPARK"
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
          width: "260px",
          height: "260px",
          justifySelf: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity, filter",
        }}
      >
        <Abyss3DLogoPiece size={260} />
      </motion.div>

      {/* Right Typography — Horizon Unroll (originates from center star) */}
      <div style={{ justifySelf: "start", display: "flex", justifyContent: "flex-start" }}>
        <HorizonLaserUnrollTypography
          text="START CREATING"
          isInView={isInView}
          origin="left"
          delay={0.15}
        />
      </div>
    </section>
  );
}
