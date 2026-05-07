"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import type { Product } from "./data";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const { primary, secondary, accent } = useMemo(() => {
    const h = product.imageHue;
    return {
      primary: `hsl(${h} 70% 88%)`,
      secondary: `hsl(${(h + 35) % 360} 75% 78%)`,
      accent: `hsl(${(h + 200) % 360} 60% 45%)`,
    };
  }, [product.imageHue]);

  const initials = product.brand.slice(0, 2);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#0038F1]/40 hover:shadow-md",
        className,
      )}
    >
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 text-base font-extrabold tracking-tight text-slate-900 ring-1 ring-white/60 backdrop-blur-sm sm:h-16 sm:w-16 sm:text-lg"
            style={{ color: accent }}
          >
            {initials}
          </div>
        </div>
        <div className="absolute top-2 left-2 inline-flex items-center rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold tracking-tight text-slate-700 backdrop-blur-sm sm:text-[11px]">
          {product.brand}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 py-3 sm:gap-2 sm:px-3.5 sm:py-3.5">
        <p className="line-clamp-2 min-h-[2.5em] text-[12px] leading-snug font-semibold text-slate-900 sm:text-[13px]">
          {product.name}
        </p>
        <div className="mt-auto flex items-baseline gap-1">
          <span className="text-[15px] font-extrabold text-[#0038F1] sm:text-base">
            {product.price.toLocaleString("ko-KR")}
          </span>
          <span className="text-[11px] font-semibold text-[#0038F1]/80 sm:text-xs">
            P
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="aspect-square w-full animate-pulse bg-slate-100" />
      <div className="flex flex-col gap-2 px-3 py-3 sm:px-3.5 sm:py-3.5">
        <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-1 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
