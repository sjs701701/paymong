"use client";

import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Receipt, ShoppingBag, Ticket, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { PURCHASES, USER_MILEAGE } from "./data";
import { ProductCard } from "./product-card";

type WalletTab = "gifticons" | "mileage";

type MileageHistoryType = "earn" | "use" | "expire" | "refund";

type MileageFilter = "all" | MileageHistoryType;

type MileageHistoryItem = {
  id: string;
  date: string;
  type: MileageHistoryType;
  title: string;
  description: string;
  amount: number;
  balance: number;
};

const WALLET_TABS: Array<{
  key: WalletTab;
  label: string;
  icon: typeof Ticket;
}> = [
  { key: "gifticons", label: "기프티콘", icon: Ticket },
  { key: "mileage", label: "마일리지 내역", icon: Receipt },
];

const MILEAGE_TYPE_LABEL: Record<MileageHistoryType, string> = {
  earn: "적립",
  use: "사용",
  expire: "소멸",
  refund: "취소",
};

const MILEAGE_FILTERS: Array<{
  key: MileageFilter;
  label: string;
}> = [
  { key: "all", label: "전체" },
  { key: "earn", label: "적립" },
  { key: "use", label: "사용" },
  { key: "refund", label: "취소" },
  { key: "expire", label: "소멸" },
];

const MILEAGE_HISTORY: MileageHistoryItem[] = [
  {
    id: "m1",
    date: "2026.05.11",
    type: "use",
    title: "기프티콘 교환",
    description: "배달의민족 모바일 상품권 교환",
    amount: -23000,
    balance: 124300,
  },
  {
    id: "m2",
    date: "2026.05.08",
    type: "earn",
    title: "계약 결제 마일리지 적립",
    description: "판교 푸르지오 그랑블 101동 1502호",
    amount: 12000,
    balance: 147300,
  },
  {
    id: "m3",
    date: "2026.05.03",
    type: "earn",
    title: "예약 송금 이벤트 적립",
    description: "5월 월세 자동결제 예약 이벤트",
    amount: 3000,
    balance: 135300,
  },
  {
    id: "m4",
    date: "2026.04.28",
    type: "refund",
    title: "기프티콘 교환 취소",
    description: "미사용 기프티콘 교환 취소 환급",
    amount: 9500,
    balance: 132300,
  },
  {
    id: "m5",
    date: "2026.04.20",
    type: "use",
    title: "기프티콘 교환",
    description: "스타벅스 아메리카노 Tall",
    amount: -4500,
    balance: 122800,
  },
  {
    id: "m6",
    date: "2026.04.01",
    type: "expire",
    title: "유효기간 만료",
    description: "2025년 4월 적립 마일리지 소멸",
    amount: -1200,
    balance: 127300,
  },
];

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function formatMileageAmount(value: number): string {
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${Math.abs(value).toLocaleString("ko-KR")} P`;
}

export function WalletShell() {
  const router = useRouter();

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [activeTab, setActiveTab] = useState<WalletTab>("gifticons");
  const lastScrollTopRef = useRef(0);

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

      const bottomDist = max - safe;
      const prevBottomDist = max - prev;
      if (delta < 0 && bottomDist < 24 && prevBottomDist < 24) return;

      const shouldHide = delta > 0;
      setIsHeaderHidden((c) => (c === shouldHide ? c : shouldHide));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-[#eef2fa]"
      style={
        {
          "--wallet-header-height": `${headerHeight}px`,
          "--wallet-header-shift": `${isHeaderHidden ? -headerHeight : 0}px`,
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
          top: "var(--wallet-header-height)",
          transform: "translateY(var(--wallet-header-shift))",
        }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <BackButton
            variant="ghost"
            fallbackHref="/shop"
            iconClassName="transition-transform group-hover:-translate-x-1"
            className="group h-auto shrink-0 rounded-none p-0 text-slate-600 hover:bg-transparent hover:text-slate-950"
          />
          <h1 className="text-lg font-bold tracking-[-0.04em] text-slate-900 sm:text-lg sm:tracking-[-0.03em] sm:text-slate-950 lg:text-xl">
            내 마일리지
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-5 pb-16 sm:px-6 sm:pt-6">
        {/* Balance card */}
        <section
          className="relative mb-8 overflow-hidden rounded-2xl p-6 text-white shadow-lg shadow-[#0038F1]/20 sm:p-8 lg:p-10"
          style={{
            background:
              "linear-gradient(135deg, #0038F1 0%, #1a4cf3 55%, #00abff 100%)",
          }}
        >
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl sm:h-56 sm:w-56" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#00abff]/30 blur-2xl sm:h-52 sm:w-52" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="opacity-90" />
              <span className="text-xs font-medium opacity-90 sm:text-sm">
                보유 마일리지
              </span>
            </div>
            <p className="mt-3 flex items-baseline gap-2 tracking-tight">
              <span className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                {USER_MILEAGE.toLocaleString("ko-KR")}
              </span>
              <span className="text-2xl font-bold opacity-90 sm:text-3xl">P</span>
            </p>
            <Button
              type="button"
              size="lg"
              onClick={() => router.push("/shop")}
              className="mt-5 inline-flex h-11 items-center gap-1 rounded-xl bg-white px-5 text-sm font-bold text-[#0038F1] shadow-sm hover:bg-white/95 active:bg-white/85 sm:mt-6 sm:h-12 sm:px-6 sm:text-[15px]"
            >
              기프티콘 구매하러 가기
              <ArrowRight size={16} className="ml-0.5" />
            </Button>
          </div>
        </section>

        <div
          role="tablist"
          aria-label="내 마일리지 보기 방식"
          className="relative mb-5 inline-flex max-w-full items-center gap-1 rounded-full bg-white p-1"
        >
          {WALLET_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "group relative inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0038F1]/30 sm:h-11 sm:px-5",
                  isActive
                    ? "bg-[#0038F1] text-white"
                    : "text-[#0038F1]/70 hover:bg-white/70 hover:text-[#0038F1]",
                )}
              >
                <Icon
                  size={15}
                  strokeWidth={2.5}
                  className={cn(
                    "shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-700",
                  )}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "gifticons" ? (
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                구매한 기프티콘
              </h2>
              <span className="text-xs text-slate-500 sm:text-sm">
                총{" "}
                <span className="font-bold text-slate-700">
                  {PURCHASES.length}
                </span>
                개
              </span>
            </div>

            {PURCHASES.length === 0 ? (
              <EmptyHistory onShop={() => router.push("/shop")} />
            ) : (
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {PURCHASES.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/shop/history/${p.id}`}
                      className="flex flex-col gap-1.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0038F1] focus-visible:ring-offset-2"
                    >
                      <div className="relative">
                        <ProductCard
                          product={p.product}
                          className={
                            p.used
                              ? "border-slate-200 bg-slate-50 opacity-70 grayscale"
                              : ""
                          }
                        />
                        <span
                          aria-label={p.used ? "사용완료" : "사용전"}
                          className={cn(
                            "absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight shadow-sm sm:px-2.5 sm:text-[11px]",
                            p.used
                              ? "bg-slate-500 text-white"
                              : "bg-[#0038F1] text-white",
                          )}
                        >
                          {p.used ? "사용완료" : "사용전"}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "px-1 text-[11px] font-medium sm:text-xs",
                          p.used ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        {formatDate(p.purchasedAt)} 구매
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <MileageHistory />
        )}
      </div>
    </main>
  );
}

function MileageHistory() {
  const [activeFilter, setActiveFilter] = useState<MileageFilter>("all");
  const filteredHistory =
    activeFilter === "all"
      ? MILEAGE_HISTORY
      : MILEAGE_HISTORY.filter((item) => item.type === activeFilter);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          마일리지 내역
        </h2>
        <span className="text-xs text-slate-500 sm:text-sm">
          총{" "}
          <span className="font-bold text-slate-700">
            {filteredHistory.length}
          </span>
          건
        </span>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MILEAGE_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors sm:px-4 sm:text-sm",
                isActive
                  ? "bg-[#0038F1] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {filteredHistory.map((item) => {
            const isPositive = item.amount > 0;
            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                        item.type === "earn" &&
                          "bg-[#0038F1]/10 text-[#0038F1]",
                        item.type === "use" && "bg-slate-100 text-slate-700",
                        item.type === "refund" &&
                          "bg-emerald-50 text-emerald-700",
                        item.type === "expire" && "bg-rose-50 text-rose-700",
                      )}
                    >
                      {MILEAGE_TYPE_LABEL[item.type]}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {item.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-sm font-extrabold sm:text-base",
                      isPositive ? "text-[#0038F1]" : "text-slate-900",
                    )}
                  >
                    {formatMileageAmount(item.amount)}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400 sm:text-xs">
                    잔액 {item.balance.toLocaleString("ko-KR")} P
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function EmptyHistory({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]">
        <ShoppingBag size={22} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">
        아직 구매한 기프티콘이 없어요
      </p>
      <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-500">
        보유한 마일리지로 기프티콘을 교환해보세요.
      </p>
      <Button
        type="button"
        size="lg"
        onClick={onShop}
        className="mt-5 h-10 rounded-xl bg-[#0038F1] px-5 text-xs font-semibold text-white hover:bg-[#002fd0]"
      >
        기프티콘 보러 가기
      </Button>
    </div>
  );
}
