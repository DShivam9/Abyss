"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface CollectionCardProps {
  slug: string;
  title: string;
  filename: string;
  videoSrc?: string;
  priority?: boolean;
}

export function CollectionCard({ slug, title, filename, videoSrc, priority = false }: CollectionCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageSrc = filename.startsWith("/")
    ? filename
    : filename.startsWith("components/")
      ? `/images/${filename}`
      : `/images/components images/${filename}`;

  // Instant 0ms ambient blur-up placeholder
  const blurDataURL = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231c1926'/%3E%3Cstop offset='50%25' stop-color='%23121520'/%3E%3Cstop offset='100%25' stop-color='%230f1418'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E`;

  return (
    <div className="skiper-card-wrap">
      <Link
        href={`/showcase/${slug}`}
        className="skiper-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`card-preview ${isLoaded ? "is-loaded" : "is-loading"}`}>
          {videoSrc && isHovered ? (
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              className="card-video-preview"
            />
          ) : (
            <Image
              src={imageSrc}
              alt={title}
              fill
              placeholder="blur"
              blurDataURL={blurDataURL}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              priority={priority}
              className={`card-image ${isLoaded ? "card-image-visible" : "card-image-hidden"}`}
              onLoad={() => setIsLoaded(true)}
            />
          )}
        </div>
        <div className="card-footer">
          <span className="card-title">{title}</span>
          <span className="card-arrow">
            <ArrowUpRight size={13} strokeWidth={2.2} />
          </span>
        </div>
      </Link>
    </div>
  );
}

