"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * Interactive drag: pointer/touch events accumulate a pixel delta, which
 * is converted to extra animation time (offset) added to each tile's
 * negative delay. A spring decays the offset back toward zero so dragging
 * feels like giving the belt a shove rather than holding a joystick.
 * ─────────────────────────────────────────────────────────────── */

const SLICES = 16;
const CAMERA = 1.6;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

const MAX_WIDTH = 55;

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  );
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
};

export type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(
    null,
  );
  const [shown, setShown] = React.useState<Record<number, number>>({});

  // ── drag / fling state ────────────────────────────────────────
  const offsetRef = React.useRef(0);
  const velRef = React.useRef(0);
  const dragRef = React.useRef<{ x: number; t: number } | null>(null);
  const rafRef = React.useRef<number>(0);
  const isDraggingRef = React.useRef(false);

  const [speedLabel, setSpeedLabel] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Live refs to each tile DOM node for direct delay mutation
  const tileRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend);
  const duration = columns * speed;

  // Apply current offsetRef to every tile's delay
  const applyOffset = React.useCallback(
    (cols: number) => {
      const extraSec = offsetRef.current;
      for (let t = 0; t < cols; t++) {
        const el = tileRefs.current[t];
        if (!el) continue;
        el.style.animationDelay = `${-t * speed - extraSec}s`;
      }
    },
    [speed],
  );

  // Physics loop: fling decay + apply offset every frame
  const runPhysics = React.useCallback(() => {
    if (!isDraggingRef.current) {
      offsetRef.current *= 0.93;
      if (Math.abs(offsetRef.current) < 0.002) offsetRef.current = 0;
    }
    applyOffset(columns);
    rafRef.current = requestAnimationFrame(runPhysics);
  }, [applyOffset, columns]);

  React.useEffect(() => {
    rafRef.current = requestAnimationFrame(runPhysics);
    return () => cancelAnimationFrame(rafRef.current);
  }, [runPhysics]);

  // ── pointer handlers ──────────────────────────────────────────
  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    dragRef.current = { x: e.clientX, t: performance.now() };
    velRef.current = 0;
    setSpeedLabel("↔ Drag");
  }, []);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const now = performance.now();
      const dx = e.clientX - dragRef.current.x;
      const dt = Math.max(1, now - dragRef.current.t);
      velRef.current = dx / dt; // px/ms

      dragRef.current = { x: e.clientX, t: now };

      const containerW = ref.current?.clientWidth ?? window.innerWidth;
      const containerH = ref.current?.clientHeight ?? window.innerHeight;
      const tilePx = Math.min(
        (tileHeight / 100) * containerH * aspectRatio,
        (MAX_WIDTH / 100) * containerW,
      );
      const secPerPx = speed / Math.max(tilePx, 1);
      offsetRef.current += dx * secPerPx;

      const absVel = Math.abs(velRef.current);
      if (absVel > 0.6) setSpeedLabel("⚡ Fast");
      else if (absVel < 0.15) setSpeedLabel("🐢 Slow");
      else setSpeedLabel("↔ Drag");
    },
    [tileHeight, aspectRatio, speed],
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      isDraggingRef.current = false;
      setIsDragging(false);
      setSpeedLabel(null);

      const containerW = ref.current?.clientWidth ?? window.innerWidth;
      const containerH = ref.current?.clientHeight ?? window.innerHeight;
      const tilePx = Math.min(
        (tileHeight / 100) * containerH * aspectRatio,
        (MAX_WIDTH / 100) * containerW,
      );
      const secPerPx = speed / Math.max(tilePx, 1);
      // Fling: extrapolate ~120 ms of momentum
      offsetRef.current += velRef.current * 120 * secPerPx;
      dragRef.current = null;
    },
    [tileHeight, aspectRatio, speed],
  );

  // ── resize observer ───────────────────────────────────────────
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns &&
        prev.sweep === next.sweep &&
        prev.unit === next.unit
          ? prev
          : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  React.useEffect(() => {
    for (const { src } of images) new Image().src = src;
  }, [images]);

  // Keep tileRefs in sync when column count changes
  React.useEffect(() => {
    tileRefs.current = tileRefs.current.slice(0, columns);
  }, [columns]);

  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / aspectRatio
    ).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  const turn = (deg: number) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
    100 - fade
  }%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "size", ...props.style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <style>{css}</style>

      {/* Speed label badge */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2"
        style={{
          opacity: speedLabel ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(46,42,38,0.72)",
            color: "#fbf8f2",
            borderRadius: "999px",
            padding: "2px 12px",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            backdropFilter: "blur(6px)",
          }}
        >
          {speedLabel}
        </span>
      </div>

      {/* Idle hint */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2"
        style={{
          opacity: layout && !isDragging ? 0.5 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-hand, sans-serif)",
            fontSize: "0.72rem",
            color: "#2e2a26",
          }}
        >
          ← drag photos →
        </span>
      </div>

      {/* Carousel band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];
          return (
            <div
              key={t}
              ref={(el) => { tileRefs.current[t] = el; }}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden bg-muted",
                    k === 0 && "rounded-l-lg",
                    k === SLICES - 1 && "rounded-r-lg",
                  )}
                  style={{
                    left: u((aspectRatio - share) / 2),
                    width:
                      k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn(
                      (aspectRatio / 2 - (k + 0.5) * share) * unit,
                    ),
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "") : ""}
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: u(-k * share),
                        width: u(aspectRatio),
                        height: u(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
