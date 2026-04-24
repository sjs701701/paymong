"use client";

import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

export type HeroScrollPhase = "keyword-sequence" | "cta-docked" | "free-scroll";

export function useHeroLenisControl(phase: HeroScrollPhase) {
  const lenis = useLenis();
  const reducedMotion = useHydratedReducedMotion();
  const lenisRef = useRef<Lenis | undefined>(undefined);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    if (reducedMotion || phase !== "free-scroll") {
      lenis.stop();
      return;
    }

    lenis.start();
  }, [lenis, phase, reducedMotion]);

  return lenisRef;
}
