"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

type SixthSectionShellProps = {
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  style?: CSSProperties;
};

type SixthSectionSurfaceProps = {
  className?: string;
  showOdometer?: boolean;
};

const SIXTH_SECTION_GRADIENT =
  "linear-gradient(180deg, #09000A 5.29%, #001F58 31.7%, #003B79 46.22%, #006DC7 60.1%, #93E2FF 79.33%, #FFF 96.63%)";
const SIXTH_ODOMETER_DIGITS = Array.from({ length: 10 }, (_, index) => index);
const SIXTH_ODOMETER_TARGET = "8,472,915";

type GiftCard = {
  brand: string;
  brandKor: string;
  item: string;
  background: string;
  textColor: string;
  badgeColor: string;
};

const GIFT_CARDS: GiftCard[] = [
  {
    brand: "STARBUCKS",
    brandKor: "스타벅스",
    item: "카페 아메리카노 T",
    background: "#00704A",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.18)",
  },
  {
    brand: "GS25",
    brandKor: "GS25",
    item: "모바일 상품권 5,000원",
    background: "#0067B1",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.18)",
  },
  {
    brand: "CU",
    brandKor: "CU",
    item: "모바일 상품권 5,000원",
    background: "#80276C",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.2)",
  },
  {
    brand: "NAVER PAY",
    brandKor: "네이버페이",
    item: "포인트 10,000P",
    background: "#03C75A",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.2)",
  },
  {
    brand: "BAEMIN",
    brandKor: "배달의민족",
    item: "배민 상품권 10,000원",
    background: "#2AC1BC",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.22)",
  },
  {
    brand: "KYOCHON",
    brandKor: "교촌치킨",
    item: "교촌 허니콤보",
    background: "#C8102E",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.18)",
  },
  {
    brand: "LOTTERIA",
    brandKor: "롯데리아",
    item: "리아미라클버거 세트",
    background: "#ED1C24",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.18)",
  },
  {
    brand: "EMART24",
    brandKor: "이마트24",
    item: "모바일 상품권 5,000원",
    background: "#FFCD00",
    textColor: "#1A1A1A",
    badgeColor: "rgba(0,0,0,0.08)",
  },
  {
    brand: "MEGA COFFEE",
    brandKor: "메가커피",
    item: "아메리카노",
    background: "#FFE600",
    textColor: "#1A1A1A",
    badgeColor: "rgba(0,0,0,0.08)",
  },
  {
    brand: "HOLLYS",
    brandKor: "할리스",
    item: "아메리카노 R",
    background: "#A2191F",
    textColor: "#FFFFFF",
    badgeColor: "rgba(255,255,255,0.18)",
  },
];

function GiftCardItem({ card }: { card: GiftCard }) {
  return (
    <div className="flex h-[130px] w-[260px] shrink-0 flex-row overflow-hidden rounded-[1.1rem] bg-white ring-1 ring-black/5 sm:h-[170px] sm:w-[360px] sm:rounded-[1.4rem]">
      <div
        className="flex w-[112px] shrink-0 flex-col items-center justify-center px-2.5 text-center sm:w-[155px] sm:px-3"
        style={{ backgroundColor: card.background, color: card.textColor }}
      >
        <span
          className="inline-flex rounded-full px-1.5 py-[2px] text-[0.48rem] font-semibold uppercase tracking-[0.18em] sm:px-2 sm:py-[3px] sm:text-[0.55rem]"
          style={{ backgroundColor: card.badgeColor }}
        >
          GIFTICON
        </span>
        <div className="mt-2 text-[0.92rem] font-bold leading-[1.1] tracking-[-0.02em] sm:mt-2.5 sm:text-[1.1rem]">
          {card.brand}
        </div>
        <div className="mt-1 text-[0.62rem] font-medium opacity-85 sm:text-[0.7rem]">{card.brandKor}</div>
      </div>
      <div className="flex flex-1 flex-col justify-center border-l border-dashed border-slate-200 bg-white px-3.5 sm:px-5">
        <div className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[0.6rem]">
          ITEM
        </div>
        <div className="mt-1 text-[0.8rem] font-semibold leading-snug text-slate-900 sm:mt-1.5 sm:text-[0.95rem]">
          {card.item}
        </div>
      </div>
    </div>
  );
}

function GiftCardMarquee({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...GIFT_CARDS, ...GIFT_CARDS];
  return (
    <div
      className={`paymong-gifticon-marquee-wrapper relative w-full overflow-hidden py-4 ${
        reverse ? "paymong-gifticon-marquee-wrapper--reverse" : ""
      }`.trim()}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className={`paymong-gifticon-marquee flex w-max items-center gap-3 sm:gap-5 ${
          reverse ? "paymong-gifticon-marquee--reverse" : ""
        }`.trim()}
      >
        {doubled.map((card, index) => (
          <GiftCardItem key={`${card.brand}-${index}`} card={card} />
        ))}
      </div>
      <style>{`
        @keyframes paymong-gifticon-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes paymong-gifticon-scroll-reverse {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .paymong-gifticon-marquee {
          animation: paymong-gifticon-scroll 50s linear infinite;
          will-change: transform;
        }
        .paymong-gifticon-marquee--reverse {
          animation: paymong-gifticon-scroll-reverse 50s linear infinite;
        }
        .paymong-gifticon-marquee-wrapper:hover .paymong-gifticon-marquee {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .paymong-gifticon-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function SixthOdometerDigit({
  digit,
  isActive,
  order,
}: {
  digit: number;
  isActive: boolean;
  order: number;
}) {
  const repeatedDigits = useMemo(
    () => Array.from({ length: 80 }, (_, repeatIndex) => SIXTH_ODOMETER_DIGITS[repeatIndex % 10]),
    [],
  );
  const targetIndex = 20 + digit;

  return (
    <span className="fourth-proof-odometer__digit" aria-hidden="true">
      <span
        className="fourth-proof-odometer__digit-track"
        style={{
          transform: isActive ? `translateY(calc(-1em * ${targetIndex}))` : "translateY(0)",
          transitionDelay: `${order * 80}ms`,
        }}
      >
        {repeatedDigits.map((value, index) => (
          <span key={`${order}-${index}`} className="fourth-proof-odometer__digit-cell">
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

function SixthOdometerNumber({
  value,
  isActive,
}: {
  value: string;
  isActive: boolean;
}) {
  return (
    <span className="fourth-proof-odometer" aria-label={value} style={{ color: "currentColor" }}>
      {value.split("").map((char, index) => {
        if (char === ",") {
          return (
            <span key={`comma-${index}`} className="fourth-proof-odometer__comma">
              ,
            </span>
          );
        }

        const currentOrder = value
          .slice(0, index)
          .split("")
          .filter((token) => token !== ",")
          .length;

        return (
          <SixthOdometerDigit
            key={`digit-${index}`}
            digit={Number(char)}
            isActive={isActive}
            order={currentOrder}
          />
        );
      })}
    </span>
  );
}

export function SixthSectionShell({
  className = "",
  contentClassName = "",
  children,
  style,
}: SixthSectionShellProps) {
  return (
    <div
      className={`h-full w-full overflow-hidden text-white ${className}`.trim()}
      style={{
        backgroundImage: SIXTH_SECTION_GRADIENT,
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    >
      <div
        className={`mx-auto flex h-full w-full max-w-[1440px] items-center justify-center px-6 text-center ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}

export function SixthSectionSurface({
  className = "",
  showOdometer = true,
}: SixthSectionSurfaceProps) {
  return (
    <div className={`mx-auto max-w-[1100px] text-center ${className}`.trim()}>
      <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
        페이몽 추가 혜택
      </div>
      <h2 className="mt-5 text-[clamp(1.95rem,5.6vw,5.4rem)] font-semibold leading-[1.1] tracking-[-0.06em] text-white sm:mt-6 sm:leading-[1.06]">
        수수료 아끼기만 하셨나요?
        <br />
        페이몽이 2%를 돌려드립니다.
      </h2>
      <p className="mx-auto mt-7 max-w-[640px] text-base leading-[1.75] text-white/72 sm:text-lg">
        타사에 없는 정도의 혜택. 결제할 때마다 차곡차곡 쌓이는 마일리지를 경험해보세요.
      </p>
      {showOdometer ? <SixthSectionOdometerBlock className="mx-auto mt-10" /> : null}
    </div>
  );
}

export function SixthSectionPreviewSurface({
  className = "",
  showOdometer = true,
}: SixthSectionSurfaceProps) {
  return (
    <div className={`mx-auto max-w-[1100px] px-5 text-center sm:px-0 ${className}`.trim()}>
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-sm">페이몽 추가 혜택</div>
      <h2 className="mt-5 text-[clamp(1.95rem,5.6vw,5.4rem)] font-semibold leading-[1.1] tracking-[-0.06em] text-white sm:mt-6 sm:leading-[1.06]">
        수수료 아끼기만 하셨나요?
        <br />
        페이몽이 2%를 돌려드립니다.
      </h2>
      <p className="mx-auto mt-5 max-w-[28rem] text-sm leading-[1.7] text-white/72 sm:mt-7 sm:max-w-none sm:whitespace-nowrap sm:text-base sm:leading-[1.75] lg:text-lg">
        타사에 없는 페이몽만의 혜택. 결제할 때마다 쌓이는 마일리지를 경험해보세요.
      </p>
      {showOdometer ? <SixthSectionOdometerBlock className="mx-auto mt-8 sm:mt-10" /> : null}
    </div>
  );
}

const SIXTH_ODOMETER_TRIGGER_SCROLL_Y = 10539;

function SixthSectionOdometerBlock({
  className = "",
}: {
  className?: string;
}) {
  const odometerBlockRef = useRef<HTMLDivElement | null>(null);
  const [isOdometerActive, setIsOdometerActive] = useState(false);

  useEffect(() => {
    let hasTriggered = false;

    const fire = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      setIsOdometerActive(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsOdometerActive(true);
        });
      });
    };

    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767.98px)").matches;

    if (isMobile) {
      // Mobile: the legacy absolute-pixel scrollY threshold (10539) doesn't
      // line up with mobile section heights — it was firing well inside
      // section 5 instead of when section 6 was about to arrive. Observe
      // the actual SixthSection element and fire as it approaches the
      // viewport (rootMargin extends the observation rect downward by 50%
      // of viewport so the digit roll starts right around when section 5's
      // mask reveal is at its late phase, where the odometer block is
      // becoming visible inside the mask).
      const sixthSection = document.querySelector(
        "[data-sixth-section-root]",
      );
      if (sixthSection) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                fire();
              }
            });
          },
          { rootMargin: "0px 0px 50% 0px", threshold: 0 },
        );
        observer.observe(sixthSection);
        return () => observer.disconnect();
      }
    }

    // Desktop (and mobile fallback when section 6 element isn't found):
    // legacy scrollY threshold — unchanged.
    const triggerOdometer = () => {
      if (hasTriggered || window.scrollY < SIXTH_ODOMETER_TRIGGER_SCROLL_Y) {
        return;
      }
      fire();
    };

    triggerOdometer();
    window.addEventListener("scroll", triggerOdometer, { passive: true });
    window.addEventListener("resize", triggerOdometer);

    return () => {
      window.removeEventListener("scroll", triggerOdometer);
      window.removeEventListener("resize", triggerOdometer);
    };
  }, []);

  return (
    <div
      ref={odometerBlockRef}
      className={`inline-flex flex-col items-center rounded-[1.4rem] border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm sm:rounded-[1.6rem] sm:px-7 sm:py-5 ${className}`.trim()}
    >
      <div className="text-[0.7rem] font-medium tracking-[0.04em] text-white/72 sm:text-[0.84rem]">
        지금까지 고객님들에게 지급된 총 마일리지
      </div>
      <div className="mt-2 flex items-end gap-2 text-white">
        <span className="text-[clamp(1.6rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.06em]">
          <SixthOdometerNumber value={SIXTH_ODOMETER_TARGET} isActive={isOdometerActive} />
        </span>
        <span className="pb-[0.18em] text-[clamp(0.85rem,1.8vw,1.4rem)] font-semibold tracking-[-0.03em] text-white/92">
          P
        </span>
      </div>
    </div>
  );
}

export function SixthSection() {
  return (
    <section
      data-sixth-section-root
      className="section-two-onward-font relative z-40 overflow-hidden"
      style={{
        backgroundColor: "#FFF",
        backgroundImage: SIXTH_SECTION_GRADIENT,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 200vh",
        backgroundPosition: "0 -100vh",
        // 이전 섹션(FifthSection)의 mask reveal 끝점과 정확히 같은 그라데이션 색에서
        // 만나지만, 모바일/일부 브라우저에서 sub-pixel 정렬로 1px 흰선이 새는 현상이
        // 있어 살짝 끌어올려 덮어줌.
        marginTop: "-3px",
      }}
    >
      <div className="pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-36 lg:pt-32">
        <div className="mx-auto w-full max-w-[1440px] px-5 text-center sm:px-8 lg:px-16">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-sm">
            기프티콘 샵
          </span>
          <h3 className="mt-5 text-[clamp(1.85rem,5vw,4.4rem)] font-semibold leading-[1.12] tracking-[-0.06em] text-white sm:mt-6 sm:leading-[1.1]">
            쌓인 마일리지를
            <br />
            원하는 상품으로 교환
          </h3>
          <div className="mt-5 inline-flex items-baseline gap-2 sm:mt-6">
            <span className="text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
              3,000+
            </span>
            <span className="text-xs text-white/70 sm:text-sm lg:text-base">
              교환 가능한 기프티콘 상품
            </span>
          </div>
        </div>

        <div className="mt-12 sm:mt-20">
          <GiftCardMarquee />
          <GiftCardMarquee reverse />
        </div>
      </div>
    </section>
  );
}
