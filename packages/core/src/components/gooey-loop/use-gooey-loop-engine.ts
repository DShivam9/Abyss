import { useEffect } from "react";
import Lenis from "lenis";
import { useLatestRef } from "../../hooks";
import type { AbyssComponentProps } from "../../engine/types";
import type { CardController, PlateItem } from "./types";
import {
  PITCH,
  INTRO_GLIDE_DURATION,
  LAMBDA_PARALLAX,
  LAMBDA_LENS_APPROACH,
  LAMBDA_LENS_LEAVE,
  LAMBDA_VELOCITY,
  LAMBDA_HEAD,
  LAMBDA_CORE,
  LAMBDA_TAIL,
  LAMBDA_BLUR,
  LAMBDA_BLUR_FADE,
  LAMBDA_DRIP_IN,
  LAMBDA_DRIP_OUT
} from "./constants";

interface EngineParams {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  uiTopRef: React.RefObject<HTMLElement | null>;
  uiBottomRef: React.RefObject<HTMLElement | null>;
  plates: PlateItem[];
  scrollSpeed: number;
  parallaxIntensity: number;
  autoDrift?: boolean;
  autoDriftSpeed?: number;
  onLifecycleChange?: AbyssComponentProps["onLifecycleChange"];
}

export function useGooeyLoopEngine({
  wrapperRef,
  containerRef,
  trackRef,
  uiTopRef,
  uiBottomRef,
  plates,
  scrollSpeed,
  parallaxIntensity,
  autoDrift = true,
  autoDriftSpeed = 55,
  onLifecycleChange
}: EngineParams) {
  const scrollSpeedRef = useLatestRef(scrollSpeed);
  const parallaxIntensityRef = useLatestRef(parallaxIntensity);
  const autoDriftRef = useLatestRef(autoDrift);
  const autoDriftSpeedRef = useLatestRef(autoDriftSpeed);
  const onLifecycleChangeRef = useLatestRef(onLifecycleChange);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !wrapperRef.current ||
      !containerRef.current ||
      !trackRef.current
    ) {
      return;
    }

    onLifecycleChangeRef.current?.("discovery");

    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    const track = trackRef.current;
    const cycleWidth = plates.length * PITCH;

    // Viewport geometry cache (zero layout reflows during RAF)
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let cardTop = (windowHeight - 720) * 0.5;
    let cardBottom = cardTop + 720;

    const handleResize = () => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      cardTop = (windowHeight - 720) * 0.5;
      cardBottom = cardTop + 720;
    };
    window.addEventListener("resize", handleResize);

    const introStartX = windowWidth + 60;
    wrapper.style.setProperty("--bg-canvas", "#faf9f7");
    wrapper.style.backgroundColor = "#faf9f7";

    // Track controllers across all 3 sets
    const cardElements = Array.from(track.children) as HTMLDivElement[];
    const allControllers: CardController[] = cardElements.map((card, index) => {
      const cardIdx = index % plates.length;
      const item = plates[cardIdx];
      return {
        card,
        cardIdx,
        parallaxLayer: card.querySelector<SVGGElement>(".parallaxLayer, g[mask] > g")!,
        mouseParallaxX: 0,
        mouseParallaxY: 0,
        topRect: card.querySelector<SVGRectElement>(".m-top")!,
        botRect: card.querySelector<SVGRectElement>(".m-bot")!,
        textEl: card.querySelector<SVGTextElement>(".m-txt")!,
        tendrils: Array.from(card.querySelectorAll<SVGEllipseElement>(".m-t")),
        blurEl: card.querySelector<SVGFEGaussianBlurElement>(".m-blur")!,
        maskGroup: card.querySelector<SVGGElement>(".m-group")!,
        lensHead: card.querySelector<SVGCircleElement>(".m-lens-head")!,
        lensCore: card.querySelector<SVGCircleElement>(".m-lens-core")!,
        lensTail: card.querySelector<SVGCircleElement>(".m-lens-tail")!,
        lensRadius: 0,
        currentBlur: 0,
        headX: 220,
        headY: item.yMid,
        coreX: 220,
        coreY: item.yMid,
        tailX: 220,
        tailY: item.yMid,
        lastX: 220,
        lastY: item.yMid,
        vx: 0,
        vy: 0,
        wobblePhase: Math.random() * Math.PI * 2,
        wasLensActive: false,
        drips: Array.from(card.querySelectorAll<SVGCircleElement>(".m-drip")),
        dripProgress: 0,
        dripTimer: Math.random() * 10,
        dripEdgeY: item.yTop > 0 ? item.yTop : item.yBottom,
        yTop: item.yTop,
        yBottom: item.yBottom,
        yMid: item.yMid
      };
    });

    // Cursor tracking
    let mouseScreenX = -9999;
    let mouseScreenY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseScreenX = e.clientX;
      mouseScreenY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseScreenX = -9999;
      mouseScreenY = -9999;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Interaction states
    let isIntroActive = true;
    let introStartTime: number | null = null;
    let uiRevealed = false;
    let currentX = introStartX;
    let targetX = 0;
    let isDragging = false;
    let startX = 0;
    let dragStartX = 0;
    let autoDriftWeight = 0.0;
    let lastUserInteractionTime = 0;

    // Lenis Smooth Virtual Scroll
    const lenis = new Lenis({
      lerp: 0.03,
      wheelMultiplier: 1.0,
      smoothWheel: true,
      autoRaf: false
    });

    lenis.on("virtual-scroll", (e: { deltaX: number; deltaY: number }) => {
      if (isIntroActive || isDragging) return;
      lastUserInteractionTime = performance.now();
      autoDriftWeight = 0;
      const delta =
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
        scrollSpeedRef.current;
      targetX -= delta;
    });

    // Drag interaction listeners
    const handleMouseDown = (e: MouseEvent) => {
      if (isIntroActive) return;
      isDragging = true;
      lastUserInteractionTime = performance.now();
      autoDriftWeight = 0;
      startX = e.clientX;
      dragStartX = currentX;
      targetX = currentX;
    };
    const handleDragMove = (e: MouseEvent) => {
      if (isIntroActive || !isDragging) return;
      lastUserInteractionTime = performance.now();
      targetX = dragStartX + (e.clientX - startX);
    };
    const handleMouseUp = () => {
      if (isDragging) {
        lastUserInteractionTime = performance.now();
      }
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isIntroActive || e.touches.length === 0) return;
      isDragging = true;
      lastUserInteractionTime = performance.now();
      autoDriftWeight = 0;
      startX = e.touches[0].clientX;
      dragStartX = currentX;
      targetX = currentX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isIntroActive || !isDragging || e.touches.length === 0) return;
      lastUserInteractionTime = performance.now();
      targetX = dragStartX + (e.touches[0].clientX - startX);
    };
    const handleTouchEnd = () => {
      if (isDragging) {
        lastUserInteractionTime = performance.now();
      }
      isDragging = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Delta-time animation loop
    let lastTime = performance.now();
    let lastRenderedX: number | null = null;
    let animId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      lenis.raf(time);

      if (introStartTime === null) {
        introStartTime = time;
      }

      if (isIntroActive) {
        const elapsed = time - introStartTime;
        const glideProgress = Math.min(1.0, elapsed / INTRO_GLIDE_DURATION);

        // Heavy luxury deceleration: quintic ease-out brings train smoothly to rest
        const ease = 1.0 - Math.pow(1.0 - glideProgress, 4.4);
        currentX = introStartX * (1.0 - ease);
        targetX = currentX;



        if (elapsed > 2400 && !uiRevealed) {
          uiRevealed = true;
          if (uiTopRef.current) {
            uiTopRef.current.classList.add("visible");
            uiTopRef.current.setAttribute("data-visible", "true");
            uiTopRef.current.style.opacity = "1";
          }
          if (uiBottomRef.current) {
            uiBottomRef.current.classList.add("visible");
            uiBottomRef.current.setAttribute("data-visible", "true");
            uiBottomRef.current.style.opacity = "1";
          }
        }

        // Option 2: The Molten Rupture (Cascading Organic Reveal)
        if (elapsed >= 650) {
          for (let i = 0; i < allControllers.length; i++) {
            const ctrl = allControllers[i];
            const cardStart = 650 + ctrl.cardIdx * 110;
            const cardDuration = 1150;
            const p = Math.max(0, Math.min(1.0, (elapsed - cardStart) / cardDuration));

            if (p > 0) {
              if (p <= 0.32) {
                // Phase 1: Emergence of Molten Word at yMid
                const emergeNorm = p / 0.32;
                ctrl.textEl.setAttribute("opacity", emergeNorm.toFixed(2));
                const targetBlur = 6.2 * emergeNorm;
                ctrl.blurEl.setAttribute("stdDeviation", targetBlur.toFixed(1));

                const rx = (15 * emergeNorm).toFixed(1);
                const ry = (9 * emergeNorm).toFixed(1);
                ctrl.tendrils.forEach((t) => {
                  t.setAttribute("rx", rx);
                  t.setAttribute("ry", ry);
                });

                ctrl.topRect.setAttribute("height", "0");
                ctrl.botRect.setAttribute("y", "720");
                ctrl.botRect.setAttribute("height", "0");
              } else if (p <= 0.78) {
                // Phase 2: Viscous Liquid Tear
                ctrl.textEl.setAttribute("opacity", "1");
                const tearNorm = (p - 0.32) / 0.46;
                const tearEase = 1.0 - Math.pow(1.0 - tearNorm, 2.6);

                const currentTopH = ctrl.yTop * tearEase;
                const currentBotY = 720 - (720 - ctrl.yBottom) * tearEase;
                const currentBotH = 720 - currentBotY;

                ctrl.topRect.setAttribute("height", currentTopH.toFixed(1));
                ctrl.botRect.setAttribute("y", currentBotY.toFixed(1));
                ctrl.botRect.setAttribute("height", currentBotH.toFixed(1));

                const stretch = 1.0 - Math.pow(tearNorm, 1.4);
                const tendrilRx = Math.max(0, 16 * stretch).toFixed(1);
                const tendrilRy = Math.max(0, 26 * stretch).toFixed(1);
                ctrl.tendrils.forEach((t) => {
                  t.setAttribute("rx", tendrilRx);
                  t.setAttribute("ry", tendrilRy);
                });

                ctrl.blurEl.setAttribute("stdDeviation", "6.2");
              } else {
                // Phase 3: Snap & Crystallize into crisp typography
                ctrl.textEl.setAttribute("opacity", "1");
                const snapNorm = (p - 0.78) / 0.22;

                ctrl.topRect.setAttribute("height", ctrl.yTop.toString());
                ctrl.botRect.setAttribute("y", ctrl.yBottom.toString());
                ctrl.botRect.setAttribute("height", (720 - ctrl.yBottom).toString());

                ctrl.tendrils.forEach((t) => {
                  t.setAttribute("rx", "0");
                  t.setAttribute("ry", "0");
                });

                const remainingBlur = 6.2 * (1.0 - Math.pow(snapNorm, 2.0));
                ctrl.blurEl.setAttribute("stdDeviation", Math.max(0, remainingBlur).toFixed(2));
              }
            }
          }
        }

        // Conclude intro
        if (elapsed >= INTRO_GLIDE_DURATION) {
          isIntroActive = false;
          allControllers.forEach((ctrl) => {
            ctrl.textEl.setAttribute("opacity", "1");
            ctrl.topRect.setAttribute("height", ctrl.yTop.toString());
            ctrl.botRect.setAttribute("y", ctrl.yBottom.toString());
            ctrl.botRect.setAttribute("height", (720 - ctrl.yBottom).toString());
            ctrl.tendrils.forEach((t) => {
              t.setAttribute("rx", "0");
              t.setAttribute("ry", "0");
            });
            ctrl.blurEl.setAttribute("stdDeviation", "0");
            ctrl.currentBlur = 0;
            ctrl.lensRadius = 0;
            ctrl.dripProgress = 0;
            ctrl.drips.forEach((d) => d.setAttribute("r", "0"));
          });

          currentX -= cycleWidth;
          targetX = currentX;
          dragStartX = currentX;

          wrapper.style.setProperty("--bg-canvas", "#faf9f7");
          wrapper.style.backgroundColor = "#faf9f7";

          if (!uiRevealed) {
            uiRevealed = true;
            if (uiTopRef.current) {
              uiTopRef.current.classList.add("visible");
              uiTopRef.current.setAttribute("data-visible", "true");
              uiTopRef.current.style.opacity = "1";
            }
            if (uiBottomRef.current) {
              uiBottomRef.current.classList.add("visible");
              uiBottomRef.current.setAttribute("data-visible", "true");
              uiBottomRef.current.style.opacity = "1";
            }
          }
        }
      } else {
        // Auto-drift: autonomous right-to-left glide when user is idle
        if (autoDriftRef.current) {
          const isUserInteracting =
            isDragging || time - lastUserInteractionTime < 800;
          if (isUserInteracting) {
            autoDriftWeight = 0.0;
          } else {
            // Seamlessly and gently ramp back up once user leaves the scroll
            autoDriftWeight +=
              (1.0 - autoDriftWeight) * (1.0 - Math.exp(-2.2 * dt));
          }

          if (!isDragging && autoDriftWeight > 0.001) {
            targetX -= autoDriftSpeedRef.current * dt * autoDriftWeight;
          }
        } else {
          autoDriftWeight = 0.0;
        }

        const dist = targetX - currentX;
        const absDist = Math.abs(dist);

        if (absDist < 0.04 && !isDragging) {
          currentX = targetX;
        } else {
          const decaySpeed = 3.0; // 0.03 * 100
          const lerpFactor = 1.0 - Math.exp(-decaySpeed * dt);
          const ease =
            absDist < 0.8
              ? Math.min(1.0, lerpFactor * (1.0 + (0.8 - absDist) * 1.5))
              : lerpFactor;
          currentX += dist * ease;
        }

        // Seamless infinite loop wrap
        if (currentX < -cycleWidth * 2) {
          currentX += cycleWidth;
          targetX += cycleWidth;
          dragStartX += cycleWidth;
        } else if (currentX > -cycleWidth) {
          currentX -= cycleWidth;
          targetX -= cycleWidth;
          dragStartX -= cycleWidth;
        }
      }

      // Quantize to 0.1px to eliminate fractional jitter
      const roundedX = Math.round(currentX * 10) / 10;
      if (roundedX !== lastRenderedX) {
        lastRenderedX = roundedX;
        track.style.transform = `translate3d(${roundedX}px, 0, 0)`;
      }

      // Viewport geometry & centers
      const screenCenter = windowWidth * 0.5;
      const screenCenterY = windowHeight * 0.5;
      const visibleRange = windowWidth * 0.95;

      // Delta-time decay factors
      const parallaxDecay = 1.0 - Math.exp(-LAMBDA_PARALLAX * dt);
      const lensApproachDecay = 1.0 - Math.exp(-LAMBDA_LENS_APPROACH * dt);
      const lensLeaveDecay = 1.0 - Math.exp(-LAMBDA_LENS_LEAVE * dt);
      const velBlend = 1.0 - Math.exp(-LAMBDA_VELOCITY * dt);
      const headDecay = 1.0 - Math.exp(-LAMBDA_HEAD * dt);
      const coreDecay = 1.0 - Math.exp(-LAMBDA_CORE * dt);
      const tailDecay = 1.0 - Math.exp(-LAMBDA_TAIL * dt);
      const blurDecay = 1.0 - Math.exp(-LAMBDA_BLUR * dt);
      const blurFadeDecay = 1.0 - Math.exp(-LAMBDA_BLUR_FADE * dt);
      const dripInDecay = 1.0 - Math.exp(-LAMBDA_DRIP_IN * dt);
      const dripOutDecay = 1.0 - Math.exp(-LAMBDA_DRIP_OUT * dt);

      // Global viewport mouse vector
      let globalNormX = 0;
      let globalNormY = 0;
      if (!isDragging && mouseScreenX > -500 && mouseScreenY > -500) {
        const rawNormX = (mouseScreenX - screenCenter) / screenCenter;
        const rawNormY = (mouseScreenY - screenCenterY) / screenCenterY;
        const clampedX = Math.max(-1.0, Math.min(1.0, rawNormX));
        const clampedY = Math.max(-1.0, Math.min(1.0, rawNormY));
        globalNormX = Math.sign(clampedX) * Math.pow(Math.abs(clampedX), 1.25);
        globalNormY = Math.sign(clampedY) * Math.pow(Math.abs(clampedY), 1.25);
      }

      // Single Unified Pass across cards (0 reflows)
      for (let i = 0; i < allControllers.length; i++) {
        const ctrl = allControllers[i];
        const cardLeft = 32 + i * 472 + currentX;
        const cardRight = cardLeft + 440;

        if (cardRight < -60 || cardLeft > windowWidth + 60) {
          continue;
        }

        const cardCenterX = cardLeft + 220;

        // 1. Interactive Fluid Seam Lens
        let targetRadius = 0;
        let lensTargetX = ctrl.coreX;
        let lensTargetY = ctrl.coreY;

        if (!isDragging && mouseScreenX >= cardLeft - 40 && mouseScreenX <= cardRight + 40) {
          const localX = mouseScreenX - cardLeft;
          const localY = mouseScreenY - cardTop;
          const seamHalfSpan = (ctrl.yBottom - ctrl.yTop) * 0.5 + 46;
          const distY = Math.abs(localY - ctrl.yMid);

          if (distY < seamHalfSpan && localX >= 10 && localX <= 430) {
            const normY = distY / seamHalfSpan;
            const vertEnvelope = 0.5 + 0.5 * Math.cos(normY * Math.PI);
            const edgeDistX = Math.min(localX - 10, 430 - localX);
            const horizEnvelope = Math.min(1.0, Math.max(0.0, edgeDistX / 36));
            targetRadius = 50 * Math.pow(vertEnvelope * horizEnvelope, 1.3);
            lensTargetX = Math.max(25, Math.min(415, localX));
            lensTargetY = Math.max(ctrl.yTop - 12, Math.min(ctrl.yBottom + 12, localY));
          }
        }

        const radiusDecay =
          targetRadius > ctrl.lensRadius ? lensApproachDecay : lensLeaveDecay;
        ctrl.lensRadius += (targetRadius - ctrl.lensRadius) * radiusDecay;

        if (ctrl.lensRadius > 0.15) {
          const targetDx = lensTargetX - ctrl.lastX;
          const targetDy = lensTargetY - ctrl.lastY;
          ctrl.vx += (targetDx - ctrl.vx) * velBlend;
          ctrl.vy += (targetDy - ctrl.vy) * velBlend;
          ctrl.lastX = lensTargetX;
          ctrl.lastY = lensTargetY;

          const speed = Math.hypot(ctrl.vx, ctrl.vy);
          ctrl.headX += (lensTargetX - ctrl.headX) * headDecay;
          ctrl.headY += (lensTargetY - ctrl.headY) * headDecay;
          ctrl.coreX += (lensTargetX - ctrl.coreX) * coreDecay;
          ctrl.coreY += (lensTargetY - ctrl.coreY) * coreDecay;
          ctrl.tailX += (ctrl.coreX - ctrl.tailX) * tailDecay;
          ctrl.tailY += (ctrl.coreY - ctrl.tailY) * tailDecay;

          ctrl.wobblePhase += dt * 3.5;
          const wobble = Math.sin(ctrl.wobblePhase) * 1.5;
          const stretch = Math.min(1.35, 1.0 + speed * 0.03);
          const headR = Math.max(0, (ctrl.lensRadius * 0.72 + wobble * 0.4) / stretch);
          const coreR = Math.max(0, ctrl.lensRadius + wobble);
          const tailR = Math.max(0, (ctrl.lensRadius * 0.58 - wobble * 0.3) * stretch);

          const targetBlur = Math.min(6.2, (ctrl.lensRadius / 50) * 6.2);
          ctrl.currentBlur += (targetBlur - ctrl.currentBlur) * blurDecay;

          ctrl.lensHead.setAttribute("cx", ctrl.headX.toFixed(1));
          ctrl.lensHead.setAttribute("cy", ctrl.headY.toFixed(1));
          ctrl.lensHead.setAttribute("r", headR.toFixed(1));

          ctrl.lensCore.setAttribute("cx", ctrl.coreX.toFixed(1));
          ctrl.lensCore.setAttribute("cy", ctrl.coreY.toFixed(1));
          ctrl.lensCore.setAttribute("r", coreR.toFixed(1));

          ctrl.lensTail.setAttribute("cx", ctrl.tailX.toFixed(1));
          ctrl.lensTail.setAttribute("cy", ctrl.tailY.toFixed(1));
          ctrl.lensTail.setAttribute("r", tailR.toFixed(1));

          ctrl.wasLensActive = true;
        } else if (ctrl.wasLensActive) {
          ctrl.currentBlur += (0 - ctrl.currentBlur) * blurFadeDecay;
          if (ctrl.currentBlur < 0.06) {
            ctrl.lensRadius = 0;
            ctrl.currentBlur = 0;
            ctrl.lensHead.setAttribute("r", "0");
            ctrl.lensCore.setAttribute("r", "0");
            ctrl.lensTail.setAttribute("r", "0");
            ctrl.wasLensActive = false;
          } else {
            const fadeR = Math.max(0, (ctrl.currentBlur / 6.2) * 5.0);
            ctrl.lensCore.setAttribute("r", fadeR.toFixed(1));
          }
        }

        // 2. Melting Border Stalactite Drips
        const isCardHovered =
          !isDragging &&
          mouseScreenX >= cardLeft &&
          mouseScreenX <= cardRight &&
          mouseScreenY >= cardTop &&
          mouseScreenY <= cardBottom;

        const dripDecay = isCardHovered ? dripInDecay : dripOutDecay;
        ctrl.dripProgress += ((isCardHovered ? 1.0 : 0.0) - ctrl.dripProgress) * dripDecay;

        if (ctrl.dripProgress > 0.015) {
          ctrl.dripTimer += dt;
          const dripConfigs = [
            { cx: 75, sag: 1.0, phase: 0 },
            { cx: 165, sag: 1.45, phase: 1.9 },
            { cx: 275, sag: 0.95, phase: 3.5 },
            { cx: 365, sag: 1.35, phase: 5.1 }
          ];

          for (let j = 0; j < dripConfigs.length; j++) {
            const cfg = dripConfigs[j];
            const wobble = Math.sin(ctrl.dripTimer * 2.2 + cfg.phase) * 2.2;
            const dripY = ctrl.dripEdgeY + ctrl.dripProgress * 22.0 * cfg.sag + wobble;
            const dripR = Math.max(0, ctrl.dripProgress * (8.5 + cfg.sag * 2.5));
            ctrl.drips[j].setAttribute("cx", cfg.cx.toString());
            ctrl.drips[j].setAttribute("cy", dripY.toFixed(1));
            ctrl.drips[j].setAttribute("r", dripR.toFixed(1));
          }
        } else if (ctrl.drips[0]?.getAttribute("r") !== "0") {
          ctrl.drips.forEach((d) => d.setAttribute("r", "0"));
        }

        const targetGooBlur = Math.max(ctrl.currentBlur, ctrl.dripProgress * 5.6);
        if (targetGooBlur > 0.05) {
          ctrl.blurEl.setAttribute("stdDeviation", targetGooBlur.toFixed(2));
        } else if (ctrl.blurEl.getAttribute("stdDeviation") !== "0") {
          ctrl.blurEl.setAttribute("stdDeviation", "0");
        }

        // 3. Panoramic Mouse Parallax & Continuous Scroll Parallax
        let targetMousePX = 0;
        let targetMousePY = 0;

        if (!isDragging && mouseScreenX > -500) {
          const distToCard = Math.abs(mouseScreenX - cardCenterX);
          const focus = Math.max(0.7, 1.0 - Math.min(1.0, distToCard / 700) * 0.3);
          targetMousePX = globalNormX * 14.0 * focus;
          targetMousePY = globalNormY * 14.0 * focus;
        }

        ctrl.mouseParallaxX += (targetMousePX - ctrl.mouseParallaxX) * parallaxDecay;
        ctrl.mouseParallaxY += (targetMousePY - ctrl.mouseParallaxY) * parallaxDecay;

        const distFromCenter = cardCenterX - screenCenter;
        let scrollShiftX = 0;
        const currentParallaxIntensity = parallaxIntensityRef.current;
        if (Math.abs(distFromCenter) < visibleRange && currentParallaxIntensity > 0) {
          scrollShiftX = (-distFromCenter / screenCenter) * currentParallaxIntensity;
        }

        const totalX = Math.round((scrollShiftX + ctrl.mouseParallaxX) * 10) / 10;
        const totalY = Math.round(ctrl.mouseParallaxY * 10) / 10;
        ctrl.parallaxLayer.style.transform = `translate3d(${totalX}px, ${totalY}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [plates]);
}
