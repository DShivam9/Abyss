"use client";

import React, { useState, useMemo } from "react";
import { getComponent } from "@/lib/registry";
import { ShaderShowcaseLayout } from "@/components/showcase/ShaderShowcaseLayout";
import { ScrollShowcaseLayout } from "@/components/showcase/ScrollShowcaseLayout";
import { GalleryShowcaseLayout } from "@/components/showcase/GalleryShowcaseLayout";
import { TransitionShowcaseLayout } from "@/components/showcase/TransitionShowcaseLayout";
import { ComponentErrorBoundary } from "@/components/showcase/ComponentErrorBoundary";

interface PreviewPageClientProps {
  slug: string;
}

const SELF_CONTAINED_SCROLL = new Set([
  "dual-wave",
  "depth-swim",
  "cylinder-scroll",
  "parallax-bleed",
  "curved-scroll-wipe"
]);

export default function PreviewPageClient({ slug }: PreviewPageClientProps) {
  const { Component, meta } = getComponent(slug);

  const initialValues = useMemo(() => {
    const init: Record<string, string | number | boolean> = {};
    if (meta?.controls) {
      meta.controls.forEach((ctrl) => {
        init[ctrl.key] = ctrl.default;
      });
    }
    return init;
  }, [meta]);

  const [controlValues, setControlValues] = useState<Record<string, string | number | boolean>>(initialValues);

  const handleControlChange = (key: string, value: string | number | boolean) => {
    setControlValues((prev) => ({ ...prev, [key]: value }));
  };

  if (!Component || !meta) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#070708] text-neutral-400">
        Component not found.
      </div>
    );
  }

  const defaultImageSrc = meta.filename.startsWith("/")
    ? meta.filename
    : meta.filename.startsWith("components/")
      ? `/images/${meta.filename}`
      : `/images/components images/${meta.filename}`;

  const isSelfContainedScroll = SELF_CONTAINED_SCROLL.has(slug);
  const previewType = meta.previewType || (meta.category === "scroll" ? "scroll" : meta.category === "text" ? "text" : "shader");
  const isText = meta.category === "text" || previewType === "text";
  const isScroll = !isText && !isSelfContainedScroll && (previewType === "scroll" || meta.category === "scroll");
  const isGallery = !isText && !isScroll && (isSelfContainedScroll || meta.category === "gallery" || meta.category === "svg" || previewType === "gallery" || (meta.category !== "scroll" && (meta.subtype === "gallery" || meta.subtype === "ring")));
  const isTransition = !isText && !isSelfContainedScroll && (meta.category === "transition" || previewType === "transition");

  const renderComponent = () => {
    return <Component imageSrc={defaultImageSrc} {...controlValues} onControlChange={handleControlChange} />;
  };

  const renderLayout = () => {
    if (isSelfContainedScroll) {
      return (
        <div className="relative w-full min-h-screen h-screen bg-[#070708] overflow-hidden">
          {renderComponent()}
        </div>
      );
    }

    if (isText) {
      return (
        <div className="relative w-full bg-[#070708] min-h-screen">
          {renderComponent()}
        </div>
      );
    }

    if (isScroll) {
      return (
        <ScrollShowcaseLayout accentColor="#dfb15b">
          {renderComponent()}
        </ScrollShowcaseLayout>
      );
    }

    if (isGallery) {
      return (
        <GalleryShowcaseLayout>
          {renderComponent()}
        </GalleryShowcaseLayout>
      );
    }

    if (isTransition) {
      return (
        <TransitionShowcaseLayout>
          {renderComponent()}
        </TransitionShowcaseLayout>
      );
    }

    return (
      <ShaderShowcaseLayout>
        {renderComponent()}
      </ShaderShowcaseLayout>
    );
  };

  return (
    <main className={`w-full min-h-screen bg-[#070708] ${isScroll ? "" : "h-screen overflow-hidden"}`}>
      <ComponentErrorBoundary fallbackSlug={slug}>
        {renderLayout()}
      </ComponentErrorBoundary>
    </main>
  );
}
