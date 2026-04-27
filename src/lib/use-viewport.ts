"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// useLayoutEffect runs before browser paint (so first paint already has the
// measured viewport on mobile), but emits a warning during SSR. Fall back to
// useEffect on the server to keep that side silent.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const COMPACT_HERO_MAX_WIDTH = 767.98;
const STACKED_VIDEO_MAX_WIDTH = 1023.98;

const DESKTOP_FALLBACK_WIDTH = 1440;
const DESKTOP_FALLBACK_HEIGHT = 900;

export type ViewportState = {
  width: number;
  height: number;
  isCompactHeroLayout: boolean;
  isStackedVideoLayout: boolean;
  hasMeasured: boolean;
};

const DESKTOP_SAFE_INITIAL: ViewportState = {
  width: DESKTOP_FALLBACK_WIDTH,
  height: DESKTOP_FALLBACK_HEIGHT,
  isCompactHeroLayout: false,
  isStackedVideoLayout: false,
  hasMeasured: false,
};

function isStateEqual(a: ViewportState, b: ViewportState) {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.isCompactHeroLayout === b.isCompactHeroLayout &&
    a.isStackedVideoLayout === b.isStackedVideoLayout &&
    a.hasMeasured === b.hasMeasured
  );
}

export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(DESKTOP_SAFE_INITIAL);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    let frame = 0;
    let compactLayoutSize: Pick<ViewportState, "width" | "height"> | null = null;

    const getMeasuredSize = () => {
      return {
        width: Math.round(window.innerWidth),
        height: Math.round(window.innerHeight),
      };
    };

    const compute = () => {
      frame = 0;
      const measured = getMeasuredSize();
      const isCompactHeroLayout = measured.width <= COMPACT_HERO_MAX_WIDTH;
      const compactWidthChanged = compactLayoutSize !== null
        && Math.abs(compactLayoutSize.width - measured.width) > 24;

      if (isCompactHeroLayout) {
        if (compactLayoutSize === null || compactWidthChanged) {
          compactLayoutSize = measured;
        }
      } else {
        compactLayoutSize = null;
      }

      const width = measured.width;
      const height = compactLayoutSize?.height ?? measured.height;
      const next: ViewportState = {
        width,
        height,
        isCompactHeroLayout,
        isStackedVideoLayout: width <= STACKED_VIDEO_MAX_WIDTH,
        hasMeasured: true,
      };
      setState((prev) => (isStateEqual(prev, next) ? prev : next));
    };

    const schedule = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(compute);
    };

    compute();

    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return state;
}
