"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type KeywordId = "rent" | "tuition" | "labor" | "contract";
type KeywordDecorSlotId = "orbit" | "ribbon" | "sweep" | "echo";

export type KeywordState = {
  id: KeywordId;
  label: string;
  accentColor: string;
};

type KeywordDecorAsset = {
  slot: KeywordDecorSlotId;
  label: string;
  pathBase: string;
};

type ResolvedAssetState = {
  pathBase: string;
  resolvedPath: string | null;
};

const HERO_COPY = {
  keywords: [
    "\uC6D4\uC138",
    "\uAD50\uC721\uBE44",
    "\uC778\uAC74\uBE44",
    "\uC774\uC0AC\uBE44",
  ],
  suffix: "\uB3C4 \uCE74\uB4DC\uB85C.",
  statement: "\uADF8\uAC8C \uD398\uC774\uBABD\uC774\uB2C8\uAE4C.",
  cta: "\uC9C0\uAE08 \uBC14\uB85C \uC2DC\uC791\uD558\uAE30",
} as const;

const keywordStates: KeywordState[] = [
  { id: "rent", label: HERO_COPY.keywords[0], accentColor: "#0038F1" },
  { id: "tuition", label: HERO_COPY.keywords[1], accentColor: "#00ABFF" },
  { id: "labor", label: HERO_COPY.keywords[2], accentColor: "#5D62FF" },
  { id: "contract", label: HERO_COPY.keywords[3], accentColor: "#8423FE" },
];

const AURA_OPACITIES = [0.12, 0.18, 0.24, 0.18];
const DECOR_ASSET_EXTENSIONS = ["svg", "png", "jpg", "jpeg", "webp"] as const;
const LAST_KEYWORD_INDEX = keywordStates.length - 1;
const KEYWORD_COOLDOWN_MS = 520;
const DESKTOP_FRAME_HEIGHT_RATIO = 0.64;
const MOBILE_FRAME_HEIGHT_RATIO = 0.56;
const DESKTOP_FRAME_LIFT = 132;
const MOBILE_FRAME_LIFT = 92;
const DESKTOP_FRAME_PEEK = 140;
const MOBILE_FRAME_PEEK = 100;
const VIDEO_STAGE_PIN_SCROLL = 3000;
const LAST_KEYWORD_SETTLE_MS = 400;
const LAST_KEYWORD_REVEAL_WHEEL_THRESHOLD = 140;
const LAST_KEYWORD_REVEAL_TOUCH_THRESHOLD = 110;
const HEADER_AUTO_HIDE_SYNC_EVENT = "paymong:header-auto-hide-sync";

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildDecorAssets(keywordId: KeywordId): KeywordDecorAsset[] {
  return [
    {
      slot: "orbit",
      label: "orbit-shell",
      pathBase: `/design/hero-keywords/${keywordId}/orbit-shell`,
    },
    {
      slot: "ribbon",
      label: "right-ribbon",
      pathBase: `/design/hero-keywords/${keywordId}/right-ribbon`,
    },
    {
      slot: "sweep",
      label: "left-sweep",
      pathBase: `/design/hero-keywords/${keywordId}/left-sweep`,
    },
    {
      slot: "echo",
      label: "bottom-echo",
      pathBase: `/design/hero-keywords/${keywordId}/bottom-echo`,
    },
  ];
}

function buildDecorAssetCandidates(pathBase: string) {
  return DECOR_ASSET_EXTENSIONS.map((extension) => `${pathBase}.${extension}`);
}

function useResolvedAssetPath(pathBase: string) {
  const candidates = useMemo(() => buildDecorAssetCandidates(pathBase), [pathBase]);
  const fallbackPath = candidates[0] ?? null;
  const [state, setState] = useState<ResolvedAssetState>({
    pathBase,
    resolvedPath: null,
  });

  useEffect(() => {
    let disposed = false;

    const tryCandidate = (index: number) => {
      if (disposed) return;

      if (index >= candidates.length) {
        setState({ pathBase, resolvedPath: null });
        return;
      }

      const candidate = candidates[index];
      const image = new Image();

      image.onload = () => {
        if (!disposed) {
          setState({ pathBase, resolvedPath: candidate });
        }
      };

      image.onerror = () => {
        tryCandidate(index + 1);
      };

      image.src = candidate;
    };

    tryCandidate(0);

    return () => {
      disposed = true;
    };
  }, [candidates, pathBase]);

  if (state.pathBase !== pathBase) {
    return fallbackPath;
  }

  return state.resolvedPath ?? fallbackPath;
}

function DecorSlot({
  asset,
  accentColor,
}: {
  asset: KeywordDecorAsset;
  accentColor: string;
}) {
  const resolvedPath = useResolvedAssetPath(asset.pathBase);

  const slotStyle = {
    backgroundImage: resolvedPath ? `url("${resolvedPath}")` : "none",
    borderColor: withAlpha(accentColor, 0.32),
    boxShadow: `0 20px 48px ${withAlpha(accentColor, 0.08)}`,
  } satisfies CSSProperties;

  return (
    <div
      className={`hero-design-slot hero-design-slot--${asset.slot}`}
      style={slotStyle}
    >
      <span className="hero-design-slot__label">{asset.label}</span>
    </div>
  );
}

function OrbitAssetOverlay({
  asset,
}: {
  asset: KeywordDecorAsset;
}) {
  const resolvedPath = useResolvedAssetPath(asset.pathBase);

  if (!resolvedPath) return null;

  return (
    <img
      src={resolvedPath}
      alt=""
      className="hero-orbit-asset"
    />
  );
}

function RibbonAssetOverlay({
  asset,
}: {
  asset: KeywordDecorAsset;
}) {
  const resolvedPath = useResolvedAssetPath(asset.pathBase);

  if (!resolvedPath) return null;

  return (
    <img
      src={resolvedPath}
      alt=""
      className="hero-ribbon-asset"
    />
  );
}

function HeadlineRotator({
  activeItem,
}: {
  activeItem: KeywordState;
}) {
  const decorAssets = useMemo(() => buildDecorAssets(activeItem.id), [activeItem.id]);
  const orbitAsset = decorAssets.find((asset) => asset.slot === "orbit");
  const ribbonAsset = decorAssets.find((asset) => asset.slot === "ribbon");
  const baseDecorAssets = decorAssets.filter((asset) => asset.slot !== "orbit" && asset.slot !== "ribbon");

  return (
    <div className="hero-title-shell">
      <div className="hero-title-stage" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeItem.id}-decor`}
            initial={{ opacity: 0, filter: "blur(14px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(12px)", scale: 1.01 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full"
          >
            {baseDecorAssets.map((asset) => (
              <DecorSlot
                key={asset.pathBase}
                asset={asset}
                accentColor={activeItem.accentColor}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex w-full max-w-[1360px] flex-col">
        <p className="-translate-x-[240px] flex w-full max-w-[15.5em] items-end justify-start self-start text-left text-[clamp(3rem,7.8vw,7.9rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[var(--text-primary)]">
          <span className="inline-flex w-[4.8em] shrink-0 items-end justify-end overflow-hidden">
            <AnimatePresence mode="wait">
              <span
                className="inline-flex h-[1.08em] w-[2.95em] items-center justify-center whitespace-nowrap rounded-full px-[0.12em]"
                style={{ backgroundColor: activeItem.accentColor }}
              >
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, filter: "blur(14px)", y: 36, scale: 0.98 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px)", y: -24, scale: 1.015 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-flex items-center justify-center whitespace-nowrap text-[0.74em] font-[var(--font-display)] font-extrabold leading-none ${activeItem.id === "rent" ? "tracking-[0.08em]" : "tracking-[-0.04em]"}`}
                  style={{ color: "#fff" }}
                >
                  {activeItem.label}
                </motion.span>
              </span>
            </AnimatePresence>
          </span>
          <span className="shrink-0 tracking-[-0.03em]">{HERO_COPY.suffix}</span>
        </p>
        <p className="mt-5 w-full max-w-[13.2em] self-end whitespace-nowrap text-right text-[clamp(3rem,7.8vw,7.9rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--text-primary)]">
          {HERO_COPY.statement}
        </p>
      </div>

      {orbitAsset ? (
        <div className="hero-title-stage hero-title-stage--overlay" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeItem.id}-orbit`}
              initial={{ opacity: 0, filter: "blur(14px)", scale: 0.98 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(12px)", scale: 1.01 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <OrbitAssetOverlay asset={orbitAsset} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      {ribbonAsset ? (
        <div className="hero-title-stage" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeItem.id}-ribbon`}
              initial={{ opacity: 0, filter: "blur(14px)", scale: 0.98 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(12px)", scale: 1.01 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <RibbonAssetOverlay asset={ribbonAsset} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

export function HeroStory({
  onLastKeywordStateChange,
}: {
  onLastKeywordStateChange?: (isLastKeyword: boolean) => void;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const titleBlockRef = useRef<HTMLDivElement | null>(null);
  const ctaShellRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const nextSectionRef = useRef<HTMLElement | null>(null);
  const nextSectionBackgroundRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealUnlockUntilRef = useRef(0);
  const revealIntentRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const idxRef = useRef(0);
  const isCtaDockedRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCtaDocked, setIsCtaDocked] = useState(false);
  const [isCtaPreviewActive, setIsCtaPreviewActive] = useState(false);
  const [ctaWidth, setCtaWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    idxRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex !== LAST_KEYWORD_INDEX) {
      revealIntentRef.current = 0;
    }
  }, [activeIndex]);

  useEffect(() => {
    isCtaDockedRef.current = isCtaDocked;
  }, [isCtaDocked]);

  const lenisInstance = useLenis();

  useEffect(() => {
    if (!lenisInstance) return;
    lenisRef.current = lenisInstance;
    if (!isCtaDockedRef.current) {
      lenisInstance.stop();
    }
  }, [lenisInstance]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isCtaDocked) {
      const timer = setTimeout(() => {
        lenisRef.current?.start();
      }, 350);
      return () => clearTimeout(timer);
    }

    lenis.stop();
  }, [isCtaDocked]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const updateWidth = () => {
      const clone = cta.cloneNode(true) as HTMLButtonElement;
      clone.classList.remove("cta-btn--docked", "cta-btn--preview");
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.visibility = "hidden";
      clone.style.pointerEvents = "none";
      clone.style.inlineSize = "auto";
      clone.style.width = "auto";
      clone.style.transition = "none";
      clone.style.transform = "none";
      clone.style.setProperty("--cta-expanded-width", "auto");
      document.body.appendChild(clone);
      const measuredWidth = clone.getBoundingClientRect().width;
      clone.remove();

      if (measuredWidth > 0) {
        setCtaWidth(measuredWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(cta);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--active-brand",
      keywordStates[activeIndex].accentColor,
    );

    if (auraRef.current) {
      auraRef.current.style.opacity = String(AURA_OPACITIES[activeIndex]);
    }
  }, [activeIndex]);

  useEffect(() => {
    onLastKeywordStateChange?.(activeIndex === LAST_KEYWORD_INDEX);
  }, [activeIndex, onLastKeywordStateChange]);

  useEffect(() => {
    return () => {
      onLastKeywordStateChange?.(false);
    };
  }, [onLastKeywordStateChange]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const syncHeaderVisibility = (hidden: boolean) => {
      window.dispatchEvent(
        new CustomEvent(HEADER_AUTO_HIDE_SYNC_EVENT, {
          detail: { hidden },
        }),
      );
    };

    const stepKeyword = (direction: 1 | -1) => {
      if (cooldownRef.current) return;
      if (
        direction === -1 &&
        isCtaDockedRef.current &&
        window.performance.now() < revealUnlockUntilRef.current
      ) {
        return;
      }

      const nextIndex = idxRef.current + direction;
      if (nextIndex < 0 || nextIndex >= keywordStates.length) return;

      cooldownRef.current = true;
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }

      cooldownTimerRef.current = setTimeout(() => {
        cooldownRef.current = false;
      }, KEYWORD_COOLDOWN_MS);

      if (nextIndex === LAST_KEYWORD_INDEX && direction === 1) {
        revealUnlockUntilRef.current = window.performance.now() + LAST_KEYWORD_SETTLE_MS;
        revealIntentRef.current = 0;
        syncHeaderVisibility(true);
      }

      if (nextIndex !== LAST_KEYWORD_INDEX) {
        isCtaDockedRef.current = false;
        setIsCtaDocked(false);
        setIsCtaPreviewActive(false);
        revealIntentRef.current = 0;
        syncHeaderVisibility(false);
      }

      idxRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    const lockToHeroTop = () => {
      if (Math.abs(window.scrollY - section.offsetTop) > 1) {
        window.scrollTo({ top: section.offsetTop, behavior: "auto" });
      }
    };

    const isNearHeroStart = () => window.scrollY <= section.offsetTop + 40;
    const isHeroControlling = () => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 8 && rect.bottom >= window.innerHeight * 0.6;
    };

    const onWheel = (event: WheelEvent) => {
      if (!isHeroControlling()) {
        if (idxRef.current < LAST_KEYWORD_INDEX && event.deltaY > 0 && isNearHeroStart()) {
          event.preventDefault();
          lockToHeroTop();
        }
        return;
      }
      const now = window.performance.now();

      if (isCtaDockedRef.current && now < revealUnlockUntilRef.current) {
        event.preventDefault();
        lockToHeroTop();
        return;
      }

      if (idxRef.current < LAST_KEYWORD_INDEX) {
        event.preventDefault();
        lockToHeroTop();

        if (event.deltaY > 0) {
          stepKeyword(1);
        }

        if (event.deltaY < 0 && idxRef.current > 0) {
          stepKeyword(-1);
        }

        return;
      }

      if (event.deltaY > 0 && isNearHeroStart()) {
        syncHeaderVisibility(true);
        if (!isCtaDockedRef.current) {
          event.preventDefault();
          lockToHeroTop();

          if (now < revealUnlockUntilRef.current) {
            return;
          }

          revealIntentRef.current = Math.max(0, revealIntentRef.current + event.deltaY);

          if (revealIntentRef.current < LAST_KEYWORD_REVEAL_WHEEL_THRESHOLD) {
            return;
          }

          revealIntentRef.current = 0;
          isCtaDockedRef.current = true;
          setIsCtaDocked(true);
          revealUnlockUntilRef.current = now + 600;
          return;
        }

        if (now < revealUnlockUntilRef.current) {
          event.preventDefault();
          lockToHeroTop();
          return;
        }

        return;
      }

      if (event.deltaY < 0 && idxRef.current > 0 && isNearHeroStart()) {
        lenisRef.current?.stop();
        syncHeaderVisibility(false);
        revealIntentRef.current = 0;
        if (isCtaDockedRef.current && now < revealUnlockUntilRef.current) {
          event.preventDefault();
          lockToHeroTop();
          return;
        }

        if (isCtaDockedRef.current) {
          event.preventDefault();
          lockToHeroTop();
          isCtaDockedRef.current = false;
          setIsCtaDocked(false);
          setIsCtaPreviewActive(false);
          cooldownRef.current = true;
          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            cooldownRef.current = false;
          }, KEYWORD_COOLDOWN_MS);
          return;
        }

        event.preventDefault();
        lockToHeroTop();
        stepKeyword(-1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchYRef.current === null || !isHeroControlling()) return;

      const currentY = event.touches[0].clientY;
      const delta = touchYRef.current - currentY;
      const now = window.performance.now();
      if (Math.abs(delta) < 30) return;

      if (isCtaDockedRef.current && now < revealUnlockUntilRef.current) {
        event.preventDefault();
        lockToHeroTop();
        touchYRef.current = currentY;
        return;
      }

      if (idxRef.current < LAST_KEYWORD_INDEX) {
        event.preventDefault();
        lockToHeroTop();

        if (delta > 0) {
          stepKeyword(1);
        }

        if (delta < 0 && idxRef.current > 0) {
          stepKeyword(-1);
        }

        touchYRef.current = currentY;
        return;
      }

      if (delta > 0 && isNearHeroStart()) {
        syncHeaderVisibility(true);
        if (!isCtaDockedRef.current) {
          event.preventDefault();
          lockToHeroTop();

          if (now < revealUnlockUntilRef.current) {
            touchYRef.current = currentY;
            return;
          }

          revealIntentRef.current = Math.max(0, revealIntentRef.current + delta);

          if (revealIntentRef.current < LAST_KEYWORD_REVEAL_TOUCH_THRESHOLD) {
            touchYRef.current = currentY;
            return;
          }

          revealIntentRef.current = 0;
          isCtaDockedRef.current = true;
          setIsCtaDocked(true);
          revealUnlockUntilRef.current = now + 600;
          touchYRef.current = currentY;
          return;
        }

        if (now < revealUnlockUntilRef.current) {
          event.preventDefault();
          lockToHeroTop();
          touchYRef.current = currentY;
          return;
        }

        touchYRef.current = currentY;
        return;
      }

      if (delta < 0 && idxRef.current > 0 && isNearHeroStart()) {
        lenisRef.current?.stop();
        syncHeaderVisibility(false);
        revealIntentRef.current = 0;
        if (isCtaDockedRef.current && now < revealUnlockUntilRef.current) {
          event.preventDefault();
          lockToHeroTop();
          touchYRef.current = currentY;
          return;
        }

        if (isCtaDockedRef.current) {
          event.preventDefault();
          lockToHeroTop();
          isCtaDockedRef.current = false;
          setIsCtaDocked(false);
          setIsCtaPreviewActive(false);
          cooldownRef.current = true;
          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            cooldownRef.current = false;
          }, KEYWORD_COOLDOWN_MS);
          touchYRef.current = currentY;
          return;
        }

        event.preventDefault();
        lockToHeroTop();
        stepKeyword(-1);
      }

      touchYRef.current = currentY;
    };

    const onTouchEnd = () => {
      touchYRef.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const heroStage = heroStageRef.current;
    const titleBlock = titleBlockRef.current;
    const nextSection = nextSectionRef.current;
    const nextSectionBackground = nextSectionBackgroundRef.current;
    const frame = frameRef.current;
    const aura = auraRef.current;

    const heroContainer = heroContainerRef.current;

    if (!section || !heroContainer || !heroStage || !titleBlock || !nextSection || !nextSectionBackground || !frame || ctaWidth === 0 || viewportHeight === 0) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isMobileView = viewportWidth > 0 ? viewportWidth < 640 : false;
    const frameLift = isMobileView ? MOBILE_FRAME_LIFT : DESKTOP_FRAME_LIFT;

    const ctx = gsap.context(() => {
      gsap.set(frame, {
        y: 0,
        scale: 1,
        opacity: 1,
        transformOrigin: "top center",
        willChange: "transform, opacity",
      });
      gsap.set(nextSectionBackground, {
        opacity: 0,
        willChange: "opacity",
      });
      gsap.set(titleBlock, {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        transformOrigin: "50% 52%",
        willChange: "transform, filter, opacity",
      });
      gsap.set(heroContainer, {
        opacity: 1,
        visibility: "visible",
        willChange: "opacity, visibility",
      });
      gsap.set(heroStage, {
        opacity: 1,
        willChange: "opacity",
      });
      if (aura) {
        gsap.set(aura, {
          opacity: AURA_OPACITIES[activeIndex],
          willChange: "opacity",
        });
      }

      if (activeIndex === LAST_KEYWORD_INDEX && isCtaDocked) {
        gsap.to(nextSectionBackground, {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: nextSection,
            start: "top 30%",
            end: "top top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: nextSection,
            start: "top bottom",
            end: "top top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })
          .to(titleBlock, {
          y: -24,
          scale: 0.94,
          opacity: 0.4,
          filter: "blur(8px)",
          duration: 0.1,
        }, 0)
        .to(titleBlock, {
          y: -64,
          scale: 0.78,
          opacity: 0,
          filter: "blur(22px)",
          duration: 0.18,
        }, 0.1)
        .to(heroStage, {
          opacity: 0.4,
          duration: 0.1,
        }, 0)
        .to(heroStage, {
          opacity: 0,
          duration: 0.18,
        }, 0.1)
        .to(aura, {
          opacity: 0.06,
          duration: 0.1,
        }, 0)
        .to(aura, {
          opacity: 0,
          duration: 0.18,
        }, 0.1)
        .to(heroContainer, {
          opacity: 0,
          duration: 0.18,
        }, 0.1)
        .to(heroContainer, {
          visibility: "hidden",
          duration: 0.01,
        }, 0.28);
      }
    }, section);

    return () => {
      ctx.revert();
    };
  }, [activeIndex, ctaWidth, isCtaDocked, viewportHeight, viewportWidth]);

  useEffect(() => {
    const heroContainer = heroContainerRef.current;
    const titleBlock = titleBlockRef.current;
    const heroStage = heroStageRef.current;
    const aura = auraRef.current;
    const nextSectionBg = nextSectionBackgroundRef.current;

    if (!heroContainer || !titleBlock || !heroStage || activeIndex !== LAST_KEYWORD_INDEX) {
      return;
    }

    if (!isCtaDocked) {
      gsap.killTweensOf([heroContainer, titleBlock, heroStage, aura, nextSectionBg].filter(Boolean));
      gsap.set(heroContainer, {
        opacity: 1,
        visibility: "visible",
      });
      gsap.set(titleBlock, {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(heroStage, {
        opacity: 1,
      });
      if (aura) {
        gsap.set(aura, {
          opacity: AURA_OPACITIES[activeIndex],
        });
      }
      if (nextSectionBg) {
        gsap.set(nextSectionBg, { opacity: 0 });
      }
      return;
    }

    const fadeTargets = [heroContainer, titleBlock, heroStage, aura, nextSectionBg].filter(Boolean);
    gsap.killTweensOf(fadeTargets);

    const tween = gsap.timeline({
      defaults: {
        duration: 1,
        ease: "power2.out",
      },
    });

    tween
      .to(titleBlock, {
        y: -32,
        scale: 0.92,
        opacity: 0,
        filter: "blur(16px)",
      }, 0)
      .to(heroStage, {
        opacity: 0,
      }, 0)
      .to(heroContainer, {
        opacity: 0,
      }, 0);

    if (aura) {
      tween.to(aura, {
        opacity: 0,
      }, 0);
    }

    if (nextSectionBg) {
      tween.to(nextSectionBg, {
        opacity: 1,
      }, 0);
    }

    return () => {
      tween.kill();
    };
  }, [activeIndex, isCtaDocked]);

  const activeItem = useMemo(() => keywordStates[activeIndex], [activeIndex]);
  const isMobile = viewportWidth > 0 ? viewportWidth < 640 : false;
  const baseFrameHeight = viewportHeight > 0
    ? viewportHeight * (isMobile ? MOBILE_FRAME_HEIGHT_RATIO : DESKTOP_FRAME_HEIGHT_RATIO)
    : (isMobile ? 520 : 640);
  const frameHeight = Math.max(baseFrameHeight, isMobile ? 420 : 560);
  const centerFrameWidth = Math.max(
    ctaWidth + (isMobile ? 32 : 48),
    isMobile ? 296 : 360,
  );
  const dockedCtaWidth = isMobile ? 88 : 96;
  const ctaShellTop = viewportHeight > 0
    ? Math.round(viewportHeight * (isMobile ? 0.745 : 0.715))
    : (isMobile ? 560 : 620);
  const ctaDockedTop = viewportHeight > 0
    ? viewportHeight - (isMobile ? 82 : 94)
    : (isMobile ? 730 : 860);
  const framePeek = isMobile ? MOBILE_FRAME_PEEK : DESKTOP_FRAME_PEEK;
  const nextSectionOverlap = framePeek + (isMobile ? MOBILE_FRAME_LIFT : DESKTOP_FRAME_LIFT);
  const videoStageHeight = viewportHeight > 0
    ? viewportHeight + VIDEO_STAGE_PIN_SCROLL
    : 0;
  const nextShellRegionStyle = {
    marginTop: `-${nextSectionOverlap}px`,
    height: `${videoStageHeight}px`,
  } satisfies CSSProperties;
  const nextFrameStyle = {
    width: `${centerFrameWidth}px`,
    height: `${frameHeight}px`,
    borderRadius: isMobile ? "22px" : "28px",
  } satisfies CSSProperties;
  const ctaShellStyle = {
    ["--cta-shell-top" as string]: `${ctaShellTop}px`,
    ["--cta-shell-docked-top" as string]: `${ctaDockedTop}px`,
    ["--cta-docked-width" as string]: `${dockedCtaWidth}px`,
    ...(ctaWidth > 0
      ? { ["--cta-expanded-width" as string]: `${ctaWidth}px` }
      : {}),
  } satisfies CSSProperties;

  return (
    <section ref={sectionRef} className="relative">
      <div className="sticky top-0 z-30 h-svh overflow-hidden">
        <div ref={heroContainerRef} className="relative flex h-full items-center justify-center overflow-hidden bg-white">
          <div
            ref={auraRef}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: AURA_OPACITIES[0] }}
          >
            <div
              className="brand-glow left-[-10rem] top-[10rem]"
              style={{ background: "rgba(0, 56, 241, 0.1)" }}
            />
            <div
              className="brand-glow right-[-6rem] top-[4rem]"
              style={{ background: "rgba(0, 171, 255, 0.08)" }}
            />
            <div
              className="brand-glow bottom-[-10rem] right-[18%]"
              style={{ background: "rgba(132, 35, 254, 0.08)" }}
            />
          </div>
          <div className="hero-noise" />

          <div
            ref={heroStageRef}
            className="hero-stage-stack relative z-10 flex translate-y-8 flex-col items-center px-4 sm:translate-y-10 sm:px-6"
          >
            <div ref={titleBlockRef} className="relative">
              <HeadlineRotator activeItem={activeItem} />
            </div>
          </div>

        </div>
      </div>

      <div
        ref={ctaShellRef}
        className={`hero-cta-shell ${isCtaDocked ? "hero-cta-shell--docked" : ""}`}
        style={ctaShellStyle}
      >
        <button
          ref={ctaRef}
          className={`cta-btn ${isCtaDocked ? "cta-btn--docked" : ""} ${isCtaPreviewActive ? "cta-btn--preview" : ""}`}
          aria-label={HERO_COPY.cta}
          onMouseEnter={() => {
            if (isCtaDocked) setIsCtaPreviewActive(true);
          }}
          onMouseLeave={() => {
            if (isCtaDocked) setIsCtaPreviewActive(false);
          }}
          onFocus={() => {
            if (isCtaDocked) setIsCtaPreviewActive(true);
          }}
          onBlur={() => {
            if (isCtaDocked) setIsCtaPreviewActive(false);
          }}
        >
          <span className="bg-fill"></span>
          <svg className="cta-btn__logo" viewBox="0 0 47 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_2016_717" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="47" height="29">
              <path d="M46.2638 0H0V28.8H46.2638V0Z" fill="white"/>
            </mask>
            <g mask="url(#mask0_2016_717)">
              <path d="M23.1219 7.7976C23.1004 5.112 24.4942 2.5056 26.973 1.0656C30.6517 -1.0656 35.3722 0.201601 37.499 3.8808L45.2084 17.2296C47.3351 20.9088 46.0706 25.6248 42.3919 27.756C38.7132 29.8872 33.9927 28.62 31.866 24.9408L30.8026 23.0976L29.7608 24.912C28.6759 26.7912 26.9227 28.0368 24.9684 28.5336H24.9325C24.9325 28.5336 24.9038 28.5336 24.8966 28.5408C24.3577 28.6776 23.8045 28.7424 23.2584 28.7496H22.9351C22.389 28.7424 21.843 28.6632 21.2969 28.5408C21.2897 28.5408 21.2682 28.5408 21.261 28.5336H21.2251C19.278 28.044 17.5177 26.7912 16.4327 24.912L15.0029 22.4352L23.1578 7.7976H23.1363H23.1219Z" fill="url(#paint0_logo_cta2)"/>
              <path d="M23.1219 7.7976C23.1004 5.112 24.4942 2.5056 26.973 1.0656C30.6517 -1.0656 35.3722 0.201601 37.499 3.8808L45.2084 17.2296C47.3351 20.9088 46.0706 25.6248 42.3919 27.756C38.7132 29.8872 33.9927 28.62 31.866 24.9408L30.8026 23.0976L29.7608 24.912C28.6759 26.7912 26.9227 28.0368 24.9684 28.5336H24.9325C24.9325 28.5336 24.9038 28.5336 24.8966 28.5408C24.3577 28.6776 23.8045 28.7424 23.2584 28.7496H22.9351C22.389 28.7424 21.843 28.6632 21.2969 28.5408C21.2897 28.5408 21.2682 28.5408 21.261 28.5336H21.2251C19.278 28.044 17.5177 26.7912 16.4327 24.912L15.0029 22.4352L23.1578 7.7976H23.1363H23.1219Z" fill="url(#paint1_logo_cta2)" fillOpacity="0.8"/>
              <path d="M19.2705 1.07279C22.9492 3.20399 24.2137 7.91999 22.087 11.5992L14.3775 24.948C12.2508 28.6272 7.5303 29.8944 3.85161 27.7632C0.172922 25.6392 -1.08444 20.916 1.0423 17.2368L8.74455 3.89519C10.8713 0.201595 15.5846 -1.05121 19.2705 1.07279Z" fill="url(#paint2_logo_cta2)"/>
            </g>
            <defs>
              <linearGradient id="paint0_logo_cta2" x1="21.8717" y1="10.2672" x2="47.7876" y2="31.2093" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0038F1"/><stop offset="0.65" stopColor="#008FFC"/>
              </linearGradient>
              <linearGradient id="paint1_logo_cta2" x1="41.465" y1="29.952" x2="21.439" y2="8.56665" gradientUnits="userSpaceOnUse">
                <stop stopColor="#AE00FF"/><stop offset="1" stopColor="#AE00FF" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="paint2_logo_cta2" x1="19.2489" y1="1.0584" x2="3.83196" y2="27.7569" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0038F1"/><stop offset="1" stopColor="#00ABFF"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-box" aria-hidden={isCtaDocked}>
            <span className="text-wrapper">
              <span className="text-top">{HERO_COPY.cta}</span>
              <span className="text-bottom">{HERO_COPY.cta}</span>
            </span>
          </span>
        </button>
      </div>

      <section
        ref={nextSectionRef}
        className="relative z-40"
        style={nextShellRegionStyle}
      >
        <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
          <div
            ref={nextSectionBackgroundRef}
            className="pointer-events-none absolute inset-0 bg-white"
          />

          <div
            className="relative z-10"
          >
            <div ref={frameRef} className="hero-next-shell-frame" style={nextFrameStyle}>
              <div className="hero-next-shell-frame__surface" />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
