"use client";

import { useCallback, useEffect, useRef } from "react";
import { Calendar, Star, Wallet } from "lucide-react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { useViewport } from "@/lib/use-viewport";

type ReviewItem = {
  author: string;
  review: string;
  date: string;
  amount: string;
  stars: number;
};

type ReviewKeywordPill = {
  label: string;
  backgroundColor: string;
};

const REVIEW_DATA: ReviewItem[] = [
  { author: "임xx", review: "최고의 경험이었습니다. 다음에도 꼭 다시 이용하고 싶은 서비스입니다.", date: "2024.03.27", amount: "8,600만", stars: 5 },
  { author: "김xx", review: "상담부터 계약까지 정말 빠르고 친절했어요. 강력 추천합니다.", date: "2024.04.12", amount: "5,200만", stars: 5 },
  { author: "박xx", review: "복잡한 절차를 깔끔하게 정리해주셔서 너무 편했습니다.", date: "2024.05.08", amount: "7,100만", stars: 5 },
  { author: "최xx", review: "걱정이 많았는데 페이몽 덕분에 안심하고 진행할 수 있었어요.", date: "2024.06.15", amount: "6,400만", stars: 5 },
  { author: "이xx", review: "주변에 이미 세 번이나 추천했습니다. 믿고 맡길 수 있어요.", date: "2024.07.03", amount: "9,300만", stars: 5 },
  { author: "정xx", review: "처음이라 불안했는데 하나하나 설명해주셔서 감사했습니다.", date: "2024.08.20", amount: "4,700만", stars: 5 },
  { author: "한xx", review: "빠른 응대와 꼼꼼한 처리, 두 마리 토끼를 다 잡은 서비스예요.", date: "2024.09.11", amount: "8,900만", stars: 5 },
  { author: "윤xx", review: "비용 대비 만족도가 정말 높았습니다. 또 이용할게요.", date: "2024.10.05", amount: "5,800만", stars: 4 },
  { author: "조xx", review: "계약 전 과정에서 전문성이 느껴졌습니다. 감사합니다.", date: "2024.11.22", amount: "7,600만", stars: 5 },
];

const REVIEW_KEYWORD_PILLS: ReviewKeywordPill[] = [
  { label: "\uC6D4\uC138", backgroundColor: "#0038F1" },
  { label: "\uAD50\uC721\uBE44", backgroundColor: "#00ABFF" },
  { label: "\uC778\uAC74\uBE44", backgroundColor: "#5D62FF" },
  { label: "\uC774\uC0AC\uBE44", backgroundColor: "#8423FE" },
];

const ITEM_SPACING = 220;
const ITEM_SPACING_COMPACT = 175;
const COMPACT_CARD_MAX_WIDTH = 640;
const CARD_STAGE_HEIGHT = 500;
const AUTO_ROTATE_SPEED = 1.2;
const SCROLL_MULTIPLIER = 1.2;
const CARD_CENTER = CARD_STAGE_HEIGHT / 2;

function getStablePillIndex(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % REVIEW_KEYWORD_PILLS.length;
}

export function ReviewsSection() {
  const reducedMotion = useHydratedReducedMotion();
  const { width: viewportWidth } = useViewport();
  const isCompactCard = viewportWidth <= COMPACT_CARD_MAX_WIDTH;
  const itemSpacing = isCompactCard ? ITEM_SPACING_COMPACT : ITEM_SPACING;
  const loopHeight = REVIEW_DATA.length * itemSpacing;
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoOffset = useRef(0);
  const scrollOffset = useRef(0);

  const updateCards = useCallback(() => {
    const currentOffset = scrollOffset.current * SCROLL_MULTIPLIER + (reducedMotion ? 0 : autoOffset.current);

    for (let index = 0; index < REVIEW_DATA.length; index++) {
      const el = cardRefs.current[index];
      if (!el) continue;

      const basePos = index * itemSpacing;
      let yOffset = (basePos - currentOffset) % loopHeight;
      if (yOffset < 0) yOffset += loopHeight;
      yOffset -= (loopHeight / 2) - CARD_CENTER;

      const distanceFromCenter = Math.abs(yOffset - CARD_CENTER);
      const opacity = Math.max(0, 1 - (distanceFromCenter / 500));
      // Desktop: active card swings -60px (leftward) for parallax. Mobile uses
      // a flat horizontal anchor so the wider full-width stage doesn't leave
      // cards leaning hard to the left.
      const shiftX = isCompactCard
        ? 0
        : -(Math.max(0, 1 - distanceFromCenter / 300)) * 60;

      el.style.transform = `translateX(${shiftX}px) translateY(${yOffset - CARD_CENTER}px)`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round(100 - distanceFromCenter));
    }
  }, [reducedMotion, itemSpacing, loopHeight, isCompactCard]);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (section) scrollOffset.current = window.scrollY - section.offsetTop;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const tick = () => {
      if (!reducedMotion) {
        autoOffset.current += AUTO_ROTATE_SPEED;
        if (autoOffset.current >= loopHeight) autoOffset.current -= loopHeight;
      }
      updateCards();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, updateCards, loopHeight]);

  return (
    <section
      id="section3"
      ref={sectionRef}
      className="reviews-section-background section-two-onward-font relative z-40 min-h-svh w-full overflow-hidden bg-white px-6 py-10 text-slate-900 sm:px-10 sm:py-12 lg:h-svh lg:px-24"
    >
      <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-20">
        <div className="relative z-[110] mx-auto w-full max-w-xl space-y-6 text-center sm:space-y-8 lg:mx-0 lg:text-left">
          <h2 className="text-4xl font-bold leading-[0.96] tracking-[-0.08em] text-slate-900 sm:text-6xl sm:leading-[0.94] lg:text-7xl">
            고객님들의
            <br />
            정직한 후기입니다.
          </h2>
          <p className="mx-auto max-w-lg text-base font-light leading-relaxed text-slate-500 sm:text-xl lg:mx-0">
            이미 00,000명 이상의 고객님들이 페이몽을 통해 계약을 완료하셨습니다.
          </p>
          <button
            className="cta-paymong group overflow-hidden rounded-full px-8 py-3 text-base font-bold sm:px-12 sm:py-4 sm:text-lg lg:px-16 lg:py-5 lg:text-xl"
            style={{ backgroundColor: "#3B6FF5" }}
          >
            <span className="cta-paymong__bg-fill rounded-full" />
            <span className="cta-paymong__text-box">
              <span className="cta-paymong__text-wrapper">
                <span className="cta-paymong__text-top" style={{ color: "#ffffff" }}>더 많은 후기 보러가기 →</span>
                <span className="cta-paymong__text-bottom">더 많은 후기 보러가기 →</span>
              </span>
            </span>
          </button>
        </div>

        <div className="relative flex h-full items-center justify-center" style={{ perspective: "1000px" }}>
          <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden sm:max-w-md lg:overflow-visible">
            {REVIEW_DATA.map((item, index) => {
              const pill = REVIEW_KEYWORD_PILLS[getStablePillIndex(`${item.author}-${item.date}`)];

              return (
                <div
                  key={item.author + item.date}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="absolute w-full cursor-pointer"
                  style={{ willChange: "transform, opacity" }}
                >
                  <div className="rounded-3xl border border-black/[0.04] bg-white px-4 py-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.08),0_6px_14px_rgba(0,0,0,0.04)] sm:rounded-[2.5rem] sm:px-8 sm:py-[1.4rem] sm:shadow-[0_20px_50px_rgba(0,0,0,0.12),0_8px_20px_rgba(0,0,0,0.06)]">
                    {/* 상단: 별점 + 작성자 */}
                    <div className="mb-2 flex items-center justify-between sm:mb-3">
                      <div className="flex gap-[3px]">
                        {Array.from({ length: item.stars }).map((_, i) => (
                          <Star key={i} className="h-[13px] w-[13px] sm:h-4 sm:w-4" fill="#fb923c" color="#fb923c" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-[0.45rem]">
                        <span className="rounded-full border border-black/[0.04] bg-slate-50 px-2 py-[3px] text-[11px] font-medium text-slate-500 sm:px-4 sm:py-[0.3rem] sm:text-[0.8125rem]">
                          {item.author}
                        </span>
                        <span
                          className="rounded-full px-2 py-[3px] text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(10,15,30,0.12)] sm:px-[0.95rem] sm:py-[0.3rem] sm:text-[0.8125rem]"
                          style={{ backgroundColor: pill.backgroundColor }}
                        >
                          {pill.label}
                        </span>
                      </div>
                    </div>

                    {/* 본문 */}
                    <p className="mb-2 break-keep text-[0.92rem] font-bold leading-[1.5] text-slate-800 sm:mb-3 sm:text-[1.1rem] sm:leading-relaxed">
                      &ldquo;{item.review}&rdquo;
                    </p>

                    {/* 구분선 */}
                    <div className="mb-1.5 h-px w-full bg-slate-100 sm:mb-[0.6rem]" />

                    {/* 하단: 날짜 + 금액 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 sm:gap-[0.4rem]">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" color="#cbd5e1" />
                        <span className="text-[11px] sm:text-[0.8125rem]">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-[0.4rem]">
                        <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5" color="#93c5fd" />
                        <span className="text-[11px] font-bold text-[#3B6FF5] sm:text-[0.8125rem]">{item.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
