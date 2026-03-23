"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

const keywordStates: KeywordState[] = [
  { id: "rent", label: "월세", accentColor: "#0038F1" },
  { id: "tuition", label: "교육비", accentColor: "#00ABFF" },
  { id: "labor", label: "인건비", accentColor: "#5D62FF" },
  { id: "contract", label: "이사비", accentColor: "#8423FE" },
];

const AURA_OPACITIES = [0.12, 0.18, 0.24, 0.18];
const COOLDOWN_MS = 520;
const DECOR_ASSET_EXTENSIONS = ["svg", "png", "jpg", "jpeg", "webp"] as const;

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

// Decorative assets live under public/design/hero-keywords/<keywordId>/.
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
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    const candidates = buildDecorAssetCandidates(pathBase);

    setResolvedPath(candidates[0] ?? null);

    const tryCandidate = (index: number) => {
      if (disposed || index >= candidates.length) {
        if (!disposed) setResolvedPath(null);
        return;
      }

      const candidate = candidates[index];
      const image = new Image();

      image.onload = () => {
        if (!disposed) setResolvedPath(candidate);
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
  }, [pathBase]);

  return resolvedPath;
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
          <span className="shrink-0 tracking-[-0.03em]">도 카드로.</span>
        </p>
        <p className="mt-5 w-full max-w-[13.2em] self-end whitespace-nowrap text-right text-[clamp(3rem,7.8vw,7.9rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--text-primary)]">
          그게 페이몽이니까.
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

export function HeroStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const idxRef = useRef(0);
  const cooldownRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  const step = useCallback((direction: 1 | -1) => {
    if (cooldownRef.current) return false;

    const next = idxRef.current + direction;
    if (next < 0 || next >= keywordStates.length) return false;

    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, COOLDOWN_MS);

    idxRef.current = next;
    setActiveIndex(next);
    return true;
  }, []);

  // wheel
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.top > 10 || rect.bottom < window.innerHeight * 0.5) return;

      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      const next = idxRef.current + dir;
      if (next < 0 || next >= keywordStates.length) return;

      e.preventDefault();
      step(dir);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [step]);

  // touch swipe
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchYRef.current === null) return;

      const rect = section.getBoundingClientRect();
      if (rect.top > 10 || rect.bottom < window.innerHeight * 0.5) return;

      const dy = touchYRef.current - e.touches[0].clientY;
      if (Math.abs(dy) < 30) return;

      const dir: 1 | -1 = dy > 0 ? 1 : -1;
      const next = idxRef.current + dir;
      if (next < 0 || next >= keywordStates.length) return;

      e.preventDefault();
      touchYRef.current = e.touches[0].clientY;
      step(dir);
    };

    const onTouchEnd = () => { touchYRef.current = null; };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [step]);

  // sync accent color + aura
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--active-brand",
      keywordStates[activeIndex].accentColor,
    );
    if (auraRef.current) {
      auraRef.current.style.opacity = String(AURA_OPACITIES[activeIndex]);
    }
  }, [activeIndex]);

  const activeItem = useMemo(() => keywordStates[activeIndex], [activeIndex]);

  return (
    <section ref={sectionRef} className="relative h-svh bg-white">
      <div className="flex h-full items-center justify-center overflow-hidden">
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

        <div className="relative z-10 flex translate-y-8 flex-col items-center px-4 sm:translate-y-10 sm:px-6">
          <HeadlineRotator activeItem={activeItem} />

          <button className="cta-btn -mt-24 sm:-mt-28" aria-label="지금 바로 시작하기">
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
            <span className="text-box">
              <span className="text-wrapper">
                <span className="text-top">지금 바로 시작하기</span>
                <span className="text-bottom">지금 바로 시작하기</span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
