"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface CollectionCardProps {
  slug: string;
  title: string;
  filename: string;
}

export function CollectionCard({ slug, title, filename }: CollectionCardProps) {
  const imageSrc = filename.startsWith("/")
    ? filename
    : filename.startsWith("components/")
      ? `/images/${filename}`
      : `/images/components images/${filename}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: { type: "spring", stiffness: 350, damping: 32, mass: 0.8 },
        opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      }}
      className="skiper-card-wrap"
    >
      <Link href={`/showcase/${slug}`} className="skiper-card">
        <div className="card-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="card-footer">
          <span className="card-title">{title}</span>
          <span className="card-arrow">
            <ArrowUpRight size={13} strokeWidth={2.2} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
