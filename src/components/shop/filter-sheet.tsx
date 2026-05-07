"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BrandSheetProps = {
  open: boolean;
  brands: string[];
  selected: string[];
  onClose: () => void;
  onApply: (next: string[]) => void;
};

export function BrandSheet({
  open,
  brands,
  selected,
  onClose,
  onApply,
}: BrandSheetProps) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [query, setQuery] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(selected);
      setQuery("");
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, query]);

  const toggle = (brand: string) => {
    setDraft((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand],
    );
  };

  return (
    <SheetShell open={open} onClose={onClose} title="브랜드 선택">
      {brands.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
          카테고리를 먼저 선택해주세요.
        </div>
      ) : (
        <>
          <div className="border-b border-slate-100 px-5 py-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="브랜드 검색"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0038F1] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            <ul className="flex flex-col">
              {filteredBrands.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-slate-500">
                  일치하는 브랜드가 없어요.
                </li>
              ) : (
                filteredBrands.map((brand) => {
                  const checked = draft.includes(brand);
                  return (
                    <li key={brand}>
                      <button
                        type="button"
                        onClick={() => toggle(brand)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50",
                          checked && "text-[#0038F1]",
                        )}
                      >
                        <span>{brand}</span>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-md border transition",
                            checked
                              ? "border-[#0038F1] bg-[#0038F1] text-white"
                              : "border-slate-300 bg-white text-transparent",
                          )}
                        >
                          <Check size={14} />
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="flex gap-2 border-t border-slate-100 bg-white px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setDraft([])}
              className="h-12 flex-1 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              초기화
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
              className="h-12 flex-[1.6] rounded-xl bg-[#0038F1] text-sm font-semibold text-white hover:bg-[#002fd0]"
            >
              {draft.length > 0 ? `${draft.length}개 적용` : "적용"}
            </Button>
          </div>
        </>
      )}
    </SheetShell>
  );
}

type PriceSheetProps = {
  open: boolean;
  options: { id: string; label: string }[];
  selectedId: string;
  onClose: () => void;
  onApply: (id: string) => void;
};

export function PriceSheet({
  open,
  options,
  selectedId,
  onClose,
  onApply,
}: PriceSheetProps) {
  const [draft, setDraft] = useState(selectedId);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(selectedId);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <SheetShell open={open} onClose={onClose} title="가격대 선택">
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="flex flex-col">
          {options.map((opt) => {
            const active = draft === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => setDraft(opt.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition hover:bg-slate-50",
                    active ? "text-[#0038F1]" : "text-slate-700",
                  )}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition",
                      active
                        ? "border-[#0038F1] bg-white"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {active ? (
                      <span className="block h-2.5 w-2.5 rounded-full bg-[#0038F1]" />
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-3">
        <Button
          type="button"
          size="lg"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          className="h-12 w-full rounded-xl bg-[#0038F1] text-sm font-semibold text-white hover:bg-[#002fd0]"
        >
          적용
        </Button>
      </div>
    </SheetShell>
  );
}

type SheetShellProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function SheetShell({ open, title, onClose, children }: SheetShellProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[120] transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-slate-900/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute right-0 bottom-0 left-0 mx-auto flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out sm:bottom-1/2 sm:translate-y-1/2 sm:rounded-2xl",
          open ? "translate-y-0" : "translate-y-full",
          open ? "sm:opacity-100" : "sm:opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-m-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
