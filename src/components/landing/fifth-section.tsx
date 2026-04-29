"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SixthSectionShell,
  SixthSectionPreviewSurface,
} from "@/components/landing/sixth-section";

type SequenceCard = {
  title: string;
  description: string;
  visual: "fees" | "mileage" | "shop" | "vat" | "magazine";
};

const SEQUENCE_CARDS: SequenceCard[] = [
  {
    title: "타사 대비 부담 낮은 수수료",
    description:
      "기본 수수료는 3.5% 수준으로 설계되어 있고, 빠른 이체가 필요한 경우에도 4.0% 안에서 이용할 수 있다는 메시지를 담은 카드입니다.",
    visual: "fees",
  },
  {
    title: "이용 금액 따라 마일리지 적립",
    description:
      "계약 진행 금액에 비례해 마일리지가 쌓이도록 구성해, 결제 이후에도 혜택이 계속 이어지는 구조를 보여주는 더미 카드입니다.",
    visual: "mileage",
  },
  {
    title: "마일리지로 이어지는 전용 샵",
    description:
      "적립된 마일리지를 활용해 다양한 기프티콘을 교환할 수 있는 마일리지 샵 운영 예시를 담은 카드입니다.",
    visual: "shop",
  },
  {
    title: "부가세 공제 처리까지 간편하게",
    description:
      "사업자 카드 결제 내역을 기준으로 별도 세금계산서 없이도 부가세 공제 흐름을 이어갈 수 있다는 점을 설명하는 더미 카드입니다.",
    visual: "vat",
  },
  {
    title: "금융과 시사를 쉽게 보는 매거진",
    description:
      "금융, 경제, 시사 이슈를 더 쉽게 이해할 수 있도록 풀어주는 페이몽 매거진의 더미 콘텐츠 영역입니다.",
    visual: "magazine",
  },
];

const DEFAULT_MASK_PATH =
  "M 30 170 C 20 170 15 165 15 155 V 60 C 15 45 25 35 40 35 C 48 35 55 40 60 48 L 100 110 L 140 48 C 145 40 152 35 160 35 C 175 35 185 45 185 60 V 155 C 185 165 180 170 170 170 C 160 170 155 165 155 155 V 85 L 115 145 C 108 155 92 155 85 145 L 45 85 V 155 C 45 165 40 170 30 170 Z";
const HEADER_PREVIEW_LOGO_SYNC_EVENT = "paymong:header-preview-logo-sync";

function SequenceCardVisual({
  visual,
}: {
  visual: SequenceCard["visual"];
}) {
  if (visual === "fees") {
    return (
      <div className="flex h-full flex-col rounded-[1.8rem] border border-black/5 bg-[#f8f9fb] p-5">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_28px_rgba(10,15,30,0.06)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Fee compare
          </div>
          <div className="mt-4 space-y-4">
            {[
              ["PAYMONG", "3.5%", "#3B6FF5", "w-[42%]"],
              ["FAST TRANSFER", "4.0%", "#73DAFF", "w-[48%]"],
              ["OTHERS", "5.5%", "#E5E7EB", "w-[68%]"],
            ].map(([label, value, color, width]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className={`h-3 rounded-full ${width}`} style={{ backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-[1.5rem] bg-[#0A0F1E] px-5 py-5 text-white shadow-[0_18px_36px_rgba(10,15,30,0.18)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Summary
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.05em]">합리적인 수수료 구조</div>
          <p className="mt-2 text-sm leading-[1.7] text-white/65">
            동일한 계약 흐름 안에서도 비용 부담을 낮추는 점을 직관적으로 보여주기 위한 예시 영역입니다.
          </p>
        </div>
      </div>
    );
  }

  if (visual === "mileage") {
    return (
      <div className="flex h-full flex-col rounded-[1.8rem] border border-black/5 bg-[#f8f9fb] p-5">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_28px_rgba(10,15,30,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Mileage
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-950">+28,400P</div>
            </div>
            <div className="rounded-full bg-[#E9F4FF] px-3 py-1 text-xs font-semibold text-[#3B6FF5]">
              누적 적립
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["월세", "교육비", "인건비"].map((label) => (
              <div
                key={label}
                className="rounded-[1.2rem] bg-[#F8FBFF] px-3 py-4 text-center shadow-[inset_0_0_0_1px_rgba(59,111,245,0.08)]"
              >
                <div className="text-xs font-semibold text-slate-400">{label}</div>
                <div className="mt-1 text-base font-semibold tracking-[-0.04em] text-slate-900">+1.2%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-1 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#EAF6FF] to-[#F7FCFF]">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-12 w-12 rounded-full bg-white shadow-[0_10px_22px_rgba(10,15,30,0.08)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual === "shop") {
    return (
      <div className="flex h-full flex-col rounded-[1.8rem] border border-black/5 bg-[#f8f9fb] p-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            ["커피", "3,000P"],
            ["편의점", "5,000P"],
            ["배달", "8,000P"],
            ["영화", "12,000P"],
          ].map(([label, point]) => (
            <div
              key={label}
              className="rounded-[1.35rem] bg-white p-4 shadow-[0_10px_24px_rgba(10,15,30,0.06)]"
            >
              <div className="mb-3 h-20 rounded-[1rem] bg-gradient-to-br from-[#FFE7C2] to-[#FFF5E9]" />
              <div className="text-sm font-semibold text-slate-900">{label} 기프티콘</div>
              <div className="mt-1 text-xs font-semibold text-[#3B6FF5]">{point}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-[1.5rem] bg-[#0A0F1E] px-5 py-5 text-white shadow-[0_18px_36px_rgba(10,15,30,0.18)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Shop note
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.05em]">마일리지 활용처까지 연결</div>
          <p className="mt-2 text-sm leading-[1.7] text-white/65">
            단순 적립에 그치지 않고 실제 교환 경험까지 이어지는 구조를 보여주는 예시 화면입니다.
          </p>
        </div>
      </div>
    );
  }

  if (visual === "vat") {
    return (
      <div className="flex h-full flex-col rounded-[1.8rem] border border-black/5 bg-[#f8f9fb] p-5">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_28px_rgba(10,15,30,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                VAT flow
              </div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.05em] text-slate-950">
                자동 과세자료 제출
              </div>
            </div>
            <div className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-emerald-600">
              처리 완료
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              "사업자 카드 결제 내역 수집",
              "국세청 제출 데이터 정리",
              "별도 계산서 없이 공제 흐름 연결",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <BadgeCheck size={16} className="text-[#3B6FF5]" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-white/75 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Tax note</div>
          <p className="mt-2 text-sm leading-[1.75] text-slate-500">
            결제 이후 세무 처리까지 한 번에 이어지는 경험을 보여주기 위해 만든 더미 설명 영역입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[1.8rem] border border-black/5 bg-[#f8f9fb] p-5">
      <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_28px_rgba(10,15,30,0.06)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Magazine</div>
        <div className="mt-4 space-y-3">
          {[
            "금융 이슈를 한 장으로 정리한 카드 뉴스",
            "경제 흐름을 쉽게 읽는 주간 브리핑",
            "시사 키워드를 풀어내는 페이몽 매거진",
          ].map((label, index) => (
            <div key={label} className="rounded-[1.2rem] bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold text-slate-300">Article 0{index + 1}</div>
              <div className="mt-2 text-sm font-semibold leading-[1.5] text-slate-800">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-1 items-center justify-center rounded-[1.5rem] bg-[#0A0F1E] px-5 py-5 text-white shadow-[0_18px_36px_rgba(10,15,30,0.18)]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Insight</div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.05em]">쉽게 읽는 금융 콘텐츠</div>
          <p className="mt-2 text-sm leading-[1.7] text-white/65">
            복잡한 금융과 시사 이슈를 더 쉽게 풀어내는 콘텐츠 운영 영역을 상정한 더미 카드입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  card,
}: {
  card: SequenceCard;
}) {
  return (
    <article className="flex h-[460px] w-[300px] shrink-0 flex-col overflow-hidden rounded-[1.6rem] border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:h-[500px] sm:w-[360px] sm:rounded-[2rem] sm:p-8 md:w-[420px]">
      <h3 className="text-2xl font-semibold tracking-[-0.05em] text-slate-950">{card.title}</h3>
      <p className="mt-2 text-[1rem] leading-[1.7] text-slate-500">{card.description}</p>
      <div className="mt-6 min-h-0 flex-1">
        <SequenceCardVisual visual={card.visual} />
      </div>
    </article>
  );
}

export function FifthSection() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const maskGroupRef = useRef<SVGGElement | null>(null);
  const maskPathRef = useRef<SVGPathElement | null>(null);
  const maskHoleRef = useRef<SVGCircleElement | null>(null);
  const maskCenterRef = useRef({ x: 100, y: 102.5 });
  const [maskPathData, setMaskPathData] = useState(DEFAULT_MASK_PATH);
  const [maskCenter, setMaskCenter] = useState({ x: 100, y: 102.5 });

  useEffect(() => {
    let isCancelled = false;

    const loadMaskShape = async () => {
      try {
        const response = await fetch("/design/fifth-section/mask-shape.svg");
        if (!response.ok) return;

        const svgText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        const path = doc.querySelector("path");
        const d = path?.getAttribute("d");

        if (!svg || !d || isCancelled) return;

        const viewBox = svg.getAttribute("viewBox");
        if (viewBox) {
          const [minX, minY, width, height] = viewBox.split(/[\s,]+/).map(Number);
          if ([minX, minY, width, height].every((value) => Number.isFinite(value))) {
            const nextCenter = {
              x: minX + width / 2,
              y: minY + height / 2,
            };
            maskCenterRef.current = nextCenter;
            setMaskCenter(nextCenter);
          }
        }

        setMaskPathData(d);
      } catch {
        // Keep built-in fallback mask shape.
      }
    };

    loadMaskShape();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    const heroText = heroTextRef.current;
    const cardsContainer = cardsContainerRef.current;
    const maskGroup = maskGroupRef.current;
    const maskPath = maskPathRef.current;
    const maskHole = maskHoleRef.current;

    if (!wrapper || !track || !heroText || !cardsContainer || !maskGroup || !maskPath || !maskHole) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    // Track the last "real" width so iOS Safari URL bar toggles (height-only
    // resize) don't trigger ScrollTrigger.refresh — the mask strokeWidth/hole
    // radius use innerHeight via `invalidateOnRefresh`, and refreshing on each
    // URL bar tick causes visible jitter while scrolling.
    let lastStableWidth = window.innerWidth;

    const updateMaskPosition = (x: number, y: number) => {
      const { x: centerX, y: centerY } = maskCenterRef.current;
      gsap.set(maskGroup, {
        x: x - centerX,
        y: y - centerY,
        transformOrigin: "50% 50%",
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      updateMaskPosition(targetX, targetY);
    };

    const handleResize = () => {
      const nextWidth = window.innerWidth;
      const widthChanged = Math.abs(nextWidth - lastStableWidth) > 24;

      if (targetX === nextWidth / 2) {
        targetX = nextWidth / 2;
        targetY = window.innerHeight / 2;
      }

      updateMaskPosition(targetX, targetY);

      if (widthChanged) {
        lastStableWidth = nextWidth;
        ScrollTrigger.refresh();
      }
    };

    updateMaskPosition(targetX, targetY);

    const ctx = gsap.context(() => {
      let lastPreviewActive = false;
      let maskStartProgress = 1;
      const getStartOffset = () => Math.max(160, window.innerWidth * 0.34);
      const getMoveDistance = () => {
        const dist = track.scrollWidth - window.innerWidth + 96;
        return dist > 0 ? -dist : 0;
      };

      gsap.set(maskGroup, { scale: 0 });
      gsap.set(maskPath, { strokeWidth: 0 });
      gsap.set(maskHole, {
        attr: {
          cx: maskCenterRef.current.x,
          cy: maskCenterRef.current.y,
          r: 0,
        },
      });
      gsap.set(track, { x: getStartOffset() });
      gsap.set(heroText, { opacity: 1, y: 0, scale: 1 });
      gsap.set(cardsContainer, { y: window.innerHeight });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const previewActive = self.progress >= maskStartProgress;

            if (previewActive === lastPreviewActive) {
              return;
            }

            lastPreviewActive = previewActive;
            window.dispatchEvent(
              new CustomEvent(HEADER_PREVIEW_LOGO_SYNC_EVENT, {
                detail: { active: previewActive },
              }),
            );
          },
        },
      });

      timeline
        .to(
          heroText,
          {
            y: -150,
            opacity: 0,
            scale: 0.95,
            ease: "power1.inOut",
            duration: 1,
          },
          0,
        )
        .to(
          cardsContainer,
          {
            y: 0,
            duration: 1.5,
            ease: "power2.out",
          },
          0.2,
        )
        .to(
          track,
          {
            x: () => getMoveDistance(),
            ease: "none",
            duration: 4,
          },
          "+=0.2",
        )
        .add("maskStart")
        .to(
          maskGroup,
          {
            scale: 5,
            ease: "power2.out",
            duration: 1.2,
          },
          ">+=0.12",
        )
        .add("inflate", "-=0.5")
        .to(
          maskPath,
          {
            strokeWidth: () => Math.max(window.innerWidth, window.innerHeight) * 0.8,
            ease: "power2.inOut",
            duration: 1.5,
          },
          "inflate",
        )
        .to(
          maskHole,
          {
            attr: { r: () => Math.max(window.innerWidth, window.innerHeight) * 0.5 },
            ease: "power2.inOut",
            duration: 1.5,
          },
          "inflate",
        )
        .to({}, { duration: 1.5 });

      maskStartProgress = timeline.labels.maskStart / timeline.totalDuration();
    }, wrapper);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    ScrollTrigger.refresh();

    return () => {
      window.dispatchEvent(
        new CustomEvent(HEADER_PREVIEW_LOGO_SYNC_EVENT, {
          detail: { active: false },
        }),
      );
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [maskPathData]);

  return (
    <div ref={wrapperRef} className="relative z-40 h-[600vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <section className="hero-video-stage-background absolute inset-0 z-10">
          <div
            ref={heroTextRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 pt-10 text-center"
          >
            <div className="mb-4 sm:mb-6">
              <span className="text-sm font-medium tracking-wide text-slate-500 sm:text-base">
                다른 곳에선 찾을 수 없는
              </span>
            </div>
            <h2 className="text-[clamp(2.4rem,8vw,7.4rem)] font-semibold leading-[0.95] tracking-[-0.08em] text-black">
              오직 페이몽에서만
            </h2>
          </div>

          <div
            ref={cardsContainerRef}
            className="absolute left-0 top-1/2 z-20 h-[540px] w-full"
          >
            <div className="absolute top-0 h-full w-full -translate-y-1/2">
                <div ref={trackRef} className="flex h-full w-max items-center gap-6 px-12 will-change-transform">
                {SEQUENCE_CARDS.map((card) => (
                  <FeatureCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <svg className="absolute inset-0 z-20 h-full w-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <mask
              id="paymong-sixth-mask"
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
            >
              <rect x="-5000" y="-5000" width="10000" height="10000" fill="black" />
              <g ref={maskGroupRef}>
                <circle
                  ref={maskHoleRef}
                  cx={maskCenter.x}
                  cy={maskCenter.y}
                  r="0"
                  fill="white"
                />
                <path
                  ref={maskPathRef}
                  d={maskPathData}
                  fill="white"
                  stroke="white"
                  strokeWidth="0"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            </mask>
          </defs>

          <foreignObject x="0" y="0" width="100%" height="100%" mask="url(#paymong-sixth-mask)">
            <div className="h-full w-full">
              <SixthSectionShell
                style={{
                  backgroundSize: "100% 200vh",
                  backgroundPosition: "0 0",
                }}
              >
                <SixthSectionPreviewSurface />
              </SixthSectionShell>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
