"use client";

import React, { useState, useMemo } from "react";
import { getComponent } from "@/lib/registry";
import { ShowcaseChrome } from "@/components/showcase/ShowcaseChrome";
import { ControlsDrawer } from "@/components/showcase/ControlsDrawer";
import { ShaderShowcaseLayout } from "@/components/showcase/ShaderShowcaseLayout";
import { ScrollShowcaseLayout } from "@/components/showcase/ScrollShowcaseLayout";
import { GalleryShowcaseLayout } from "@/components/showcase/GalleryShowcaseLayout";
import { TransitionShowcaseLayout } from "@/components/showcase/TransitionShowcaseLayout";
import { ComponentErrorBoundary } from "@/components/showcase/ComponentErrorBoundary";
import { GrainOverlay } from "@/components/shared/GrainOverlay";

export default function ShowcasePageClient({ slug }: { slug: string }) {
  const { Component, meta } = getComponent(slug);
  const [controlsOpen, setControlsOpen] = useState(false);

  const componentControls = useMemo(() => meta?.controls || [], [meta]);

  const initialValues = useMemo(() => {
    const init: Record<string, number | boolean | string> = {};
    componentControls.forEach((ctrl) => {
      init[ctrl.key] = ctrl.default;
    });
    return init;
  }, [componentControls]);

  const [controlValues, setControlValues] = useState<Record<string, number | boolean | string>>(initialValues);

  const handleControlChange = (key: string, value: number | boolean | string) => {
    setControlValues((prev) => ({ ...prev, [key]: value }));
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
      : meta.filename.startsWith("components/")
        ? `/images/${meta.filename}`
        : `/images/components images/${meta.filename}`
    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  // Self-contained scroll components handle their own wheel events internally
  const SELF_CONTAINED_SCROLL = new Set([
    "dual-wave",
    "depth-swim",
    "cylinder-scroll",
    "parallax-bleed",
    "curved-scroll-wipe",
    "erosion-map",
    "clip-morph"
  ]);

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
        <div className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-[#070708]">
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

  const handleReset = () => {
    const activeVariantKeys = ["wavePattern", "motionVariant", "selectedVariant", "layoutPattern", "variant", "pattern", "fontFamily"];
    const preservedVariants: Record<string, string | number | boolean> = {};
    activeVariantKeys.forEach((key) => {
      if (controlValues[key] !== undefined) {
        preservedVariants[key] = controlValues[key];
      }
    });
    setControlValues({ ...initialValues, ...preservedVariants });
  };

  return (
    <>
      <GrainOverlay />
      <ShowcaseChrome
        component={meta}
        onToggleControls={() => setControlsOpen((prev) => !prev)}
        controlsOpen={controlsOpen}
      >
        <ComponentErrorBoundary fallbackSlug={slug}>
          {renderLayout()}
        </ComponentErrorBoundary>

        <ControlsDrawer
          controls={componentControls}
          values={controlValues}
          onChange={handleControlChange}
          onReset={handleReset}
          isOpen={controlsOpen}
          onClose={() => setControlsOpen(false)}
        />
      </ShowcaseChrome>
    </>
  );
}
