"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

const DRACULA_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.32,
  dark: 1,
  diffuse: 1.15,
  mapSamples: 12000,
  mapBrightness: 5,
  baseColor: [68 / 255, 71 / 255, 90 / 255],
  markerColor: [255 / 255, 121 / 255, 198 / 255],
  glowColor: [139 / 255, 233 / 255, 253 / 255],
  markers: [
    { location: [40.7128, -74.006], size: 0.12 },
    { location: [51.5072, -0.1276], size: 0.08 },
    { location: [48.8566, 2.3522], size: 0.08 },
    { location: [28.6139, 77.209], size: 0.1 },
    { location: [35.6762, 139.6503], size: 0.1 },
    { location: [1.3521, 103.8198], size: 0.08 },
    { location: [-33.8688, 151.2093], size: 0.08 },
    { location: [25.2048, 55.2708], size: 0.08 },
  ],
};

type GlobeProps = {
  className?: string;
  config?: COBEOptions;
};

export function Globe({
  className,
  config = DRACULA_GLOBE_CONFIG,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);

  const rotation = useMotionValue(0);
  const rotationSpring = useSpring(rotation, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };

    const updatePointerInteraction = (value: number | null) => {
      pointerInteracting.current = value;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = value === null ? "grab" : "grabbing";
      }
    };

    const updateMovement = (clientX: number) => {
      if (pointerInteracting.current === null) {
        return;
      }

      const delta = clientX - pointerInteracting.current;
      rotation.set(rotation.get() + delta / MOVEMENT_DAMPING);
      pointerInteracting.current = clientX;
    };

    window.addEventListener("resize", onResize);
    onResize();

    const canvas = canvasRef.current;
    if (!canvas) {
      window.removeEventListener("resize", onResize);
      return;
    }

    const globe = createGlobe(canvas, {
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (pointerInteracting.current === null) {
          phiRef.current += 0.0035;
        }

        state.phi = phiRef.current + rotationSpring.get();
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    canvas.style.opacity = "1";
    canvas.onpointerdown = (event) => {
      updatePointerInteraction(event.clientX);
    };
    canvas.onpointerup = () => updatePointerInteraction(null);
    canvas.onpointerout = () => updatePointerInteraction(null);
    canvas.onmousemove = (event) => updateMovement(event.clientX);
    canvas.ontouchmove = (event) => {
      if (event.touches[0]) {
        updateMovement(event.touches[0].clientX);
      }
    };

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config, rotation, rotationSpring]);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-[38rem]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
      />
    </div>
  );
}
