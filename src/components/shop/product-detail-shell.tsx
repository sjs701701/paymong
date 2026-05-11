"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type Product,
  USER_MILEAGE,
  getSimilarProducts,
} from "./data";
import { ProductCard } from "./product-card";

const ISSUER = "KT 알파";

const USAGE_GUIDE: string[] = [
  "배달의민족 APP [마이배민] → [선물함] → [배민 선물코드 등록]에서 등록 후 사용 가능",
  "배달의민족 회원 로그인 후 등록 가능, 최초 1회 본인인증 진행 후 사용 가능(자금세탁방지법 의무사항)",
  "배달의민족 APP등록 후 등록취소 및 환불 불가",
  "배민배달/가게배달/포장/장보기·쇼핑 카테고리에서 사용 가능(전국별미, 대용량특가, 선물하기 제외)",
  "잔액 내에서 횟수 제한 없이 분할 사용가능하며 하나의 주문에 여러 장의 상품권 동시 사용 가능",
  "현금영수증 발행 가능",
  "교환권은 계정별 총 50만원까지 보유 가능하며, 금액 초과 시 등록 불가",
  "쿠폰 유효기간 내 쿠폰 등록 및 사용 부탁드립니다.",
];

const CAUTIONS: string[] = [
  "본 교환권은 실물 상품이 아니며, 재충전이 불가합니다.",
  "본 교환권으로 배민선물하기 내 상품권 구매는 불가합니다.",
  "정식 판매처 외의 경로로 유통된 상품권의 경우, 사용이 제한될 수 있습니다.",
  "본 쿠폰은 프로모션(B2B) 발송상품으로 유효기간 연장 및 환불 대상이 아닙니다.",
];

type ProductDetailShellProps = {
  product: Product;
};

export function ProductDetailShell({ product }: ProductDetailShellProps) {
  const router = useRouter();

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [exchangedOpen, setExchangedOpen] = useState(false);
  const [similarStart, setSimilarStart] = useState(0);
  const [similarVisibleCount, setSimilarVisibleCount] = useState(4);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => {
      const next = el.offsetHeight;
      setHeaderHeight((current) => (current === next ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
      );
      const max = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      const safe = Math.max(0, Math.min(scrollTop, max));
      const prev = lastScrollTopRef.current;
      const delta = safe - prev;
      lastScrollTopRef.current = safe;

      if (safe < 40) {
        setIsHeaderHidden((c) => (c ? false : c));
        return;
      }
      if (Math.abs(delta) < 2) return;

      const shouldHide = delta > 0;
      setIsHeaderHidden((c) => (c === shouldHide ? c : shouldHide));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const updateVisibleCount = () => {
      setSimilarVisibleCount(media.matches ? 2 : 4);
    };

    updateVisibleCount();
    media.addEventListener("change", updateVisibleCount);
    return () => media.removeEventListener("change", updateVisibleCount);
  }, []);

  const { primary, secondary, accent } = useMemo(() => {
    const h = product.imageHue;
    return {
      primary: `hsl(${h} 75% 62%)`,
      secondary: `hsl(${(h + 45) % 360} 80% 48%)`,
      accent: `hsl(${(h + 200) % 360} 65% 38%)`,
    };
  }, [product.imageHue]);

  const initials = product.brand.slice(0, 2);
  const similar = useMemo(() => getSimilarProducts(product, 7), [product]);
  const similarMaxStart =
    Math.max(Math.ceil(similar.length / similarVisibleCount) - 1, 0) *
    similarVisibleCount;
  const effectiveSimilarStart = Math.min(similarStart, similarMaxStart);
  const visibleSimilar = similar.slice(
    effectiveSimilarStart,
    effectiveSimilarStart + similarVisibleCount,
  );

  const canAfford = USER_MILEAGE >= product.price;
  const balanceAfter = USER_MILEAGE - product.price;

  const handleConfirmExchange = () => {
    setExchangeOpen(false);
    setExchangedOpen(true);
  };

  useEffect(() => {
    setSimilarStart(0);
  }, [product.id]);

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-[#eef2fa]"
      style={
        {
          "--product-header-height": `${headerHeight}px`,
          "--product-header-shift": `${isHeaderHidden ? -headerHeight : 0}px`,
        } as CSSProperties
      }
    >
      <DashboardHeader
        ref={headerRef}
        hidden={isHeaderHidden}
        className="sticky top-0 z-30 px-0 md:px-0"
        innerClassName="mx-auto max-w-[1200px] px-4 sm:px-6"
      />

      {/* Sticky title bar */}
      <div
        className="sticky z-20 border-b border-slate-200 bg-white transition-transform duration-300 ease-in-out will-change-transform"
        style={{
          top: "var(--product-header-height)",
          transform: "translateY(var(--product-header-shift))",
        }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <BackButton
            variant="ghost"
            fallbackHref="/shop"
            iconClassName="transition-transform group-hover:-translate-x-1"
            className="group h-auto shrink-0 rounded-none p-0 text-slate-600 hover:bg-transparent hover:text-slate-950"
          />
          <h1 className="text-lg font-bold tracking-[-0.04em] text-slate-900 sm:text-lg sm:tracking-[-0.03em] sm:text-slate-950">
            상품 상세
          </h1>
          <Link
            href="/shop/history"
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#0038F1]/8 px-2.5 py-1 text-[11px] font-bold text-[#0038F1] ring-1 ring-[#0038F1]/15 transition hover:bg-[#0038F1]/12 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            <Wallet size={12} />
            <span className="whitespace-nowrap">
              {USER_MILEAGE.toLocaleString("ko-KR")} P
            </span>
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-5 pb-32 sm:px-6 sm:pt-6">
        <div className="mx-auto max-w-[720px]">
          {/* Gifticon visual card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              className="relative flex h-[460px] w-full flex-col items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/25 blur-3xl sm:h-56 sm:w-56"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-white/15 blur-3xl sm:h-60 sm:w-60"
              />

              <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center sm:gap-5">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl font-extrabold tracking-tight shadow-xl ring-4 ring-white/40 sm:h-24 sm:w-24 sm:text-[2rem]"
                  style={{ color: accent }}
                >
                  {initials}
                </div>
                <p className="max-w-[18rem] text-sm font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] sm:text-base">
                  {product.name}
                </p>
              </div>

              <span
                aria-hidden
                className="absolute right-4 bottom-3 z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]"
              >
                GIFTICON
              </span>
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-xs font-medium text-slate-500">
                {product.brand}
              </p>
              <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                {product.name}
              </h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-[#0038F1] sm:text-3xl">
                  {product.price.toLocaleString("ko-KR")}
                </span>
                <span className="text-base font-semibold text-[#0038F1]/80 sm:text-lg">
                  P
                </span>
              </div>
            </div>
          </section>

          {/* Issuer + exchange CTA */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Info size={12} />
              상품 정보
            </h3>
            <dl className="divide-y divide-slate-100">
              <InfoRow
                label="발행자"
                value={ISSUER}
                icon={<BadgeCheck size={14} className="text-[#0038F1]" />}
              />
              <InfoRow label="교환 가격" value={`${product.price.toLocaleString("ko-KR")} P`} />
              <InfoRow
                label="내 보유 마일리지"
                value={`${USER_MILEAGE.toLocaleString("ko-KR")} P`}
                valueClassName={
                  canAfford ? "text-slate-900" : "text-rose-600 font-bold"
                }
              />
            </dl>
            <Button
              type="button"
              size="lg"
              onClick={() => setExchangeOpen(true)}
              disabled={!canAfford}
              className="mt-5 h-12 w-full rounded-xl bg-[#0038F1] text-sm font-bold text-white hover:bg-[#002fd0] disabled:cursor-not-allowed disabled:opacity-60 sm:h-13 sm:text-base"
            >
              {canAfford ? "교환하기" : "마일리지가 부족합니다"}
            </Button>
          </section>

          {/* Usage guide */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-3 text-sm font-bold text-slate-900 sm:text-base">
              이용안내
            </h3>
            <ul className="space-y-2">
              {USAGE_GUIDE.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs leading-6 text-slate-700 sm:text-[13px] sm:leading-6"
                >
                  <span className="mt-[10px] inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Cautions */}
          <section className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 shadow-sm sm:p-6">
            <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-amber-900 sm:text-base">
              <AlertTriangle size={14} className="text-amber-600" />
              유의사항
            </h3>
            <ul className="space-y-2">
              {CAUTIONS.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs leading-6 text-amber-900 sm:text-[13px] sm:leading-6"
                >
                  <span className="mt-[10px] inline-block h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Similar products — horizontal single-row slider */}
        {similar.length > 0 ? (
          <section className="mt-10 pb-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900 sm:text-lg">
                <Sparkles size={16} className="text-[#0038F1]" />
                비슷한 가격대의 인기 상품
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 sm:text-sm">
                  <span className="font-bold text-slate-700">
                    {effectiveSimilarStart + 1}-
                    {Math.min(
                      effectiveSimilarStart + similarVisibleCount,
                      similar.length,
                    )}
                  </span>
                  /{similar.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="이전 인기 상품 보기"
                    onClick={() =>
                      setSimilarStart((current) =>
                        Math.max(current - similarVisibleCount, 0),
                      )
                    }
                    disabled={effectiveSimilarStart === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#0038F1]/30 hover:bg-[#0038F1]/8 hover:text-[#0038F1] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 인기 상품 보기"
                    onClick={() =>
                      setSimilarStart((current) =>
                        Math.min(current + similarVisibleCount, similarMaxStart),
                      )
                    }
                    disabled={effectiveSimilarStart >= similarMaxStart}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#0038F1]/30 hover:bg-[#0038F1]/8 hover:text-[#0038F1] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div
              className="grid w-full gap-4 max-sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${similarVisibleCount}, minmax(0, 1fr))`,
              }}
            >
              {visibleSimilar.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="block w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0038F1] focus-visible:ring-offset-2"
                >
                  <ProductCard product={p} className="h-full w-full" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Sticky bottom CTA (mobile-prominent) */}
      <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
              보유 마일리지
            </p>
            <p
              className={cn(
                "text-sm font-bold sm:text-base",
                canAfford ? "text-slate-900" : "text-rose-600",
              )}
            >
              {USER_MILEAGE.toLocaleString("ko-KR")} P
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => setExchangeOpen(true)}
            disabled={!canAfford}
            className="h-12 min-w-[140px] rounded-xl bg-[#0038F1] px-5 text-sm font-bold text-white hover:bg-[#002fd0] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px] sm:text-base"
          >
            {canAfford
              ? `${product.price.toLocaleString("ko-KR")} P 로 교환`
              : "마일리지 부족"}
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={exchangeOpen}
        onOpenChange={(open) => {
          if (!open) setExchangeOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]">
              <Sparkles size={18} />
            </div>
            <DialogTitle>기프티콘 교환</DialogTitle>
            <DialogDescription>
              {product.brand} · {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-slate-50 p-4">
            <Row
              label="현재 마일리지"
              value={`${USER_MILEAGE.toLocaleString("ko-KR")} P`}
            />
            <Row
              label="차감"
              value={`- ${product.price.toLocaleString("ko-KR")} P`}
              valueClassName="text-rose-600"
            />
            <div className="mt-2 border-t border-slate-200 pt-2">
              <Row
                label="교환 후 잔액"
                value={`${balanceAfter.toLocaleString("ko-KR")} P`}
                valueClassName="text-[#0038F1] font-bold"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setExchangeOpen(false)}
              className="h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              취소
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleConfirmExchange}
              className="h-11 rounded-xl bg-[#0038F1] text-sm font-bold text-white hover:bg-[#002fd0]"
            >
              교환하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog
        open={exchangedOpen}
        onOpenChange={(open) => {
          if (!open) setExchangedOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <BadgeCheck size={18} />
            </div>
            <DialogTitle>교환이 완료되었어요</DialogTitle>
            <DialogDescription>
              내 마일리지 페이지에서 받은 기프티콘을 확인할 수 있어요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setExchangedOpen(false)}
              className="h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              계속 둘러보기
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                setExchangedOpen(false);
                router.push("/shop/history");
              }}
              className="h-11 rounded-xl bg-[#0038F1] text-sm font-bold text-white hover:bg-[#002fd0]"
            >
              내 마일리지 보기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClassName?: string;
};

function InfoRow({ label, value, icon, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "text-right text-xs font-semibold text-slate-900 sm:text-sm",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-600 sm:text-sm">{label}</span>
      <span
        className={cn(
          "text-xs font-semibold text-slate-900 sm:text-sm",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}
