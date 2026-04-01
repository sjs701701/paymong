"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BadgeCheck, Building2, FileCheck2, Landmark, ShieldCheck } from "lucide-react";

type HorizontalFeatureCard = {
  title: string;
  description: string;
  accentClass: string;
  renderVisual: () => ReactNode;
};

const FIFTH_SECTION_CARDS: HorizontalFeatureCard[] = [
  {
    title: "계약 등록을 한 화면에서",
    description: "월세, 교육비, 인건비처럼 성격이 다른 계약도 같은 흐름 안에서 차분하게 정리할 수 있습니다.",
    accentClass: "from-[#407CFF]/18 to-[#407CFF]/6",
    renderVisual: () => (
      <div className="flex h-full flex-col justify-between rounded-[2rem] bg-[#f7f9ff] p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white px-3 py-1 text-[0.72rem] font-semibold text-slate-500 shadow-sm">
            계약 유형
          </span>
          <span className="text-sm font-semibold text-[#407CFF]">4 categories</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["월세", "#407CFF"],
            ["교육비", "#73DAFF"],
            ["인건비", "#5D62FF"],
            ["이사비", "#8423FE"],
          ].map(([label, color]) => (
            <div
              key={label}
              className="rounded-[1.4rem] bg-white p-4 shadow-[0_14px_30px_rgba(10,15,30,0.06)]"
            >
              <div
                className="mb-3 h-2.5 w-12 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="text-base font-semibold text-slate-900">{label}</div>
              <div className="mt-1 text-sm text-slate-400">등록 대기</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "증빙 검토와 승인 흐름",
    description: "계약서, 계좌 정보, 증빙 자료를 순서대로 확인하고 승인까지 자연스럽게 이어지는 흐름을 보여주는 더미 영역입니다.",
    accentClass: "from-[#73DAFF]/20 to-[#73DAFF]/7",
    renderVisual: () => (
      <div className="flex h-full flex-col justify-between rounded-[2rem] bg-[#f5fcff] p-5">
        <div className="rounded-[1.6rem] bg-white p-5 shadow-[0_16px_34px_rgba(10,15,30,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9F9FF] text-[#00A6E6]">
                <FileCheck2 size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">증빙 자료 확인</div>
                <div className="text-xs text-slate-400">Review checklist</div>
              </div>
            </div>
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-emerald-600">
              검토 중
            </span>
          </div>
          <div className="space-y-3">
            {[
              "계약서 원본 업로드",
              "거래 상대방 계좌 검수",
              "송금 정보 승인 요청",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <BadgeCheck size={16} className="text-[#3B6FF5]" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["제출", "검수", "승인"].map((label, index) => (
            <div key={label} className="rounded-[1.2rem] bg-white px-3 py-4 text-center shadow-[0_12px_26px_rgba(10,15,30,0.06)]">
              <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
                0{index + 1}
              </div>
              <div className="text-sm font-semibold text-slate-800">{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "안전장치까지 하나의 시스템으로",
    description: "계약 진행과 보증 체계가 분리되지 않고 이어져, 송금 이후 단계까지도 안심하고 확인할 수 있다는 더미 스토리입니다.",
    accentClass: "from-[#BE8BFF]/20 to-[#BE8BFF]/7",
    renderVisual: () => (
      <div className="flex h-full flex-col justify-between rounded-[2rem] bg-[#fbf7ff] p-5">
        <div className="rounded-[1.8rem] bg-[#101828] p-5 text-white shadow-[0_20px_40px_rgba(16,24,40,0.24)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#BE8BFF]" />
              <span className="text-sm font-semibold">지급보증 상태</span>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              Active
            </span>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <div className="text-xs text-white/55">보증 파트너</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <Building2 size={16} className="text-[#BE8BFF]" />
                서울보증보험 연동
              </div>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <div className="text-xs text-white/55">거래 투명성</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <Landmark size={16} className="text-[#73DAFF]" />
                송금 이력 자동 추적
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_14px_30px_rgba(10,15,30,0.06)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Confidence</div>
          <div className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">99.2%</div>
          <div className="mt-1 text-sm text-slate-400">안정적으로 이어지는 거래 흐름</div>
        </div>
      </div>
    ),
  },
  {
    title: "진행 상황도 끝까지 추적",
    description: "요청, 검수, 승인, 송금 처리까지 이어지는 단계를 한눈에 확인할 수 있는 운영용 더미 카드입니다.",
    accentClass: "from-[#0A0F1E]/10 to-[#0A0F1E]/4",
    renderVisual: () => (
      <div className="flex h-full flex-col justify-between rounded-[2rem] bg-[#f7f7f8] p-5">
        <div className="space-y-3">
          {[
            ["요청 접수", "00:01", true],
            ["검수 진행", "00:04", true],
            ["승인 완료", "00:07", true],
            ["송금 처리", "00:10", false],
          ].map(([label, time, isDone]) => (
            <div key={label} className="flex items-center justify-between rounded-[1.35rem] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(10,15,30,0.05)]">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${isDone ? "bg-emerald-500" : "bg-[#3B6FF5]"}`} />
                <span className="text-sm font-semibold text-slate-800">{label}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">{time}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/70 px-4 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Status note</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            운영자가 다음 단계와 처리 시점을 바로 읽을 수 있게 정리한 예시 영역입니다.
          </p>
        </div>
      </div>
    ),
  },
];

const HORIZONTAL_TRACK_START_OFFSET = 340;
const HORIZONTAL_TRACK_SCROLL_OVERSHOOT = 520;

function FeatureCard({
  card,
}: {
  card: HorizontalFeatureCard;
}) {
  return (
    <article className="group flex h-[520px] w-[340px] shrink-0 flex-col rounded-[2.3rem] border border-black/5 bg-white p-7 shadow-[0_18px_50px_rgba(10,15,30,0.06)] transition-transform duration-300 hover:scale-[1.02] md:h-[560px] md:w-[390px]">
      <div>
        <h3 className="max-w-[14ch] text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950 md:text-[2.2rem]">
          {card.title}
        </h3>
        <p className="mt-3 max-w-[27ch] text-[0.98rem] leading-[1.7] text-slate-500 md:text-[1rem]">
          {card.description}
        </p>
      </div>

      <div className={`mt-6 flex-1 overflow-hidden rounded-[2rem] bg-gradient-to-b ${card.accentClass}`}>
        {card.renderVisual()}
      </div>
    </article>
  );
}

export function FifthSection() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const updateScroll = () => {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;

      if (!wrapper || !track) {
        return;
      }

      const { top, height } = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const scrollDistance = height - windowHeight;

      if (scrollDistance <= 0) {
        setTranslateX(0);
        return;
      }

      const progress = Math.max(0, Math.min(-top / scrollDistance, 1));
      const maxTranslate = Math.max(
        0,
        track.scrollWidth - windowWidth + 160 + HORIZONTAL_TRACK_START_OFFSET + HORIZONTAL_TRACK_SCROLL_OVERSHOOT,
      );

      setTranslateX(progress * maxTranslate);
    };

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="section-two-onward-font relative z-40 bg-[#f6f6f4] text-slate-950">
      <section className="flex flex-col items-center justify-center px-5 pb-12 pt-[18vh] text-center sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#3B6FF5]" />
          <span className="text-base font-medium text-slate-500 sm:text-lg">Contract flow, made visible</span>
        </div>
        <h2 className="text-[clamp(3.4rem,8vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-slate-950">
          오직 페이몽에서만
        </h2>
        <p className="mt-7 text-sm font-medium text-slate-400 sm:text-base">
          아래로 스크롤하며 더미 카드 흐름을 확인하세요
        </p>
      </section>

      <div ref={wrapperRef} className="relative h-[300vh] w-full">
        <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden bg-[#f6f6f4]">
          <div className="pointer-events-none absolute left-6 top-1/2 z-0 -translate-y-1/2 whitespace-nowrap sm:left-10 lg:left-16">
            <h3 className="text-[90px] font-semibold leading-none tracking-[-0.09em] text-black/[0.05] sm:text-[140px] lg:text-[210px]">
              Paymong flow
            </h3>
          </div>

          <div
            ref={trackRef}
            className="relative z-10 flex w-max items-center gap-8 px-6 will-change-transform sm:px-10 lg:gap-12 lg:px-16"
            style={{ transform: `translateX(${HORIZONTAL_TRACK_START_OFFSET - translateX}px)` }}
          >
            {FIFTH_SECTION_CARDS.map((card) => (
              <FeatureCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
