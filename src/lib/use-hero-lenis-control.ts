"use client";

import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

export type HeroScrollPhase = "keyword-sequence" | "cta-docked" | "free-scroll";

export function useHeroLenisControl(phase: HeroScrollPhase) {
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | undefined>(undefined);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    if (phase !== "free-scroll") {
      lenis.stop();
      return;
    }

    lenis.start();
  }, [lenis, phase]);

  return lenisRef;
}
