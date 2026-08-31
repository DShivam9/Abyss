"use client";

import React, { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { getComponent, getLayoutType } from "@/lib/registry";
import { ShowcaseChrome } from "@/components/showcase/ShowcaseChrome";
import { ControlsDrawer } from "@/components/showcase/ControlsDrawer";
import { ShaderShowcaseLayout } from "@/components/showcase/layouts/ShaderShowcaseLayout";
import { ScrollShowcaseLayout } from "@/components/showcase/layouts/ScrollShowcaseLayout";
import { GalleryShowcaseLayout } from "@/components/showcase/layouts/GalleryShowcaseLayout";
import { TransitionShowcaseLayout } from "@/components/showcase/layouts/TransitionShowcaseLayout";
import { ComponentErrorBoundary } from "@/components/showcase/ComponentErrorBoundary";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import "@/components/showcase/showcase.css";

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

  const handleReset = () => {
    setControlValues(initialValues);
  };

  if (!meta || !Component) {
    notFound();
  }

  const defaultImageSrc = meta.filename
    ? meta.filename.startsWith("http") || meta.filename.startsWith("/")
      ? meta.filename
      : meta.filename.startsWith("components/")
        ? `/images/${meta.filename}`
        : `/images/components images/${meta.filename}`
    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  const { isSelfContainedScroll, isText, isScroll, isGallery, isTransition } = getLayoutType(meta, slug);

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
