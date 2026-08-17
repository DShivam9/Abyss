"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CollectionCardProps {
  slug: string;
  title: string;
  filename: string;
}

export function CollectionCard({ slug, title, filename }: CollectionCardProps) {
  const imageSrc = filename.startsWith("/")
    ? filename
    : `/images/components images/${filename}`;

  return (
    <Link href={`/showcase/${slug}`} className="skiper-card">
      <div className="card-preview">
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
  );
}
