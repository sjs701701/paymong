"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ChevronDown, Search, Wallet, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import {
  CATEGORIES,
  CATEGORY_BRANDS,
  type CategoryId,
  PRICE_RANGES,
  type PriceRangeId,
  PRODUCTS,
  USER_MILEAGE,
} from "./data";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { BrandSheet, PriceSheet } from "./filter-sheet";

const PAGE_SIZE = 24;

export function ShopShell() {
  const [categoryId, setCategoryId] = useState<CategoryId>("all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRangeId, setPriceRangeId] = useState<PriceRangeId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const gridSectionRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only start drag tracking for primary button on mouse / pen. Touch uses native scroll.
    if (e.pointerType === "touch") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
    // Do NOT capture pointer yet — capturing here redirects the click event
    // off the chip and onto the wrapper. Capture only once a drag is confirmed.
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== e.pointerId) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    const dx = e.clientX - state.startX;
    if (!state.moved && Math.abs(dx) > 4) {
      state.moved = true;
      el.style.cursor = "grabbing";
      // Now we know it's a drag — capture to keep receiving events outside
      el.setPointerCapture(e.pointerId);
    }
    if (state.moved) {
      el.scrollLeft = state.startScrollLeft - dx;
    }
  };

  const finishDrag = (pointerId: number) => {
    const state = dragStateRef.current;
    if (state.pointerId !== pointerId) return;
    const el = categoryScrollRef.current;
    if (el && el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
    if (el) el.style.cursor = "";
    state.active = false;
    state.pointerId = null;
    // Keep `moved` true synchronously so the bubbling click handler can suppress
    if (state.moved) {
      window.setTimeout(() => {
        dragStateRef.current.moved = false;
      }, 0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.pointerId);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.pointerId);
  };

  // Suppress chip click if a drag just happened
  const handleCategoryClickCapture = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (dragStateRef.current.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

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

  // Hide header on scroll-down, show on scroll-up (all viewports)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
      );
      const maxScrollTop = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      const safe = Math.max(0, Math.min(scrollTop, maxScrollTop));

      // Ignore scroll events triggered by programmatic scrollTo (filter reset, etc.)
      if (isProgrammaticScrollRef.current) {
        lastScrollTopRef.current = safe;
        return;
      }

      const prev = lastScrollTopRef.current;
      const delta = safe - prev;
      lastScrollTopRef.current = safe;

      if (safe < 40) {
        setIsHeaderHidden((c) => (c ? false : c));
        return;
      }
      if (Math.abs(delta) < 2) return;

      const bottomDist = maxScrollTop - safe;
      const prevBottomDist = maxScrollTop - prev;
      if (delta < 0 && bottomDist < 24 && prevBottomDist < 24) return;

      const shouldHide = delta > 0;
      setIsHeaderHidden((c) => (c === shouldHide ? c : shouldHide));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const availableBrands = CATEGORY_BRANDS[categoryId] ?? [];

  const filteredProducts = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.id === priceRangeId);
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (categoryId !== "all" && p.category !== categoryId) return false;
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(p.brand)
      )
        return false;
      if (range) {
        if (p.price < range.min) return false;
        if (range.max != null && p.price >= range.max) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.brand}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [categoryId, selectedBrands, priceRangeId, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, pageCount * PAGE_SIZE);
  const hasMore = visibleProducts.length < filteredProducts.length;

  // Reset paging when filters change (render-time pattern)
  const filterKey = `${categoryId}|${selectedBrands.join(",")}|${priceRangeId}|${searchQuery}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPageCount(1);
  }

  // Scroll grid section back into view whenever filters change
  useEffect(() => {
    const el = gridSectionRef.current;
    if (!el) return;
    const targetY = el.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    const currentY = window.scrollY;
    if (currentY > targetY) {
      isProgrammaticScrollRef.current = true;
      window.scrollTo({ top: targetY, behavior: "auto" });
      // Clear flag after the resulting scroll event has been processed
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 100);
    }
  }, [filterKey, headerHeight]);

  // Reset brand selection when category changes
  const handleCategoryChange = (next: CategoryId) => {
    if (next === categoryId) return;
    setCategoryId(next);
    if (selectedBrands.length > 0) {
      setSelectedBrands([]);
      setResetToast(true);
    }
  };

  useEffect(() => {
    if (!resetToast) return;
    const t = window.setTimeout(() => setResetToast(false), 2400);
    return () => window.clearTimeout(t);
  }, [resetToast]);

  // Infinite scroll via IntersectionObserver (window viewport)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPageCount((prev) => prev + 1);
          }
        }
      },
      { rootMargin: "300px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleProducts.length]);

  const priceLabel = useMemo(() => {
    const r = PRICE_RANGES.find((p) => p.id === priceRangeId);
    return r ? r.label : "전체";
  }, [priceRangeId]);

  const brandLabel =
    selectedBrands.length === 0
      ? "전체"
      : selectedBrands.length === 1
        ? selectedBrands[0]
        : `${selectedBrands[0]} 외 ${selectedBrands.length - 1}`;

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-[#eef2fa]"
      style={
        {
          "--shop-header-height": `${headerHeight}px`,
          "--shop-header-shift": `${isHeaderHidden ? -headerHeight : 0}px`,
        } as CSSProperties
      }
    >
      <DashboardHeader
        ref={headerRef}
        hidden={isHeaderHidden}
        className="sticky top-0 z-30 px-0 md:px-0"
        innerClassName="mx-auto max-w-[1200px] px-4 sm:px-6"
      />

      {/* Sticky filter rail — translates up with the header on hide */}
      <div
        className="sticky z-20 border-b border-slate-200 bg-white/95 backdrop-blur transition-transform duration-300 ease-in-out will-change-transform supports-[backdrop-filter]:bg-white/85"
        style={{
          top: "var(--shop-header-height)",
          transform: "translateY(var(--shop-header-shift))",
        }}
      >
        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col gap-2.5 px-4 py-3 sm:px-6 sm:py-4 lg:gap-3 lg:py-5">
            {/* Title + search + mileage row (responsive: wraps on mobile) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-x-4 lg:gap-x-6">
              <BackButton
                variant="ghost"
                fallbackHref="/"
                iconClassName="transition-transform group-hover:-translate-x-1"
                className="group h-auto shrink-0 rounded-none p-0 text-slate-600 hover:bg-transparent hover:text-slate-950"
              />
              <h1 className="text-lg font-bold tracking-[-0.04em] text-slate-900 sm:text-lg sm:tracking-[-0.03em] sm:text-slate-950 lg:text-xl">
                기프티콘 샵
              </h1>

              <span
                aria-hidden
                className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block lg:h-7"
              />

              <div className="relative order-3 w-full min-w-0 sm:order-2 sm:w-auto sm:flex-1">
                <Search
                  size={16}
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors lg:left-4",
                    searchFocused || searchQuery
                      ? "text-[#0038F1]"
                      : "text-slate-400",
                  )}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="브랜드 또는 상품명을 검색해보세요"
                  className={cn(
                    "h-10 w-full rounded-xl border bg-slate-50 pr-10 pl-10 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#0038F1] focus:bg-white focus:outline-none sm:h-11 lg:h-12 lg:pr-12 lg:pl-12 lg:text-[15px]",
                    searchFocused || searchQuery
                      ? "border-[#0038F1]"
                      : "border-slate-200",
                  )}
                  aria-label="상품 검색"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="검색어 지우기"
                    className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:right-2.5 lg:h-8 lg:w-8"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              <Link
                href="/shop/history"
                aria-label="내 마일리지 잔액 및 구매 내역 보기"
                className="order-2 ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs font-bold text-[#0038F1] ring-1 ring-[#0038F1]/15 transition hover:bg-[#0038F1]/8 hover:ring-[#0038F1]/30 active:scale-[0.97] sm:order-3 sm:ml-0 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm lg:gap-2 lg:px-4 lg:py-2.5"
              >
                <Wallet
                  aria-hidden
                  className="size-3 shrink-0 sm:size-3.5 lg:size-4"
                />
                <span className="whitespace-nowrap">
                  {USER_MILEAGE.toLocaleString("ko-KR")} P
                </span>
              </Link>
            </div>

            {/* Category chips */}
            <div className="-mx-4 sm:-mx-6">
              <div
                ref={categoryScrollRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onClickCapture={handleCategoryClickCapture}
                className="flex cursor-grab gap-1.5 overflow-x-auto px-4 py-1 select-none [scrollbar-width:none] sm:gap-2 sm:px-6 sm:py-1.5 [&::-webkit-scrollbar]:hidden"
              >
                {CATEGORIES.map((cat) => {
                  const active = cat.id === categoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors lg:px-4 lg:py-2.5 lg:text-sm",
                        active
                          ? "bg-[#0038F1] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
                      )}
                      aria-pressed={active}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter row: brand + price */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FilterChip
                  label="브랜드"
                  value={selectedBrands.length > 0 ? brandLabel : null}
                  count={selectedBrands.length}
                  disabled={categoryId === "all"}
                  onClick={() => setBrandSheetOpen(true)}
                />
                <FilterChip
                  label="가격"
                  value={priceRangeId !== "all" ? priceLabel : null}
                  onClick={() => setPriceSheetOpen(true)}
                />
                {(selectedBrands.length > 0 || priceRangeId !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrands([]);
                      setPriceRangeId("all");
                    }}
                    className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-[#0038F1]"
                  >
                    <X size={12} />
                    초기화
                  </button>
                )}
              </div>
              <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                <span className="font-bold text-slate-700">
                  {filteredProducts.length.toLocaleString("ko-KR")}
                </span>
                개 상품
              </span>
            </div>
          </div>

          {/* Brand reset toast */}
          <div
            aria-live="polite"
            className={cn(
              "pointer-events-none absolute right-4 -bottom-12 left-4 z-20 mx-auto max-w-md rounded-xl bg-slate-900/95 px-3.5 py-2 text-center text-xs font-medium text-white shadow-lg transition-all duration-300",
              resetToast
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
            )}
          >
            카테고리가 바뀌어 브랜드 필터가 초기화되었어요.
          </div>
        </div>
      </div>

      {/* Grid */}
      <section
        ref={gridSectionRef}
        className="mx-auto w-full max-w-[1200px] flex-1 px-3 pt-4 pb-16 sm:px-4 sm:pt-5 lg:px-6"
      >
        <p className="mb-3 px-1 text-xs font-medium text-slate-500 sm:hidden">
          <span className="font-bold text-slate-700">
            {filteredProducts.length.toLocaleString("ko-KR")}
          </span>
          개 상품
        </p>

        {visibleProducts.length === 0 ? (
          <EmptyState
            onReset={() => {
              setCategoryId("all");
              setSelectedBrands([]);
              setPriceRangeId("all");
              setSearchQuery("");
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0038F1] focus-visible:ring-offset-2"
                >
                  <ProductCard product={product} />
                </Link>
              ))}
              {hasMore
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={`skeleton-${i}`} />
                  ))
                : null}
            </div>

            {hasMore ? (
              <div ref={sentinelRef} className="h-12 w-full" aria-hidden />
            ) : visibleProducts.length > PAGE_SIZE ? (
              <p className="mt-8 text-center text-xs text-slate-400">
                마지막 상품까지 모두 봤어요
              </p>
            ) : null}
          </>
        )}
      </section>

      <BrandSheet
        open={brandSheetOpen}
        brands={availableBrands}
        selected={selectedBrands}
        onClose={() => setBrandSheetOpen(false)}
        onApply={(next) => setSelectedBrands(next)}
      />
      <PriceSheet
        open={priceSheetOpen}
        options={PRICE_RANGES.map((r) => ({ id: r.id, label: r.label }))}
        selectedId={priceRangeId}
        onClose={() => setPriceSheetOpen(false)}
        onApply={(id) => setPriceRangeId(id as PriceRangeId)}
      />
    </main>
  );
}

type FilterChipProps = {
  label: string;
  value: string | null;
  count?: number;
  disabled?: boolean;
  onClick: () => void;
};

function FilterChip({
  label,
  value,
  count,
  disabled,
  onClick,
}: FilterChipProps) {
  const active = value != null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 max-w-[180px] items-center gap-1 rounded-full border px-3 text-xs font-semibold transition lg:h-10 lg:px-3.5 lg:text-sm",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : active
            ? "border-[#0038F1] bg-[#0038F1]/8 text-[#0038F1]"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
      )}
    >
      <span className="truncate">
        {label}
        {active ? (
          <>
            <span className="text-slate-400"> · </span>
            <span className="font-bold">{value}</span>
          </>
        ) : null}
      </span>
      {count && count > 1 ? (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0038F1] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
      <ChevronDown size={14} className="ml-0.5 shrink-0 opacity-70" />
    </button>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#0038F1] ring-1 ring-slate-200">
        <Search size={20} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">
        조건에 맞는 상품이 없어요
      </p>
      <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-500">
        필터를 조금 풀어보거나 카테고리를 바꿔보세요. 다른 가격대에 더 많은
        선택지가 있을 수 있어요.
      </p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onReset}
        className="mt-5 h-10 rounded-xl border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        필터 초기화
      </Button>
    </div>
  );
}
