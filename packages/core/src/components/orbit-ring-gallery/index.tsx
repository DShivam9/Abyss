"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrbitRingGalleryProps, OrbitRingItem } from "./types";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

gsap.registerPlugin(ScrollTrigger);

const RingItem = ({
  item,
}: {
  item: OrbitRingItem;
  index: number;
  total: number;
  radius: number;
  active: boolean;
}) => {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const cleanUrl = typeof item.image === "string" ? decodeURIComponent(item.image) : item.image;
    loader.load(cleanUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      texture.current = tex;
      if (materialRef.current) {
        materialRef.current.map = tex;
        materialRef.current.needsUpdate = true;
      }
    });
  }, [item.image]);

  return (
    <mesh>
      <planeGeometry args={[1.5, 2.25, 16, 16]} />
      <meshBasicMaterial 
        ref={materialRef} 
        transparent={true}
        opacity={1}
        side={THREE.DoubleSide} 
        color={0xffffff}
      />
    </mesh>
  );
};

const RingGroup = ({ 
  items, 
  radius, 
  tilt = 0.3,
  initialRotation, 
  onActiveIndexChange, 
  cascadeEnabled, 
  swingEnabled,
  scrollSpeed,
  dragSpeed,
  damping
}: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const rotationRef = useRef(initialRotation);
  const targetRotationRef = useRef(initialRotation);
  const activeIndexRef = useRef(0);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);

  // Maintain refs of state values to avoid stale closures in event listeners without re-registering
  const scrollSpeedRef = useRef(scrollSpeed);
  const dragSpeedRef = useRef(dragSpeed);

  // Idle tracking refs using wall-clock ms timestamp for absolute reliability
  const lastInteractionRef = useRef(Date.now() - 5000); // Start as idle

  useEffect(() => {
    onActiveIndexChangeRef.current = onActiveIndexChange;
  }, [onActiveIndexChange]);

  useEffect(() => {
    scrollSpeedRef.current = scrollSpeed;
  }, [scrollSpeed]);

  useEffect(() => {
    dragSpeedRef.current = dragSpeed;
  }, [dragSpeed]);

  useEffect(() => {
    if (!groupRef.current) return;
    
    // Reset rotations to match the starting rotation
    targetRotationRef.current = initialRotation;
    rotationRef.current = initialRotation;
    
    // Instead of pinning (which breaks the gallery container), we listen to wheel events locally.
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      lastInteractionRef.current = Date.now();
      // Balanced wheel speed for buttery and responsive scrolling
      const scrollDelta = Math.max(-120, Math.min(120, e.deltaY)) * scrollSpeedRef.current;
      targetRotationRef.current += scrollDelta;
    };

    let isDragging = false;
    let startX = 0;
    let initialTargetRotation = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      initialTargetRotation = targetRotationRef.current;
      lastInteractionRef.current = Date.now();
      if (container) {
        container.style.cursor = 'grabbing';
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      lastInteractionRef.current = Date.now();
      const deltaX = e.clientX - startX;
      const width = container ? container.clientWidth : window.innerWidth;
      // Controlled tactile drag multiplier
      const rotationDelta = -(deltaX / width) * Math.PI * dragSpeedRef.current;
      targetRotationRef.current = initialTargetRotation + rotationDelta;
    };

    const handlePointerUp = () => {
      isDragging = false;
      lastInteractionRef.current = Date.now();
      if (container) {
        container.style.cursor = 'grab';
      }
    };
    
    const container = document.getElementById('orbit-gallery-container');
    if (container) {
      container.style.cursor = 'grab';
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [initialRotation]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Clamp delta-time to avoid lag-spikes breaking the spring math
    const dt = Math.min(delta, 0.1);

    // Delta-corrected exponential decay damp helper
    const damp = (current: number, target: number, lambda: number, dt: number) => {
      return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
    };

    // Calculate dynamic idle intensity. Fades in smoothly after 1.5 seconds of inactivity.
    const isIdle = (Date.now() - lastInteractionRef.current) > 1500;

    // Apply a very subtle, slow auto-rotation to the target rotation when idle
    const autoRotationSpeed = 0.08; // radians per second (extremely slow and majestic)
    if (isIdle) {
      targetRotationRef.current += autoRotationSpeed * dt;
    }

  groupRef.current.rotation.x = typeof tilt === "number" ? tilt : 0;
    groupRef.current.rotation.z = 0;
    groupRef.current.rotation.y = 0;

    const total = items.length;

    // Snappy but smooth inertial glide
    rotationRef.current = damp(rotationRef.current, targetRotationRef.current, damping, dt);
    const velocity = targetRotationRef.current - rotationRef.current;
    const speed = Math.abs(velocity);

    // Position and orient children individually based on their base angles
    groupRef.current.children.forEach((child, index) => {
       const theta = (index / total) * Math.PI * 2;
       
       // Spacing Ripple (Flow Cascade):
       // When cascadeEnabled is true, spacing stretches dynamically based on velocity.
       // By default (false), spacing is locked as a perfect circle.
       const angleOffset = cascadeEnabled ? Math.sin(theta) * velocity * 0.25 : 0;
       const angle = theta + rotationRef.current + angleOffset;
       
       child.position.x = Math.sin(angle) * radius;
       child.position.z = Math.cos(angle) * radius;
       child.position.y = 0;

       // Orient the card based on toggles
       let targetRotationY = angle;
       let targetOpacity = 1.0;

       if (swingEnabled) {
         // The card visible in the center (either front or back) is active and swings flat.
         // We check Math.abs(cosVal) which is 1.0 when a card is in the center-front or center-back.
         const cosVal = Math.cos(angle);
         const focusWeight = Math.pow(Math.abs(cosVal), 4);
         
         // Swing card flat (0 rotation) to face the camera directly when centered
         targetRotationY = THREE.MathUtils.lerp(angle, 0, focusWeight);
         targetOpacity = 1.0; // Keep all cards fully opaque, never faded!
       } else if (cascadeEnabled) {
         // Local card leaning/tilt is locked behind the cascadeEnabled toggle.
         const localTilt = velocity * 0.15;
         targetRotationY = angle - localTilt;
       }

       // Reset pitch/roll rotations to keep cards perfectly vertical
       child.rotation.x = 0;
       child.rotation.z = 0;
       child.rotation.y = targetRotationY;

       // Apply dynamic opacity for non-linear spotlight focus using frame-rate independent damp
        const mesh = child as any;
        if (mesh.material) {
          const currentOp = typeof mesh.material.opacity === "number" && !isNaN(mesh.material.opacity) ? mesh.material.opacity : 1;
          mesh.material.opacity = damp(currentOp, targetOpacity, 4.0, dt);
        }
     });

    // Camera leaning (roll/pan/zoom) is always active - delta-corrected dampings
    const targetCameraRoll = -velocity * 0.1; 
    state.camera.rotation.z = damp(state.camera.rotation.z, targetCameraRoll, 2.2, dt);

    const targetCameraX = velocity * 0.5;
    state.camera.position.x = damp(state.camera.position.x, targetCameraX, 2.2, dt);

    const targetCameraY = 0.3;
    state.camera.position.y = damp(state.camera.position.y, targetCameraY, 2.2, dt);

    const targetCameraZ = 8.5 + speed * 1.0;
    state.camera.position.z = damp(state.camera.position.z, targetCameraZ, 2.2, dt);

    // Dynamic camera lookup alignment - tilted slightly up for better bottom spacing
    state.camera.lookAt(0, 0.2, 0);

    // Calculate active centered item mathematically based on rotation to prevent precision oscillations.
    // The active card is in the center-back of the circle (closest to z = -radius / cosVal = -1)
    let minCos = Infinity;
    let currentActive = 0;
    
    for (let i = 0; i < total; i++) {
       const theta = (i / total) * Math.PI * 2;
       const angle = theta + rotationRef.current;
       const cosVal = Math.cos(angle);
       if (cosVal < minCos) {
           minCos = cosVal;
           currentActive = i;
       }
    }

    if (currentActive !== activeIndexRef.current) {
       activeIndexRef.current = currentActive;
       setActiveIndex(currentActive);
       onActiveIndexChangeRef.current(currentActive);
    }
  });

  return (
    <group position={[0, 0.35, 0]}>
      {/* Cards Group */}
      <group ref={groupRef}>
        {items.map((item: any, i: number) => (
          <RingItem 
             key={item.id} 
             item={item} 
             index={i} 
             total={items.length} 
             radius={radius}
             active={i === activeIndex}
          />
        ))}
      </group>
    </group>
  );
};

const DEFAULT_ITEMS = [
  { id: "1", image: "/images/components images/Gallary/cosmos_1110264921.jpeg", title: "Cosmos Alpha", subtitle: "Sailing through the celestial dust of the Orion Arm." },
  { id: "2", image: "/images/components images/Gallary/cosmos_1309943729.jpeg", title: "Event Horizon", subtitle: "Where time slows down and light fades into the infinite." },
  { id: "3", image: "/images/components images/Gallary/cosmos_145253936.jpeg", title: "Stellar Nursery", subtitle: "Gases compressing under pressure to spark new solar systems." },
  { id: "4", image: "/images/components images/Gallary/cosmos_1578342658.jpeg", title: "Nebula Whispers", subtitle: "Cosmic filaments stretching across millions of light years." },
  { id: "5", image: "/images/components images/Gallary/cosmos_1724531036.jpeg", title: "Solar Winds", subtitle: "Charged streams dancing across planetary atmospheres." },
  { id: "6", image: "/images/components images/Gallary/cosmos_1948095192.jpeg", title: "Dark Matter", subtitle: "The invisible architecture holding galaxies in structural unison." },
  { id: "7", image: "/images/components images/Gallary/cosmos_854490082.jpeg", title: "Supernova Core", subtitle: "The violent birth of heavy elements in a dying star's heart." }
];

const ScrambledText = ({ text, duration = 12 }: { text: string; duration?: number }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let timerId: number;

    const tick = () => {
      frame++;
      const progress = Math.min(frame / duration, 1);
      const resolvedCount = Math.floor(progress * text.length);
      
      let scrambled = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          scrambled += " ";
        } else if (i < resolvedCount) {
          scrambled += text[i];
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayText(scrambled);

      if (frame < duration) {
        timerId = requestAnimationFrame(tick);
      } else {
        setDisplayText(text);
      }
    };

    timerId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(timerId);
    };
  }, [text, duration]);

  return <>{displayText}</>;
};

export const OrbitRingGallery: React.FC<OrbitRingGalleryProps & {
  tilt?: number;
  scrollSpeed?: number;
  dragSpeed?: number;
  damping?: number;
  cascadeEnabled?: boolean;
  swingEnabled?: boolean;
}> = ({
  items = DEFAULT_ITEMS,
  radius = 3.4,
  tilt = 0,
  className = "",
  initialRotation = 0,
  scrollSpeed = 0.0007,
  dragSpeed = 0.5,
  damping = 2.8,
  cascadeEnabled = false,
  swingEnabled = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div 
      id="orbit-gallery-container" 
      className={`w-full h-full min-h-[500px] relative overflow-hidden bg-[#050505] touch-none ${className}`}
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 0.3, 8.5], fov: 45 }} style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={1} />
          <RingGroup 
            items={items} 
            radius={radius} 
            tilt={tilt}
            initialRotation={initialRotation} 
            onActiveIndexChange={setActiveIndex} 
            cascadeEnabled={cascadeEnabled}
            swingEnabled={swingEnabled}
            scrollSpeed={scrollSpeed}
            dragSpeed={dragSpeed}
            damping={damping}
          />
        </Canvas>
      </div>

      {/* Centered Text Overlay sitting right below the ring orbit */}
      <div 
        className="absolute z-10 pointer-events-none px-6"
        style={{
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "576px", // 2xl is 672px, xl is 576px
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px"
        }}
      >
        <h2 
          className="text-white text-3xl md:text-4xl font-extrabold tracking-tight font-sans uppercase"
        >
          <ScrambledText text={items[activeIndex]?.title || ""} duration={12} />
        </h2>
        <p 
          className="text-white/50 text-xs md:text-sm font-medium font-sans max-w-sm leading-relaxed"
        >
          <ScrambledText text={items[activeIndex]?.subtitle || ""} duration={18} />
        </p>
      </div>
    </div>
  );
};

export default OrbitRingGallery;
