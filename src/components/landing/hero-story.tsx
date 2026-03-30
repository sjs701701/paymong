"use client";

import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type HeroScrollPhase, useHeroLenisControl } from "@/lib/use-hero-lenis-control";
import { ReviewsSection } from "@/components/landing/reviews-section";

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

type VideoStepId = 1 | 2 | 3 | 4;

type VideoStep = {
  id: VideoStepId;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  palette: string;
};

type VideoTransitionState = {
  step: VideoStepId;
  direction: 1 | -1;
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
const VIDEO_STAGE_PIN_SCROLL = 3200;
const LAST_KEYWORD_SETTLE_MS = 400;
const LAST_KEYWORD_REVEAL_WHEEL_THRESHOLD = 140;
const LAST_KEYWORD_REVEAL_TOUCH_THRESHOLD = 110;
const HEADER_AUTO_HIDE_SYNC_EVENT = "paymong:header-auto-hide-sync";
const CTA_DOCKED_SCROLL_UNLOCK_MS = 600;
const CTA_RETURN_SEQUENCE_MS = 820;
const SHOW_SIDE_PANELS_FROM_STEP = 2;
const VIDEO_SUMMARY_COLORS = ["#2268FF", "#73DAFF", "#AF70FF"] as const;
const VIDEO_SUMMARY_COLLAPSE_GAP_RATIO = 0.12;
const VIDEO_LEFT_PANEL_REVEAL_LEAD_RATIO = 0.4;
const VIDEO_SUMMARY_REVEAL_DELAY_RATIO = 0.1;
const VIDEO_SUMMARY_REVEAL_RATIO = 0.22;
const VIDEO_SUMMARY_REVEAL_DELAY_RATIO_STEP2 = 0;
const VIDEO_SUMMARY_REVEAL_RATIO_STEP2 = 0.58;
const VIDEO_STEP2_COLLAPSE_START_PROGRESS = 0.38;
const VIDEO_STEP_PROGRESS_BREAKPOINTS: Record<VideoStepId, number> = {
  1: 0.22,
  2: 0.50,
  3: 0.76,
  4: 1,
};
const VIDEO_STEP_SEQUENCE: VideoStep[] = [
  {
    id: 1,
    eyebrow: "Preview 01",
    title: "Opening reel",
    summary: "도입 화면",
    detail: "히어로 단계에서 이미 재생되는 첫 번째 영상입니다.",
    palette: "linear-gradient(135deg, rgb(0, 56, 241), rgb(71, 198, 255))",
  },
  {
    id: 2,
    eyebrow: "간편함",
    title: "Spend orchestration",
    summary: "계약 기반 비용을 한 화면에서 묶어 관리합니다.",
    detail: "반복적으로 결제되는 지출을 묶고, 결제 맥락을 정리해 운영 흐름을 단순하게 만드는 장면을 가정한 더미 설명입니다.",
    palette: "linear-gradient(135deg, rgb(0, 196, 169), rgb(0, 110, 255))",
  },
  {
    id: 3,
    eyebrow: "안전함",
    title: "Approval cadence",
    summary: "승인 흐름을 스크롤 리듬에 맞춰 짧게 보여줍니다.",
    detail: "지출 요청, 승인 체크, 카드 결제 전환까지의 짧은 운영 장면을 순차적으로 보여주는 단계용 더미 카피입니다.",
    palette: "linear-gradient(135deg, rgb(255, 117, 24), rgb(255, 58, 94))",
  },
  {
    id: 4,
    eyebrow: "신속함",
    title: "Settlement recap",
    summary: "정산과 추적을 마지막 장면에서 정리합니다.",
    detail: "최종 단계에서는 결제 후 기록과 추적이 자연스럽게 이어지는 흐름을 보여주도록 구성된 더미 상세 설명을 사용합니다.",
    palette: "linear-gradient(135deg, rgb(168, 74, 255), rgb(71, 41, 255))",
  },
] as const;

function getSummaryIconPath(stepId: VideoStepId) {
  return `/design/video-summary-icons/step-${stepId}.svg`;
}

function SummaryIconSlot({
  stepId,
}: {
  stepId: VideoStepId;
}) {
  const iconPath = getSummaryIconPath(stepId);
  const [hasIconError, setHasIconError] = useState(false);

  useEffect(() => {
    setHasIconError(false);
  }, [iconPath]);

  if (hasIconError) {
    return null;
  }

  return (
    <img
      src={iconPath}
      alt=""
      className="hero-video-note__icon-slot-image"
      aria-hidden="true"
      onError={() => setHasIconError(true)}
    />
  );
}

function getVideoStepFromProgress(progress: number): VideoStepId {
  if (progress <= VIDEO_STEP_PROGRESS_BREAKPOINTS[1]) return 1;
  if (progress < VIDEO_STEP_PROGRESS_BREAKPOINTS[2]) return 2;
  if (progress < VIDEO_STEP_PROGRESS_BREAKPOINTS[3]) return 3;
  return 4;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOutSmooth(value: number) {
  return value * value * (3 - 2 * value);
}

function getSummaryRevealTiming(stepId: VideoStepId) {
  if (stepId === 1) {
    return { revealStartRatio: 0, revealEndRatio: 0 };
  }

  if (stepId === 2) {
    return {
      revealStartRatio: VIDEO_SUMMARY_REVEAL_DELAY_RATIO_STEP2,
      revealEndRatio: VIDEO_SUMMARY_REVEAL_DELAY_RATIO_STEP2 + VIDEO_SUMMARY_REVEAL_RATIO_STEP2,
    };
  }

  return {
    revealStartRatio: VIDEO_SUMMARY_REVEAL_DELAY_RATIO,
    revealEndRatio: VIDEO_SUMMARY_REVEAL_DELAY_RATIO + VIDEO_SUMMARY_REVEAL_RATIO,
  };
}

function getSummaryCardRevealProgress(progress: number, stepId: VideoStepId) {
  if (stepId === 1) return 1;

  const start = VIDEO_STEP_PROGRESS_BREAKPOINTS[stepId - 1 as VideoStepId];
  const interval = VIDEO_STEP_PROGRESS_BREAKPOINTS[stepId] - start;
  const { revealStartRatio, revealEndRatio } = getSummaryRevealTiming(stepId);
  const revealStart = start + interval * revealStartRatio;
  const revealEnd = start + interval * revealEndRatio;

  if (progress <= revealStart) return 0;
  if (progress >= revealEnd) return 1;

  return easeInOutSmooth(clamp01((progress - revealStart) / Math.max(revealEnd - revealStart, 0.0001)));
}

function getLeftPanelRevealProgress(progress: number) {
  const end = VIDEO_STEP_PROGRESS_BREAKPOINTS[1];
  const start = end * (1 - VIDEO_LEFT_PANEL_REVEAL_LEAD_RATIO);

  if (progress <= start) return 0;
  if (progress >= end) return 1;

  return easeInOutSmooth(clamp01((progress - start) / Math.max(end - start, 0.0001)));
}

function getSummaryCardCollapseProgress(progress: number, stepId: VideoStepId) {
  if (stepId === 1) return 0;

  const baseStart = VIDEO_STEP_PROGRESS_BREAKPOINTS[stepId - 1 as VideoStepId];
  const baseEnd = VIDEO_STEP_PROGRESS_BREAKPOINTS[stepId];

  let start = baseStart;
  let end = baseEnd;
  let holdStart: number;

  if (stepId === 2) {
    start = VIDEO_STEP2_COLLAPSE_START_PROGRESS;
    end = VIDEO_STEP_PROGRESS_BREAKPOINTS[2];
    holdStart = start;
  } else {
    const interval = end - start;
    const { revealEndRatio } = getSummaryRevealTiming(stepId);
    holdStart = start + interval * (revealEndRatio + VIDEO_SUMMARY_COLLAPSE_GAP_RATIO);
  }

  if (progress <= holdStart) return 0;
  if (progress >= end) return 1;

  return clamp01((progress - holdStart) / Math.max(end - holdStart, 0.0001));
}

function getDetailCardMotion(progress: number, stepId: VideoStepId) {
  if (stepId === 1) {
    return {
      opacity: 0,
      translateY: 72,
      scale: 0.985,
    };
  }

  const start = VIDEO_STEP_PROGRESS_BREAKPOINTS[stepId - 1 as VideoStepId];
  const end = VIDEO_STEP_PROGRESS_BREAKPOINTS[stepId];
  const interval = Math.max(end - start, 0.0001);
  const enterEnd = start + interval * (stepId === 2 ? 0.34 : 0.24);

  if (progress <= start) {
    return {
      opacity: 0,
      translateY: 72,
      scale: 0.985,
    };
  }

  if (progress < enterEnd) {
    const enterProgress = easeInOutSmooth(clamp01((progress - start) / Math.max(enterEnd - start, 0.0001)));

    return {
      opacity: enterProgress,
      translateY: (1 - enterProgress) * 72,
      scale: 0.985 + (0.015 * enterProgress),
    };
  }

  if (stepId === 4) {
    return {
      opacity: 1,
      translateY: 0,
      scale: 1,
    };
  }

  const nextStepId = (stepId + 1) as VideoStepId;
  const nextEnd = VIDEO_STEP_PROGRESS_BREAKPOINTS[nextStepId];
  const exitEnd = end + Math.max(nextEnd - end, 0.0001) * 0.32;

  if (progress <= end) {
    return {
      opacity: 1,
      translateY: 0,
      scale: 1,
    };
  }

  if (progress >= exitEnd) {
    return {
      opacity: 0,
      translateY: -36,
      scale: 0.985,
    };
  }

  const exitProgress = easeInOutSmooth(clamp01((progress - end) / Math.max(exitEnd - end, 0.0001)));

  return {
    opacity: 1 - exitProgress,
    translateY: -36 * exitProgress,
    scale: 1 - (0.015 * exitProgress),
  };
}

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

  const slotStyle = asset.slot === "sweep"
    ? {
      backgroundImage: resolvedPath ? `url("${resolvedPath}")` : "none",
    }
    : {
      backgroundImage: resolvedPath ? `url("${resolvedPath}")` : "none",
      borderColor: withAlpha(accentColor, 0.32),
      boxShadow: `0 20px 48px ${withAlpha(accentColor, 0.08)}`,
    } satisfies CSSProperties;

  return (
    <div
      className={`hero-design-slot hero-design-slot--${asset.slot}`}
      style={slotStyle}
    >
      {asset.slot === "sweep" ? null : (
        <span className="hero-design-slot__label">{asset.label}</span>
      )}
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
      className={`hero-orbit-asset ${asset.pathBase.includes("/labor/") ? "hero-orbit-asset--labor" : ""}${asset.pathBase.includes("/tuition/") ? " hero-orbit-asset--tuition" : ""}${asset.pathBase.includes("/contract/") ? " hero-orbit-asset--contract" : ""}`}
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
      className={`hero-ribbon-asset${asset.pathBase.includes("/tuition/") ? " hero-ribbon-asset--tuition" : ""}${asset.pathBase.includes("/contract/") ? " hero-ribbon-asset--contract" : ""}`}
      style={asset.pathBase.includes("/tuition/")
        ? {
          filter: "drop-shadow(1px 1px 0 rgba(10, 15, 30, 0.5)) drop-shadow(1px 2px 0 rgba(10, 15, 30, 0.4)) drop-shadow(1px 3px 0 rgba(10, 15, 30, 0.3)) drop-shadow(3px 5px 3px rgba(10, 15, 30, 0.26))",
        }
        : undefined}
    />
  );
}

function SweepAssetOverlay({
  asset,
  keywordId,
}: {
  asset: KeywordDecorAsset;
  keywordId: KeywordId;
}) {
  const resolvedPath = useResolvedAssetPath(asset.pathBase);

  if (!resolvedPath) return null;

  return (
    <img
      src={resolvedPath}
      alt=""
      className={`hero-sweep-asset${keywordId === "tuition" ? " hero-sweep-asset--tuition" : ""}${keywordId === "contract" ? " hero-sweep-asset--contract" : ""}`}
      style={keywordId === "tuition"
        ? {
          filter: "drop-shadow(5px 1px 0 rgba(10, 15, 30, 0.5)) drop-shadow(5px 2px 0 rgba(10, 15, 30, 0.4)) drop-shadow(5px 3px 0 rgba(10, 15, 30, 0.3)) drop-shadow(10px 5px 3px rgba(10, 15, 30, 0.26))",
        }
        : keywordId === "contract"
          ? {
            filter: "drop-shadow(5px 1px 0 rgba(10, 15, 30, 0.5)) drop-shadow(5px 2px 0 rgba(10, 15, 30, 0.4)) drop-shadow(5px 3px 0 rgba(10, 15, 30, 0.3)) drop-shadow(10px 5px 3px rgba(10, 15, 30, 0.26))",
          }
          : undefined}
    />
  );
}

function EchoAssetOverlay({
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
      className={`hero-echo-asset${asset.pathBase.includes("/tuition/") ? " hero-echo-asset--tuition" : ""}`}
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
  const sweepAsset = decorAssets.find((asset) => asset.slot === "sweep");
  const echoAsset = decorAssets.find((asset) => asset.slot === "echo");
  const baseDecorAssets = decorAssets.filter((asset) => asset.slot !== "orbit" && asset.slot !== "ribbon" && asset.slot !== "sweep" && asset.slot !== "echo");

  return (
    <div className="hero-title-shell">
      <div className="hero-title-stage" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeItem.id}-decor`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
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
                    initial={{ opacity: 0, y: 36, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 1.015 }}
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
        <p className="mt-5 translate-x-[1.5rem] w-full max-w-[13.2em] self-end whitespace-nowrap text-right text-[clamp(3rem,7.8vw,7.9rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--text-primary)]">
          {HERO_COPY.statement}
        </p>
      </div>

      {orbitAsset ? (
        <div className="hero-title-stage hero-title-stage--overlay" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeItem.id}-orbit`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <RibbonAssetOverlay asset={ribbonAsset} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      {sweepAsset ? (
        <div className="hero-title-stage hero-title-stage--overlay" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeItem.id}-sweep`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <SweepAssetOverlay asset={sweepAsset} keywordId={activeItem.id} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      {echoAsset ? (
        <div className="hero-title-stage hero-title-stage--under-text" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeItem.id}-echo`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <EchoAssetOverlay asset={echoAsset} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

function VideoFrameMedia({
  activeStep,
  reducedMotion,
}: {
  activeStep: VideoStepId;
  reducedMotion: boolean;
}) {
  return (
    <div className="hero-video-frame-media">
      {VIDEO_STEP_SEQUENCE.map((step) => {
        const state = step.id === activeStep
          ? "active"
          : step.id < activeStep
            ? "past"
            : "future";

        return (
          <div
            key={step.id}
            className="hero-video-slot"
            data-state={state}
            data-reduced-motion={reducedMotion ? "true" : "false"}
            style={{ ["--video-step-palette" as string]: step.palette }}
          >
            <video
              className="hero-video-slot__video"
              autoPlay
              muted
              loop={step.id !== 1}
              playsInline
              preload="none"
              aria-hidden="true"
            />
            <div className="hero-video-slot__overlay">
              <span className="hero-video-slot__eyebrow">{step.eyebrow}</span>
              <strong className="hero-video-slot__title">{step.title}</strong>
              <span className="hero-video-slot__caption">
                Placeholder video surface for step {step.id}
              </span>
            </div>
          </div>
        );
      })}
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
  const cooldownTimerRef = useRef<number | null>(null);
  const ctaReturnTimerRef = useRef<number | null>(null);
  const revealUnlockUntilRef = useRef(0);
  const revealIntentRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const idxRef = useRef(0);
  const isCtaDockedRef = useRef(false);
  const wasDockedRef = useRef(false);
  const heroScrollPhaseRef = useRef<HeroScrollPhase>("keyword-sequence");
  const lastLoggedVideoProgressRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoTransition, setVideoTransition] = useState<VideoTransitionState>({ step: 1, direction: 1 });
  const [videoScrollProgress, setVideoScrollProgress] = useState(0);
  const [heroScrollPhase, setHeroScrollPhase] = useState<HeroScrollPhase>("keyword-sequence");
  const [isCtaDocked, setIsCtaDocked] = useState(false);
  const [isCtaPreviewActive, setIsCtaPreviewActive] = useState(false);
  const [isCtaReturning, setIsCtaReturning] = useState(false);
  const [ctaWidth, setCtaWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const reducedMotion = Boolean(useReducedMotion());
  useHeroLenisControl(heroScrollPhase);

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
    if (isCtaDocked) wasDockedRef.current = true;
  }, [isCtaDocked]);

  useEffect(() => {
    heroScrollPhaseRef.current = heroScrollPhase;
  }, [heroScrollPhase]);

  useEffect(() => {
    if (heroScrollPhase !== "cta-docked") return;

    const delay = Math.max(0, revealUnlockUntilRef.current - window.performance.now());
    const timer = window.setTimeout(() => {
      if (isCtaDockedRef.current) {
        setHeroScrollPhase("free-scroll");
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [heroScrollPhase]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      if (ctaReturnTimerRef.current) {
        clearTimeout(ctaReturnTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useLayoutEffect(() => {
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
    if (viewportHeight === 0 || ctaWidth === 0) return;

    const refreshId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
    };
  }, [ctaWidth, viewportHeight]);

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
    const scheduleCooldown = () => {
      cooldownRef.current = true;
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }

      cooldownTimerRef.current = window.setTimeout(() => {
        cooldownRef.current = false;
      }, KEYWORD_COOLDOWN_MS);
    };
    const resetDockedState = () => {
      isCtaDockedRef.current = false;
      setIsCtaDocked(false);
      setIsCtaPreviewActive(false);
      setHeroScrollPhase("keyword-sequence");
    };
    const dockCta = (unlockAt: number) => {
      revealIntentRef.current = 0;
      if (ctaReturnTimerRef.current) {
        clearTimeout(ctaReturnTimerRef.current);
      }
      setIsCtaReturning(false);
      isCtaDockedRef.current = true;
      setIsCtaDocked(true);
      revealUnlockUntilRef.current = unlockAt;
      setHeroScrollPhase("cta-docked");
    };
    const releaseDockedCta = () => {
      resetDockedState();
      if (ctaReturnTimerRef.current) {
        clearTimeout(ctaReturnTimerRef.current);
      }
      setIsCtaReturning(true);
      ctaReturnTimerRef.current = window.setTimeout(() => {
        setIsCtaReturning(false);
      }, CTA_RETURN_SEQUENCE_MS);
      scheduleCooldown();
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

      scheduleCooldown();

      if (nextIndex === LAST_KEYWORD_INDEX && direction === 1) {
        revealUnlockUntilRef.current = window.performance.now() + LAST_KEYWORD_SETTLE_MS;
        revealIntentRef.current = 0;
        syncHeaderVisibility(true);
      }

      if (nextIndex !== LAST_KEYWORD_INDEX) {
        resetDockedState();
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

          dockCta(now + CTA_DOCKED_SCROLL_UNLOCK_MS);
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
          releaseDockedCta();
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

          dockCta(now + CTA_DOCKED_SCROLL_UNLOCK_MS);
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
          releaseDockedCta();
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
      const returningFromDock = wasDockedRef.current;
      wasDockedRef.current = false;

      gsap.killTweensOf([heroContainer, titleBlock, heroStage, aura, nextSectionBg].filter(Boolean));

      if (returningFromDock) {
        gsap.set(heroContainer, { opacity: 0, visibility: "visible" });
        gsap.set(titleBlock, { y: -32, scale: 0.92, opacity: 0, filter: "blur(16px)" });
        gsap.set(heroStage, { opacity: 0 });
        if (aura) gsap.set(aura, { opacity: 0 });
        if (nextSectionBg) gsap.set(nextSectionBg, { opacity: 1 });

        const fadeIn = gsap.timeline({
          defaults: { duration: 0.6, ease: "power2.out" },
        });

        fadeIn
          .to(heroContainer, { opacity: 1 }, 0)
          .to(titleBlock, {
            y: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
          }, 0)
          .to(heroStage, { opacity: 1 }, 0);

        if (aura) {
          fadeIn.to(aura, { opacity: AURA_OPACITIES[activeIndex] }, 0);
        }
        if (nextSectionBg) {
          fadeIn.to(nextSectionBg, { opacity: 0 }, 0);
        }

        return () => {
          fadeIn.kill();
        };
      }

      gsap.set(heroContainer, { opacity: 1, visibility: "visible" });
      gsap.set(titleBlock, { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" });
      gsap.set(heroStage, { opacity: 1 });
      if (aura) gsap.set(aura, { opacity: AURA_OPACITIES[activeIndex] });
      if (nextSectionBg) gsap.set(nextSectionBg, { opacity: 0 });
      return;
    }

    const fadeTargets = [heroContainer, titleBlock, heroStage, aura, nextSectionBg].filter(Boolean);
    gsap.killTweensOf(fadeTargets);

    const tween = gsap.timeline({
      defaults: {
        duration: 0.5,
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

  useEffect(() => {
    const nextSection = nextSectionRef.current;

    if (!nextSection || activeIndex !== LAST_KEYWORD_INDEX || !isCtaDocked) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: nextSection,
      start: "top top",
      end: `+=${VIDEO_STAGE_PIN_SCROLL}`,
      scrub: reducedMotion ? false : 0.12,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const { progress } = self;
        setVideoScrollProgress(progress);
        const nextStep = getVideoStepFromProgress(progress);

        if (process.env.NODE_ENV !== "production") {
          const roundedProgress = Math.round(progress * 100) / 100;

          if (lastLoggedVideoProgressRef.current !== roundedProgress) {
            lastLoggedVideoProgressRef.current = roundedProgress;
            console.info("[HeroStory][ScrollTrigger]", {
              progress: roundedProgress,
              rawProgress: Number(progress.toFixed(4)),
              step: nextStep,
              scroll: Math.round(self.scroll()),
            });
          }
        }

        setVideoTransition((current) => (
          current.step === nextStep
            ? current
            : {
              step: nextStep,
              direction: nextStep > current.step ? 1 : -1,
            }
        ));
      },
      onLeaveBack: () => {
        lastLoggedVideoProgressRef.current = null;
        setVideoScrollProgress(0);
        setVideoTransition({ step: 1, direction: -1 });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [activeIndex, isCtaDocked, reducedMotion]);

  useEffect(() => {
    if (activeIndex !== LAST_KEYWORD_INDEX || !isCtaDocked) {
      lastLoggedVideoProgressRef.current = null;
      setVideoScrollProgress(0);
    }
  }, [activeIndex, isCtaDocked]);

  const activeItem = useMemo(() => keywordStates[activeIndex], [activeIndex]);
  const resolvedVideoStep = activeIndex === LAST_KEYWORD_INDEX && isCtaDocked
    ? videoTransition.step
    : 1;
  const leftPanelRevealProgress = activeIndex === LAST_KEYWORD_INDEX && isCtaDocked
    ? getLeftPanelRevealProgress(videoScrollProgress)
    : 0;
  const stackedVideoSteps = useMemo(
    () => VIDEO_STEP_SEQUENCE.filter((step) => step.id >= SHOW_SIDE_PANELS_FROM_STEP),
    [],
  );
  const showSidePanels = leftPanelRevealProgress > 0.001;

  const isMobile = viewportWidth > 0 ? viewportWidth < 640 : false;
  const frameWidthBoost = isMobile ? 24 : 40;
  const frameHeightBoost = isMobile ? 28 : 44;
  const baseFrameHeight = viewportHeight > 0
    ? viewportHeight * (isMobile ? MOBILE_FRAME_HEIGHT_RATIO : DESKTOP_FRAME_HEIGHT_RATIO)
    : (isMobile ? 520 : 640);
  const frameHeight = Math.max(baseFrameHeight, isMobile ? 420 : 560) + frameHeightBoost;
  const centerFrameWidth = Math.max(
    ctaWidth + (isMobile ? 32 : 48),
    isMobile ? 296 : 360,
  ) + frameWidthBoost;
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
  const videoStoryLayoutStyle = {
    ["--video-layout-height" as string]: `${frameHeight}px`,
  } satisfies CSSProperties;
  const ctaShellStyle = {
    ["--cta-shell-top" as string]: `${ctaShellTop}px`,
    ["--cta-shell-docked-top" as string]: `${ctaDockedTop}px`,
    ["--cta-shell-shift" as string]: isCtaDocked
      ? `${ctaDockedTop - ctaShellTop}px`
      : "0px",
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
        className={`hero-cta-shell ${isCtaDocked ? "hero-cta-shell--docked" : ""} ${isCtaReturning ? "hero-cta-shell--returning" : ""}`}
        style={ctaShellStyle}
      >
        <button
          ref={ctaRef}
          className={`cta-btn ${isCtaDocked ? "cta-btn--docked" : ""} ${isCtaPreviewActive ? "cta-btn--preview" : ""} ${isCtaReturning ? "cta-btn--returning" : ""}`}
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

          <div className="hero-video-story-layout relative z-10" style={videoStoryLayoutStyle}>
            <div
              className={`hero-video-side hero-video-side--left ${showSidePanels ? "is-visible" : ""}`}
              aria-hidden={!showSidePanels}
              style={{ ["--left-panel-reveal" as string]: leftPanelRevealProgress.toFixed(4) }}
            >
              {stackedVideoSteps.map((step, index) => {
                const summaryReveal = getSummaryCardRevealProgress(videoScrollProgress, step.id);
                const summaryCollapse = getSummaryCardCollapseProgress(videoScrollProgress, step.id);
                const state = step.id === resolvedVideoStep
                  ? "active"
                  : step.id < resolvedVideoStep
                    ? "past"
                    : "future";

                return (
                  <article
                    key={step.id}
                    className="hero-video-note hero-video-note--summary"
                    data-state={state}
                    data-step-id={step.id}
                    style={{
                      ["--video-summary-bg" as string]: VIDEO_SUMMARY_COLORS[index] ?? VIDEO_SUMMARY_COLORS[0],
                      ["--summary-reveal" as string]: summaryReveal.toFixed(4),
                      ["--summary-reveal-opacity" as string]: summaryReveal.toFixed(4),
                      ["--summary-collapse" as string]: summaryCollapse.toFixed(4),
                      ["--summary-reveal-offset-y" as string]: step.id === 2 ? "320px" : "72px",
                    }}
                  >
                    <div className="hero-video-note__summary-topline">
                      <span className="hero-video-note__eyebrow">{step.eyebrow}</span>
                      <SummaryIconSlot stepId={step.id} />
                    </div>
                    <div className="hero-video-note__summary-copy">
                      <p className="hero-video-note__text">{step.summary}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hero-video-story-layout__center">
              <div ref={frameRef} className="hero-next-shell-frame" style={nextFrameStyle}>
                <div className="hero-next-shell-frame__surface" />
                <VideoFrameMedia activeStep={resolvedVideoStep} reducedMotion={reducedMotion} />
              </div>
            </div>

            <div
              className={`hero-video-side hero-video-side--right ${showSidePanels ? "is-visible" : ""}`}
              aria-hidden={!showSidePanels}
            >
              {showSidePanels
                ? stackedVideoSteps.map((step) => {
                    const detailMotion = getDetailCardMotion(videoScrollProgress, step.id);

                    return (
                      <article
                        key={step.id}
                        className="hero-video-note hero-video-note--detail"
                        data-state={step.id === resolvedVideoStep ? "active" : step.id < resolvedVideoStep ? "past" : "future"}
                        style={{
                          ["--detail-opacity" as string]: detailMotion.opacity.toFixed(4),
                          ["--detail-translate-y" as string]: `${detailMotion.translateY.toFixed(2)}px`,
                          ["--detail-scale" as string]: detailMotion.scale.toFixed(4),
                          zIndex: step.id === resolvedVideoStep ? 3 : step.id < resolvedVideoStep ? 1 : 2,
                        }}
                      >
                        <span className="hero-video-note__eyebrow">{step.eyebrow}</span>
                        <h3 className="hero-video-note__title">{step.title}</h3>
                        <p className="hero-video-note__text">{step.detail}</p>
                      </article>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      </section>

      {/* TODO: This is the third section in the current UX flow. Refine the section naming/content together if the reviews concept changes again. */}
      <ReviewsSection />

      <section className="relative z-40 min-h-svh border-4 border-blue-500 bg-white px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-6xl items-center justify-center sm:min-h-[calc(100svh-8rem)]">
          <p className="text-center text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">
            이곳은 네번째 섹션입니다.
          </p>
        </div>
      </section>
    </section>
  );
}
