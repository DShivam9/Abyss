"use client";

import React, { useState, useMemo } from "react";
import { getComponent, getLayoutType, getComponentBg } from "@/lib/registry";
import { ShaderShowcaseLayout } from "@/components/showcase/layouts/ShaderShowcaseLayout";
import { ScrollShowcaseLayout } from "@/components/showcase/layouts/ScrollShowcaseLayout";
import { GalleryShowcaseLayout } from "@/components/showcase/layouts/GalleryShowcaseLayout";
import { TransitionShowcaseLayout } from "@/components/showcase/layouts/TransitionShowcaseLayout";
import { ComponentErrorBoundary } from "@/components/showcase/ComponentErrorBoundary";
import { PerformanceProvider } from "@abyss-ui/core";
import "@/components/showcase/showcase.css";

interface PreviewPageClientProps {
  slug: string;
}

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
    : `/images/${meta.filename}`;

  const { isSelfContainedScroll, isText, isScroll, isGallery, isTransition } = getLayoutType(meta, slug);
  const bgColor = getComponentBg(slug, meta);

  const renderComponent = () => {
    return <Component imageSrc={defaultImageSrc} {...controlValues} onControlChange={handleControlChange} />;
  };

  const renderLayout = () => {
    if (isSelfContainedScroll) {
      return (
        <div
          className="relative w-full min-h-screen h-screen overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          {renderComponent()}
        </div>
      );
    }

    if (isText) {
      return (
        <div
          className="relative w-full min-h-screen"
          style={{ backgroundColor: bgColor }}
        >
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
    <PerformanceProvider>
      <main
        className={`w-full min-h-screen ${isScroll ? "" : "h-screen overflow-hidden"}`}
        style={{ backgroundColor: bgColor }}
      >
        <ComponentErrorBoundary fallbackSlug={slug}>
          {renderLayout()}
        </ComponentErrorBoundary>
      </main>
    </PerformanceProvider>
  );
}
