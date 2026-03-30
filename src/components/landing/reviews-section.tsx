"use client";

import { useCallback, useEffect, useRef } from "react";
import { Calendar, Star, Wallet } from "lucide-react";
import { useReducedMotion } from "framer-motion";

type ReviewItem = {
  author: string;
  review: string;
  date: string;
  amount: string;
  stars: number;
};

const REVIEW_DATA: ReviewItem[] = [
  { author: "임xx", review: "최고의 경험이었습니다. 다음에도 꼭 다시 이용하고 싶은 서비스입니다.", date: "2024.03.27", amount: "6억 8,000만", stars: 5 },
  { author: "김xx", review: "상담부터 계약까지 정말 빠르고 친절했어요. 강력 추천합니다.", date: "2024.04.12", amount: "3억 2,000만", stars: 5 },
  { author: "박xx", review: "복잡한 절차를 깔끔하게 정리해주셔서 너무 편했습니다.", date: "2024.05.08", amount: "5억 1,000만", stars: 5 },
  { author: "최xx", review: "걱정이 많았는데 페이몽 덕분에 안심하고 진행할 수 있었어요.", date: "2024.06.15", amount: "4억 5,000만", stars: 5 },
  { author: "이xx", review: "주변에 이미 세 번이나 추천했습니다. 믿고 맡길 수 있어요.", date: "2024.07.03", amount: "7억 2,000만", stars: 5 },
  { author: "정xx", review: "처음이라 불안했는데 하나하나 설명해주셔서 감사했습니다.", date: "2024.08.20", amount: "2억 9,000만", stars: 5 },
  { author: "한xx", review: "빠른 응대와 꼼꼼한 처리, 두 마리 토끼를 다 잡은 서비스예요.", date: "2024.09.11", amount: "8억 3,000만", stars: 5 },
  { author: "윤xx", review: "비용 대비 만족도가 정말 높았습니다. 또 이용할게요.", date: "2024.10.05", amount: "4억 1,000만", stars: 4 },
  { author: "조xx", review: "계약 전 과정에서 전문성이 느껴졌습니다. 감사합니다.", date: "2024.11.22", amount: "5억 7,000만", stars: 5 },
];

const ITEM_SPACING = 220;
const CARD_STAGE_HEIGHT = 500;
const AUTO_ROTATE_SPEED = 1.2;
const SCROLL_MULTIPLIER = 1.2;
const LOOP_HEIGHT = REVIEW_DATA.length * ITEM_SPACING;
const CARD_CENTER = CARD_STAGE_HEIGHT / 2;

export function ReviewsSection() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoOffset = useRef(0);
  const scrollOffset = useRef(0);

  const updateCards = useCallback(() => {
    const currentOffset = scrollOffset.current * SCROLL_MULTIPLIER + (reducedMotion ? 0 : autoOffset.current);

    for (let index = 0; index < REVIEW_DATA.length; index++) {
      const el = cardRefs.current[index];
      if (!el) continue;

      const basePos = index * ITEM_SPACING;
      let yOffset = (basePos - currentOffset) % LOOP_HEIGHT;
      if (yOffset < 0) yOffset += LOOP_HEIGHT;
      yOffset -= (LOOP_HEIGHT / 2) - CARD_CENTER;

      const distanceFromCenter = Math.abs(yOffset - CARD_CENTER);
      const opacity = Math.max(0, 1 - (distanceFromCenter / 500));
      const shiftX = -(Math.max(0, 1 - distanceFromCenter / 300)) * 60;

      el.style.transform = `translateX(${shiftX}px) translateY(${yOffset - CARD_CENTER}px)`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round(100 - distanceFromCenter));
    }
  }, [reducedMotion]);

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
        if (autoOffset.current >= LOOP_HEIGHT) autoOffset.current -= LOOP_HEIGHT;
      }
      updateCards();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, updateCards]);

  return (
    <section
      id="section3"
      ref={sectionRef}
      className="relative z-40 h-svh w-full overflow-hidden bg-white px-6 py-12 text-slate-900 sm:px-10 lg:px-24"
    >
      <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-20">
        <div className="relative z-[110] max-w-xl space-y-8">
          <h2 className="text-5xl font-bold leading-[0.94] tracking-[-0.08em] text-slate-900 sm:text-6xl lg:text-7xl">
            고객님들의
            <br />
            정직한 후기입니다.
          </h2>
          <p className="max-w-lg text-lg font-light leading-relaxed text-slate-500 sm:text-xl">
            이미 00,000명 이상의 고객님들이 페이몽을 통해 계약을 완료하셨습니다.
          </p>
          <button
            className="cta-paymong group overflow-hidden rounded-full px-16 py-5 text-lg font-semibold"
            style={{ backgroundColor: "#3B6FF5", padding: "1.25rem 4rem", fontSize: "1.25rem", fontWeight: 700 }}
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
          <div className="relative flex h-[500px] w-full max-w-md items-center justify-center overflow-visible">
            {REVIEW_DATA.map((item, index) => (
                <div
                  key={item.author + item.date}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="absolute w-full cursor-pointer"
                  style={{ willChange: "transform, opacity" }}
                >
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "2.5rem",
                      padding: "1.4rem 2rem",
                      border: "1px solid rgba(0,0,0,0.04)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* 상단: 별점 + 작성자 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "3px" }}>
                        {Array.from({ length: item.stars }).map((_, i) => (
                          <Star key={i} size={16} fill="#fb923c" color="#fb923c" />
                        ))}
                      </div>
                      <span
                        style={{
                          backgroundColor: "#f8fafc",
                          color: "#64748b",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          padding: "0.3rem 1rem",
                          borderRadius: "9999px",
                          border: "1px solid rgba(0,0,0,0.04)",
                        }}
                      >
                        {item.author}
                      </span>
                    </div>

                    {/* 본문 */}
                    <p
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        lineHeight: 1.6,
                        marginBottom: "0.75rem",
                        wordBreak: "keep-all",
                      }}
                    >
                      &ldquo;{item.review}&rdquo;
                    </p>

                    {/* 구분선 */}
                    <div style={{ width: "100%", height: "1px", backgroundColor: "#f1f5f9", marginBottom: "0.6rem" }} />

                    {/* 하단: 날짜 + 금액 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8" }}>
                        <Calendar size={14} color="#cbd5e1" />
                        <span style={{ fontSize: "0.8125rem" }}>{item.date}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Wallet size={14} color="#93c5fd" />
                        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#3B6FF5" }}>{item.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
