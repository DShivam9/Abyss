"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import * as THREE from "three";

interface ImageNodeData {
  id: string;
  filename: string;
  label: string;
  slug: string;
  tab: "shaders" | "optics" | "tactile";
}

// 18 unique source images with category tags
const SOURCE_IMAGES: ImageNodeData[] = [
  { id: "01", filename: "@japparii instagram.jpg", label: "JAPPARII INTERCEPT", slug: "japparii", tab: "shaders" },
  { id: "02", filename: "Chromepunk Beast 🧊 #chromepunk #midjourney #aiart #real #nostalgia.jpg", label: "CHROMEPUNK BEAST", slug: "chromepunk-beast", tab: "shaders" },
  { id: "03", filename: "Gianni Gallant on Instagram_ “TANVI @tanvieverywhere”.jpg", label: "TANVI TANVI", slug: "tanvi", tab: "optics" },
  { id: "04", filename: "Glitch Streetwear _ Cyberpunk-Inspired Digital Art.jpg", label: "GLITCH STREETWEAR", slug: "glitch-streetwear", tab: "shaders" },
  { id: "05", filename: "Illustration Collection-一些插图集合 - 柴 霖霖.jpg", label: "CHAI COLLECTION", slug: "chai-collection", tab: "optics" },
  { id: "06", filename: "Instagram.jpg", label: "DIGITAL OVERLAY", slug: "instagram-overlay", tab: "optics" },
  { id: "07", filename: "Merlin Knights _ 4K Ultra.jpg", label: "MERLIN KNIGHTS", slug: "merlin-knights", tab: "optics" },
  { id: "08", filename: "Referência Fotografia Vermelha.jpg", label: "RED REFRACT", slug: "red-refract", tab: "optics" },
  { id: "09", filename: "Supreme Nike ACG Fleece Pullover.jpg", label: "ACG FLEECE", slug: "acg-fleece", tab: "tactile" },
  { id: "10", filename: "dee.jpg", label: "APPARATUS DEE", slug: "apparatus-dee", tab: "tactile" },
  { id: "11", filename: "download (1).jpg", label: "CORE SHELL A", slug: "core-shell-a", tab: "shaders" },
  { id: "12", filename: "download (2).jpg", label: "CORE SHELL B", slug: "core-shell-b", tab: "tactile" },
  { id: "13", filename: "download (3).jpg", label: "KINETIC PORTAL", slug: "kinetic-portal", tab: "shaders" },
  { id: "14", filename: "faf.jpg", label: "APPARATUS FAF", slug: "apparatus-faf", tab: "shaders" },
  { id: "15", filename: "gg.jpg", label: "APPARATUS GG", slug: "apparatus-gg", tab: "tactile" },
  { id: "16", filename: "hh.jpg", label: "APPARATUS HH", slug: "apparatus-hh", tab: "optics" },
  { id: "17", filename: "kl.jpg", label: "APPARATUS KL", slug: "apparatus-kl", tab: "tactile" },
  { id: "18", filename: "🔷 Chromium Queen — Rise of Singularity 🔷__#digitalart #futuristicart #chromeaesthetic #cyberpunkvibes #aiartcommunity #scifiillustration #techwearstyle #neofuturism #digitalfashion #singularityrising #femalewarri.jpg", label: "CHROMIUM QUEEN", slug: "chromium-queen", tab: "tactile" }
];

interface CollageNode {
  id: string;
  filename: string;
  label: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  slug: string;
}

// DRY reusable Swatch Item Card component passing tab state parameter
function SwatchItem({
  item,
  isHovered,
  activeTab,
  onMouseEnter,
  onMouseLeave
}: {
  item: ImageNodeData;
  isHovered: boolean;
  activeTab: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const router = useRouter();

  const getEncodedSrc = (filename: string) => {
    const encodedFilename = filename.replace(/#/g, "%23");
    return `/images/components images/${encodedFilename}`;
  };

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{
        flex: isHovered ? 4.5 : 1.0,
      }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className="relative overflow-hidden bg-[#e8e8ed] rounded-[4px] flex flex-col justify-end border-none shadow-none flex-grow h-full"
    >
      {/* Background Image Panel */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={getEncodedSrc(item.filename)}
          alt={item.label}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover select-none pointer-events-none group-hover:scale-103 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 opacity-70 group-hover:opacity-75 transition-opacity duration-500" />
      </div>

      {/* Collapsed Rotated Label */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.0 : 1.0,
          y: isHovered ? 20 : 0
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none"
      >
        <span 
          style={{ writingMode: "vertical-rl" }} 
          className="font-mono text-[9px] font-bold text-white uppercase tracking-[0.25em] rotate-180 select-none whitespace-nowrap"
        >
          [{item.id}] // {item.label}
        </span>
      </motion.div>

      {/* Expanded Content Card Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: isHovered ? 1.0 : 0.0,
          y: isHovered ? 0 : 30
        }}
        transition={{ type: "spring", stiffness: 150, damping: 18, delay: 0.05 }}
        className="relative z-10 p-6 flex flex-col gap-3.5 pointer-events-none select-none"
      >
        <span className="font-mono text-[8px] text-white/50 tracking-widest uppercase">
          NODE_0{item.id}
        </span>
        <h2 className="font-sans font-black text-2xl text-white tracking-tight leading-none uppercase">
          {item.label}
        </h2>
        <p className="font-mono text-[9px] text-[#a6a6ac] tracking-wider leading-relaxed max-w-[280px]">
          A custom interactive shader element designed for brutalist layouts and WebGL components.
        </p>
        
        <div className="flex gap-2 mt-1">
          <span className="font-mono text-[7px] border border-neutral-700 bg-neutral-900/60 px-2 py-0.5 text-neutral-300 uppercase">
            REACT
          </span>
          <span className="font-mono text-[7px] border border-neutral-700 bg-neutral-900/60 px-2 py-0.5 text-neutral-300 uppercase">
            THREE.JS
          </span>
        </div>

        <button 
          onClick={() => router.push(`/components/${item.slug}?mode=swatch&tab=${activeTab}`)}
          className="mt-3 w-fit px-4.5 py-2.5 font-mono text-[8px] uppercase tracking-[0.1em] bg-white hover:bg-neutral-100 text-black rounded-none pointer-events-auto cursor-pointer border-none shadow-md transition-all duration-300"
        >
          VIEW COMPONENT
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ComponentsCatalogPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // State controllers for views, active tab and hover layers
  const [viewMode, setViewMode] = useState<"canvas" | "swatch">("canvas");
  const [activeTab, setActiveTab] = useState<"all" | "tactile" | "shaders" | "optics">("all");
  const [hoveredSwatchIdx, setHoveredSwatchIdx] = useState<number | null>(null);

  // Sync viewMode and activeTab state with URL search parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const tab = params.get("tab");
      if (mode === "swatch" || mode === "canvas") {
        setViewMode(mode);
      }
      if (tab === "all" || tab === "tactile" || tab === "shaders" || tab === "optics") {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleViewModeChange = (mode: "canvas" | "swatch") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      if (mode === "canvas") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", activeTab);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleCategoryTabChange = (tab: "all" | "tactile" | "shaders" | "optics") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const getEncodedSrc = (filename: string) => {
    const encodedFilename = filename.replace(/#/g, "%23");
    return `/images/components images/${encodedFilename}`;
  };

  // WebGL Canvas Effect
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const textureLoader = new THREE.TextureLoader();

    // Map source photos into coordinate shapes
    const layoutNodes: CollageNode[] = [
      { id: "01", filename: SOURCE_IMAGES[0].filename, label: SOURCE_IMAGES[0].label, x: -580, y: 160, width: 280, depth: 320, slug: SOURCE_IMAGES[0].slug },
      { id: "02", filename: SOURCE_IMAGES[1].filename, label: SOURCE_IMAGES[1].label, x: -260, y: 220, width: 220, depth: 360, slug: SOURCE_IMAGES[1].slug },
      { id: "03", filename: SOURCE_IMAGES[2].filename, label: SOURCE_IMAGES[2].label, x: 20, y: 190, width: 260, depth: 300, slug: SOURCE_IMAGES[2].slug },
      { id: "04", filename: SOURCE_IMAGES[3].filename, label: SOURCE_IMAGES[3].label, x: 330, y: 260, width: 280, depth: 380, slug: SOURCE_IMAGES[3].slug },
      { id: "05", filename: SOURCE_IMAGES[4].filename, label: SOURCE_IMAGES[4].label, x: 670, y: 180, width: 240, depth: 320, slug: SOURCE_IMAGES[4].slug },
      { id: "06", filename: SOURCE_IMAGES[5].filename, label: SOURCE_IMAGES[5].label, x: -550, y: -220, width: 240, depth: 300, slug: SOURCE_IMAGES[5].slug },
      { id: "07", filename: SOURCE_IMAGES[6].filename, label: SOURCE_IMAGES[6].label, x: -220, y: -190, width: 280, depth: 340, slug: SOURCE_IMAGES[6].slug },
      { id: "08", filename: SOURCE_IMAGES[7].filename, label: SOURCE_IMAGES[7].label, x: 120, y: -240, width: 220, depth: 290, slug: SOURCE_IMAGES[7].slug },
      { id: "09", filename: SOURCE_IMAGES[8].filename, label: SOURCE_IMAGES[8].label, x: 420, y: -210, width: 300, depth: 390, slug: SOURCE_IMAGES[8].slug },
      { id: "10", filename: SOURCE_IMAGES[9].filename, label: SOURCE_IMAGES[9].label, x: -680, y: -580, width: 220, depth: 280, slug: SOURCE_IMAGES[9].slug },
      { id: "11", filename: SOURCE_IMAGES[10].filename, label: SOURCE_IMAGES[10].label, x: -400, y: -620, width: 260, depth: 340, slug: SOURCE_IMAGES[10].slug },
      { id: "12", filename: SOURCE_IMAGES[11].filename, label: SOURCE_IMAGES[11].label, x: -80, y: -590, width: 280, depth: 360, slug: SOURCE_IMAGES[11].slug },
      { id: "13", filename: SOURCE_IMAGES[12].filename, label: SOURCE_IMAGES[12].label, x: 260, y: -630, width: 240, depth: 310, slug: SOURCE_IMAGES[12].slug },
      { id: "14", filename: SOURCE_IMAGES[13].filename, label: SOURCE_IMAGES[13].label, x: 560, y: -570, width: 220, depth: 300, slug: SOURCE_IMAGES[13].slug },
      { id: "15", filename: SOURCE_IMAGES[14].filename, label: SOURCE_IMAGES[14].label, x: -520, y: -980, width: 260, depth: 340, slug: SOURCE_IMAGES[14].slug },
      { id: "16", filename: SOURCE_IMAGES[15].filename, label: SOURCE_IMAGES[15].label, x: -180, y: -960, width: 240, depth: 310, slug: SOURCE_IMAGES[15].slug },
      { id: "17", filename: SOURCE_IMAGES[16].filename, label: SOURCE_IMAGES[16].label, x: 120, y: -1020, width: 280, depth: 370, slug: SOURCE_IMAGES[16].slug },
      { id: "18", filename: SOURCE_IMAGES[17].filename, label: SOURCE_IMAGES[17].label, x: 480, y: -990, width: 300, depth: 400, slug: SOURCE_IMAGES[17].slug }
    ];

    const gridGeometry = new THREE.BufferGeometry();
    const gridVertices = [];
    const step = 45;
    for (let x = -3000; x <= 3000; x += step) {
      gridVertices.push(x, -3000, 0, x, 3000, 0);
    }
    for (let y = -3000; y <= 3000; y += step) {
      gridVertices.push(-3000, y, 0, 3000, y, 0);
    }
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridVertices, 3));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0xeaeaea,
      transparent: true,
      opacity: 0.85
    });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(gridLines);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D tMap;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tMap, vUv);
        gl_FragColor = vec4(color.rgb, color.a * uOpacity);
      }
    `;

    interface MeshItem {
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      data: CollageNode;
    }

    const meshItems: MeshItem[] = [];

    layoutNodes.forEach((node) => {
      const geometry = new THREE.PlaneGeometry(node.width, node.depth);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          tMap: { value: null },
          uOpacity: { value: 0.0 }
        },
        vertexShader,
        fragmentShader,
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, node.y, 0);
      scene.add(mesh);
      meshItems.push({ mesh, material, data: node });

      textureLoader.load(getEncodedSrc(node.filename), (texture) => {
        material.uniforms.tMap.value = texture;
        let fadeVal = 0.0;
        const fadeIn = () => {
          fadeVal += 0.05;
          material.uniforms.uOpacity.value = fadeVal;
          if (fadeVal < 1.0) {
            requestAnimationFrame(fadeIn);
          } else {
            material.uniforms.uOpacity.value = 1.0;
          }
        };
        fadeIn();
      });
    });

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let dragMoveOffset = 0;

    const mouse = new THREE.Vector2(-9999, -9999);
    const raycaster = new THREE.Raycaster();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetX += e.deltaX;
      targetY -= e.deltaY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      dragMoveOffset = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        
        targetX -= dx;
        targetY += dy;

        dragMoveOffset += Math.abs(dx) + Math.abs(dy);

        startMouseX = e.clientX;
        startMouseY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = () => {
      if (dragMoveOffset > 5) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshItems.map(i => i.mesh));

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const clickedItem = meshItems.find(i => i.mesh === clickedMesh);
        if (clickedItem) {
          router.push(`/components/${clickedItem.data.slug}?mode=canvas`);
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("click", handleClick);

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;

      camera.left = width / -2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = height / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const dragDamping = 0.085;
      currentX = THREE.MathUtils.lerp(currentX, targetX, dragDamping);
      currentY = THREE.MathUtils.lerp(currentY, targetY, dragDamping);

      camera.position.x = currentX;
      camera.position.y = currentY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);

      meshItems.forEach((item) => {
        item.mesh.geometry.dispose();
        item.material.dispose();
      });
      gridGeometry.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, [router]);

  // Dynamically filter swatches list based on selected category tab
  const filteredSwatches = activeTab === "all"
    ? SOURCE_IMAGES
    : SOURCE_IMAGES.filter((item) => item.tab === activeTab);

  return (
    <div className="w-full h-[100vh] flex flex-col bg-[#ffffff] overflow-hidden select-none">
      
      {/* 1. Brutally Minimal Typographic Header */}
      <header className="w-full px-12 pt-8 pb-5 flex justify-between items-end bg-[#ffffff] shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans font-black text-2xl tracking-tight text-[#111113]">
            VESSEL // COMPONENTS
          </h1>
          <span className="font-mono text-[9px] text-[#55555c] tracking-wider uppercase leading-none">
            An open-source React component library for immersive, physics-driven image interactions.
          </span>
        </div>

        {/* Text-Link Selector */}
        <div className="flex items-center gap-4 font-mono text-[9px] tracking-widest select-none">
          <button
            onClick={() => handleViewModeChange("canvas")}
            className={`cursor-pointer transition-colors ${
              viewMode === "canvas" ? "text-[#111113] font-bold" : "text-[#a6a6ac] hover:text-[#111113]"
            }`}
          >
            PLAYGROUND
          </button>
          <span className="text-[#a6a6ac]/30">/</span>
          <button
            onClick={() => handleViewModeChange("swatch")}
            className={`cursor-pointer transition-colors ${
              viewMode === "swatch" ? "text-[#111113] font-bold" : "text-[#a6a6ac] hover:text-[#111113]"
            }`}
          >
            SWATCH
          </button>
        </div>
      </header>

      {/* 2. Bounded Gallery Container Workspace */}
      <main className="flex-grow w-full relative px-12 py-4 flex flex-col gap-3">
        
        {/* Swatch Categories Selector bar */}
        {viewMode === "swatch" && (
          <div className="flex gap-6 font-mono text-[9px] tracking-widest text-[#a6a6ac] select-none h-6 items-center">
            <span className="text-[#111113] font-bold">FILTER //</span>
            {(["all", "tactile", "shaders", "optics"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  handleCategoryTabChange(t);
                  setHoveredSwatchIdx(null);
                }}
                className={`cursor-pointer transition-colors ${
                  activeTab === t ? "text-[#111113] font-bold" : "hover:text-[#111113]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-grow w-full h-[62vh] min-h-[460px] max-h-[640px] rounded-[4px] overflow-hidden bg-[#f9f9f9]">
          
          {/* Mode A: WebGL Three.js Canvas */}
          <div 
            ref={containerRef}
            className={`absolute inset-0 w-full h-full ${viewMode === "canvas" ? "block" : "hidden"}`}
            style={{ cursor: "grab" }}
          >
            <canvas ref={canvasRef} className="block w-full h-full" />
          </div>

          {/* Mode B: Elastic Swatch Accordion (Spacious Dual-Row and Single-Row views) */}
          {viewMode === "swatch" && (
            <div className="absolute inset-0 w-full h-full flex flex-col p-6 gap-3 select-none bg-[#f9f9f9] overflow-hidden">
              {activeTab === "all" ? (
                // Dual-Row Spacious Accordion (Row 1: 01-09, Row 2: 10-18)
                <div className="w-full h-full flex flex-col gap-3">
                  {/* Row 1 */}
                  <div className="flex-1 flex gap-3 items-stretch min-h-[190px]">
                    {filteredSwatches.slice(0, 9).map((item, idx) => {
                      const isHovered = hoveredSwatchIdx === idx;
                      return (
                        <SwatchItem
                          key={item.id}
                          item={item}
                          isHovered={isHovered}
                          activeTab={activeTab}
                          onMouseEnter={() => setHoveredSwatchIdx(idx)}
                          onMouseLeave={() => setHoveredSwatchIdx(null)}
                        />
                      );
                    })}
                  </div>
                  {/* Row 2 */}
                  <div className="flex-1 flex gap-3 items-stretch min-h-[190px]">
                    {filteredSwatches.slice(9, 18).map((item, idx) => {
                      const realIdx = idx + 9;
                      const isHovered = hoveredSwatchIdx === realIdx;
                      return (
                        <SwatchItem
                          key={item.id}
                          item={item}
                          isHovered={isHovered}
                          activeTab={activeTab}
                          onMouseEnter={() => setHoveredSwatchIdx(realIdx)}
                          onMouseLeave={() => setHoveredSwatchIdx(null)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Single-Row Spacious Filtered Accordion (Exactly 6 items per row)
                <div className="w-full h-full flex gap-3 items-stretch">
                  {filteredSwatches.map((item, idx) => {
                    const isHovered = hoveredSwatchIdx === idx;
                    return (
                      <SwatchItem
                        key={item.id}
                        item={item}
                        isHovered={isHovered}
                        activeTab={activeTab}
                        onMouseEnter={() => setHoveredSwatchIdx(idx)}
                        onMouseLeave={() => setHoveredSwatchIdx(null)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 3. Brutally Minimal Editorial Footer */}
      <footer className="w-full px-12 py-5 bg-[#ffffff] shrink-0 font-mono text-[9px] text-[#a6a6ac] flex justify-between items-center select-none">
        <span>© 2026 VESSEL</span>
        <span>MIT LICENSED</span>
      </footer>
    </div>
  );
}
