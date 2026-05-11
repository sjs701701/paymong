"use client";

import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { PURCHASES, USER_MILEAGE } from "./data";
import { ProductCard } from "./product-card";

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function WalletShell() {
  const router = useRouter();

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
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

        {/* Purchase history */}
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
      </div>
    </main>
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
