"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BadgeCheck, Calendar, Copy, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import type { Purchase } from "./data";

type PurchaseDetailShellProps = {
  purchase: Purchase;
};

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

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

export function PurchaseDetailShell({ purchase }: PurchaseDetailShellProps) {
  const router = useRouter();

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const [copied, setCopied] = useState(false);

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

  const { primary, secondary, accent } = useMemo(() => {
    const h = purchase.product.imageHue;
    return {
      primary: `hsl(${h} 75% 62%)`,
      secondary: `hsl(${(h + 45) % 360} 80% 48%)`,
      accent: `hsl(${(h + 200) % 360} 65% 38%)`,
    };
  }, [purchase.product.imageHue]);

  const initials = purchase.product.brand.slice(0, 2);
  const isUsed = purchase.used;

  // Build a deterministic-looking barcode bar pattern from the barcode digits
  const bars = useMemo(() => {
    const digits = purchase.barcodeNumber.replace(/\D/g, "");
    const out: number[] = [];
    for (let i = 0; i < digits.length; i += 1) {
      const d = Number(digits[i]);
      // 1-4 width units per bar
      out.push(((d * 7) % 4) + 1);
      out.push(((d * 3 + 1) % 3) + 1);
    }
    return out;
  }, [purchase.barcodeNumber]);

  const handleCopyBarcode = async () => {
    try {
      await navigator.clipboard.writeText(
        purchase.barcodeNumber.replace(/-/g, ""),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be unavailable; silently ignore */
    }
  };

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-[#eef2fa]"
      style={
        {
          "--purchase-header-height": `${headerHeight}px`,
          "--purchase-header-shift": `${isHeaderHidden ? -headerHeight : 0}px`,
        } as CSSProperties
      }
    >
      <DashboardHeader
        ref={headerRef}
        hidden={isHeaderHidden}
        className="sticky top-0 z-30 px-0 md:px-0"
        innerClassName="mx-auto max-w-[1200px] px-4 sm:px-6"
      />

      {/* Sticky title bar — follows the DashboardHeader on hide-on-scroll */}
      <div
        className="sticky z-20 border-b border-slate-200 bg-white transition-transform duration-300 ease-in-out will-change-transform"
        style={{
          top: "var(--purchase-header-height)",
          transform: "translateY(var(--purchase-header-shift))",
        }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <BackButton
            variant="ghost"
            fallbackHref="/shop/history"
            iconClassName="transition-transform group-hover:-translate-x-1"
            className="group h-auto shrink-0 rounded-none p-0 text-slate-600 hover:bg-transparent hover:text-slate-950"
          />
          <h1 className="text-lg font-bold tracking-[-0.04em] text-slate-900 sm:text-lg sm:tracking-[-0.03em] sm:text-slate-950">
            기프티콘 상세
          </h1>
          <span
            className={cn(
              "ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight shadow-sm sm:text-xs",
              isUsed
                ? "bg-slate-500 text-white"
                : "bg-[#0038F1] text-white",
            )}
          >
            {isUsed ? "사용완료" : "사용전"}
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-5 pb-16 sm:px-6 sm:pt-6">
        {/* Content stack — centered narrow column for readability of single-item detail */}
        <div className="mx-auto max-w-[720px]">

        {/* Gifticon visual card */}
        <section
          className={cn(
            "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
            isUsed && "opacity-75",
          )}
        >
          {/* Image area */}
          <div
            className={cn(
              "relative flex h-[460px] w-full flex-col items-center justify-center overflow-hidden",
              isUsed && "grayscale",
            )}
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
            }}
          >
            {/* Decorative orbs for depth */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/25 blur-3xl sm:h-56 sm:w-56"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-white/15 blur-3xl sm:h-60 sm:w-60"
            />

            {/* Center logo + product name */}
            <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center sm:gap-5">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl font-extrabold tracking-tight shadow-xl ring-4 ring-white/40 sm:h-24 sm:w-24 sm:text-[2rem]"
                style={{ color: accent }}
              >
                {initials}
              </div>
              <p className="max-w-[18rem] text-sm font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] sm:text-base">
                {purchase.product.name}
              </p>
            </div>

            {/* GIFTICON watermark */}
            <span
              aria-hidden
              className="absolute right-4 bottom-3 z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]"
            >
              GIFTICON
            </span>
          </div>

          {/* Product info */}
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-xs font-medium text-slate-500">
              {purchase.product.brand}
            </p>
            <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900 sm:text-xl">
              {purchase.product.name}
            </h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#0038F1] sm:text-3xl">
                {purchase.product.price.toLocaleString("ko-KR")}
              </span>
              <span className="text-base font-semibold text-[#0038F1]/80 sm:text-lg">
                P
              </span>
            </div>
          </div>

          {/* Barcode */}
          <div className="bg-white px-5 py-6 sm:px-6 sm:py-7">
            <div
              className={cn(
                "mx-auto flex max-w-md flex-col items-center rounded-xl border border-slate-200 bg-white p-4 sm:p-5",
                isUsed && "opacity-50",
              )}
            >
              <div
                className={cn(
                  "flex h-16 w-full items-end justify-center gap-[2px] overflow-hidden sm:h-20",
                  isUsed && "grayscale",
                )}
                aria-hidden
              >
                {bars.map((w, i) => (
                  <span
                    key={i}
                    className="h-full shrink-0 bg-slate-900"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <p className="mt-3 font-mono text-sm font-bold tracking-[0.2em] text-slate-900 sm:text-base">
                {purchase.barcodeNumber}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyBarcode}
                className="mt-3 h-8 rounded-full border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy size={12} className="mr-1" />
                {copied ? "복사됨" : "바코드 번호 복사"}
              </Button>
            </div>
          </div>
        </section>

        {/* Product meta info */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Info size={12} />
            상품 정보
          </h3>
          <dl className="divide-y divide-slate-100">
            <InfoRow
              label="발행자"
              value={purchase.issuer}
              icon={<BadgeCheck size={14} className="text-[#0038F1]" />}
            />
            <InfoRow
              label="유효기간"
              value={`${formatDate(purchase.expiresAt)} 까지`}
              icon={<Calendar size={14} className="text-[#0038F1]" />}
            />
            <InfoRow
              label="구매일"
              value={formatDate(purchase.purchasedAt)}
            />
            <InfoRow
              label="사용여부"
              value={isUsed ? "사용완료" : "사용전"}
              valueClassName={
                isUsed ? "text-slate-500" : "text-[#0038F1] font-bold"
              }
            />
          </dl>
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

        {/* Back to list CTA */}
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => router.push("/shop/history")}
          className="mt-6 h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          내 마일리지로 돌아가기
        </Button>
        </div>
      </div>
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
