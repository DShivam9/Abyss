"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { getComponent } from "@/lib/component-registry";
import { VesselControls } from "@/components/ui/VesselControls";
import { getCategoryDefaults } from "@/lib/controls/category-defaults";
import { ShowcaseChrome } from "@/components/showcase/ShowcaseChrome";
import { ShaderShowcaseLayout } from "@/components/showcase/ShaderShowcaseLayout";
import { ScrollShowcaseLayout } from "@/components/showcase/ScrollShowcaseLayout";
import { GalleryShowcaseLayout } from "@/components/showcase/GalleryShowcaseLayout";
import { TransitionShowcaseLayout } from "@/components/showcase/TransitionShowcaseLayout";

export default function ShowcasePageClient({ slug }: { slug: string }) {
  const { Component, meta } = getComponent(slug);
  const [controlsOpen, setControlsOpen] = useState(false);

  const categoryDefaults = useMemo(() => (meta ? getCategoryDefaults(meta.category) : []), [meta]);
  const componentControls = useMemo(() => meta?.controls || [], [meta]);

  const initialValues = useMemo(() => {
    const init: Record<string, number | boolean | string> = {};
    [...categoryDefaults, ...componentControls].forEach((ctrl) => {
      init[ctrl.key] = ctrl.default;
    });
    return init;
  }, [categoryDefaults, componentControls]);

  const [controlValues, setControlValues] = useState<Record<string, number | boolean | string>>(initialValues);

  const handleControlChange = (key: string, value: number | boolean | string) => {
    if (slug === "apparatus-depth-swim" && key === "selectedVariant") {
      const presets: Record<string, Record<string, number>> = {
        tunnel: { depthRange: 1600, maxBlur: 18, cursorParallaxPower: 40, cardScale: 1.0, hoverTiltMax: 8, ambientOpacity: 0.35, ambientBlur: 5 },
        matrix: { depthRange: 700, maxBlur: 6, cursorParallaxPower: 55, cardScale: 1.05, hoverTiltMax: 14, ambientOpacity: 0.20, ambientBlur: 40 },
        cinematic: { depthRange: 2400, maxBlur: 32, cursorParallaxPower: 25, cardScale: 0.85, hoverTiltMax: 8, ambientOpacity: 0.60, ambientBlur: 110 },
        micro: { depthRange: 1300, maxBlur: 12, cursorParallaxPower: 30, cardScale: 0.65, hoverTiltMax: 6, ambientOpacity: 0.30, ambientBlur: 5 }
      };
      const presetDefaults = presets[value as string] || presets.tunnel;
      setControlValues((prev) => ({ ...prev, selectedVariant: value, ...presetDefaults }));
      return;
    }
    setControlValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setControlValues(initialValues);
  };

  if (!meta || !Component) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070708] font-sans text-sm text-neutral-400">
        Component Not Found
      </div>
    );
  }

  const defaultImageSrc = meta.filename
    ? meta.filename.startsWith("http") || meta.filename.startsWith("/")
      ? meta.filename
      : `/images/components images/${meta.filename}`
    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  // Self-contained scroll components handle their own wheel events internally
  // and don't consume the scrollProgress prop from ScrollShowcaseLayout.
  // Route them to GalleryShowcaseLayout to avoid black-screen scroll conflicts.
  const SELF_CONTAINED_SCROLL = new Set([
    "apparatus-dual-wave",
    "apparatus-phase-drift",
    "apparatus-depth-swim",
    "apparatus-cylinder-scroll",
    "apparatus-layout-morph",
  ]);
  const isSelfContainedScroll = SELF_CONTAINED_SCROLL.has(slug);

  // Select Layout Strategy
  const isGallery = isSelfContainedScroll || meta.category === "gallary" || (meta.category !== "scroll" && (meta.subtype === "gallery" || meta.subtype === "ring"));
  const previewType = meta.previewType || (meta.category === "scroll" ? "scroll" : "shader");
  const isScroll = !isGallery && (previewType === "scroll" || meta.category === "scroll");
  const isTransition = meta.category === "transition" || previewType === "transition";

  const renderComponent = () => {
    return <Component imageSrc={defaultImageSrc} {...controlValues} />;
  };

  const renderLayout = () => {
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
    <ShowcaseChrome
      component={meta}
      onToggleControls={() => setControlsOpen(!controlsOpen)}
      controlsOpen={controlsOpen}
    >
      {renderLayout()}

      <AnimatePresence>
        {controlsOpen && (
          <VesselControls
            categoryDefaults={categoryDefaults}
            componentControls={componentControls}
            values={controlValues}
            onChange={handleControlChange}
            onReset={handleReset}
            onClose={() => setControlsOpen(false)}
          />
        )}
      </AnimatePresence>
    </ShowcaseChrome>
  );
}
