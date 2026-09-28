import { PhysicsBody } from "./types";

export interface UpdatePhysicsParams {
  pool: PhysicsBody[];
  imgRefs: (HTMLImageElement | null)[];
  currentMode: "normal" | "zero-gravity";
  gravity: number;
  viewportHeight: number;
}

export function createInitialPool(poolSize: number, initialImages: string[] = []): PhysicsBody[] {
  return Array.from({ length: poolSize }, (_, i) => ({
    active: false,
    id: i,
    src: initialImages.length > 0 ? initialImages[i % initialImages.length] : "",
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    rotation: 0,
    vSpin: 0,
    targetRotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 0,
    age: 0,
    enterProgress: 0,
    dropDelay: 0,
    state: "sliding",
  }));
}

/**
 * Spawns a card at the cursor with kinetic force, solid 100% opacity, and no fading.
 */
export function spawnBody(
  body: PhysicsBody,
  imgEl: HTMLImageElement | null,
  x: number,
  y: number,
  imageSize: number,
  src: string,
  zIndex: number,
  mouseVel: { vx: number; vy: number },
  isMotionReduced: boolean
): void {
  if (!body) return;
  const imageHeight = Math.round(imageSize * 1.25);

  const clampedVx = Math.max(-9, Math.min(9, mouseVel.vx * 0.35));
  const clampedVy = Math.max(-7, Math.min(7, mouseVel.vy * 0.35));

  const baseTilt = Math.max(-12, Math.min(12, clampedVx * 1.6));
  const spinMomentum = Math.max(-0.6, Math.min(0.6, clampedVx * 0.08));

  body.active = true;
  body.src = src;
  body.x = x - imageSize / 2;
  body.y = y - imageHeight / 2;
  body.vx = isMotionReduced ? 0 : clampedVx;
  body.vy = isMotionReduced ? 0 : clampedVy;
  body.rotation = isMotionReduced ? 0 : baseTilt;
  body.vSpin = isMotionReduced ? 0 : spinMomentum;
  body.targetRotation = isMotionReduced ? 0 : baseTilt * 0.4;
  body.opacity = 1; // Solid 100% opacity - no fading
  body.scale = isMotionReduced ? 1 : 0.94;
  body.enterProgress = 0;
  body.dropDelay = 0;
  body.zIndex = zIndex;
  body.age = 0;
  body.state = "sliding";

  if (imgEl) {
    if (imgEl.getAttribute("src") !== src) {
      imgEl.src = src;
    }
    imgEl.style.zIndex = String(zIndex);
    imgEl.style.opacity = "1";
    imgEl.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0px) rotate(${body.rotation.toFixed(1)}deg) scale(${body.scale.toFixed(3)})`;
  }
}

/**
 * Triggers a slick shutter cascade: cards drop down one-by-one with staggered delay.
 */
export function releaseTrailBodies(
  pool: PhysicsBody[],
  flickVel: { vx: number; vy: number }
): void {
  const candidates: PhysicsBody[] = [];
  for (let i = 0; i < pool.length; i++) {
    const body = pool[i];
    if (body.active && body.state !== "dropping") {
      candidates.push(body);
    }
  }

  // Sort by age descending: oldest card is index 0
  candidates.sort((a, b) => b.age - a.age);

  // Crisp, satisfying shutter cadence: 140ms between consecutive falling cards
  const SHUTTER_DELAY_MS = 140;
  const residualVx = Math.max(-4, Math.min(4, flickVel.vx * 0.2));

  for (let k = 0; k < candidates.length; k++) {
    const body = candidates[k];
    body.state = "dropping";
    body.dropDelay = k * SHUTTER_DELAY_MS;
    body.vx = residualVx;
    body.vy = 0.8;
  }
}

/**
 * Frame update: fluid kinetic slide into resting position, followed by sequential shutter fall off-screen.
 * Zero opacity fading: images remain solid until fully past viewport bounds.
 */
export function updatePhysicsStep({
  pool,
  imgRefs,
  currentMode,
  viewportHeight,
}: UpdatePhysicsParams): void {
  for (let i = 0; i < pool.length; i++) {
    const body = pool[i];
    if (!body.active) continue;

    body.age += 1;

    if (body.state === "sliding") {
      // 1. Kinetic glide from mouse stroke
      body.x += body.vx;
      body.y += body.vy;
      body.rotation += body.vSpin;

      body.vx *= 0.94;
      body.vy *= 0.94;
      body.vSpin *= 0.92;

      // Quick smooth scale settle to 1.0
      body.enterProgress = Math.min(1, body.enterProgress + 0.08);
      const ease = 1 - Math.pow(1 - body.enterProgress, 3);
      body.scale = 0.94 + 0.06 * ease;

      const speed = Math.hypot(body.vx, body.vy);
      if (speed < 0.2 && body.enterProgress >= 1) {
        body.state = "resting";
        body.vx = 0;
        body.vy = 0;
        body.vSpin = 0;
        body.scale = 1;
      }
    } else if (body.state === "resting") {
      // 2. Resting in place: solid, calm, poised
      // Idle dwell time before auto-descent: 90 frames (~1.5s)
      if (body.age > 90) {
        body.state = "dropping";
        body.dropDelay = 0;
      }
    } else if (body.state === "dropping") {
      // 3. Shutter drop: waits for its turn, then gracefully glides down one by one
      if (body.dropDelay > 0) {
        body.dropDelay -= 16.6;
      } else {
        if (currentMode === "zero-gravity") {
          // Zero-g: stately, weightless upward drift
          body.vy = Math.max(-12, body.vy - 0.28);
          body.vx *= 0.96;
          body.x += body.vx;
          body.y += body.vy;
          body.rotation += (body.targetRotation - body.rotation) * 0.03;
          body.scale = Math.max(0.96, body.scale - 0.0004);
        } else {
          // Normal: crisp, weighted downward descent with satisfying terminal velocity
          body.vy = Math.min(13.5, body.vy + 0.38);
          body.vx *= 0.96;
          body.x += body.vx;
          body.y += body.vy;
          body.rotation += (body.targetRotation - body.rotation) * 0.03;
          body.scale = Math.max(0.96, body.scale - 0.0004);
        }
      }
    }

    const domNode = imgRefs[i];
    if (domNode) {
      // Cleanly recycle when completely past the viewport
      const isOffscreen =
        currentMode === "zero-gravity"
          ? body.y < -350
          : body.y > viewportHeight + 100;

      if (isOffscreen) {
        body.active = false;
        domNode.style.opacity = "0";
        domNode.style.transform = "translate3d(-9999px, -9999px, 0px)";
      } else {
        domNode.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0px) rotate(${body.rotation.toFixed(1)}deg) scale(${body.scale.toFixed(3)})`;
        domNode.style.opacity = "1"; // Always solid 100% opacity
      }
    }
  }
}
