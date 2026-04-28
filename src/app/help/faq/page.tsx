"use client";

import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import { HelpTabs } from "@/components/help/help-tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategoryFilter,
} from "@/data/help-faq";

function getTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, tokens: string[]): ReactNode {
  if (tokens.length === 0) return text;
  const pattern = tokens.map(escapeRegex).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="rounded bg-yellow-200 px-0.5 font-semibold text-slate-900"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function answerHasMatch(answer: string, tokens: string[]) {
  if (tokens.length === 0) return false;
  const lower = answer.toLowerCase();
  return tokens.some((token) => lower.includes(token));
}

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FaqCategoryFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const tokens = useMemo(() => getTokens(search), [search]);

  const filtered = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (tokens.length === 0) return true;
      const combined = `${item.question} ${item.answer}`.toLowerCase();
      return tokens.every((token) => combined.includes(token));
    });
  }, [category, tokens]);

  return (
    <div>
      <div
        className="sticky top-[var(--help-header-height)] z-20 bg-[#eef2fa] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: "translateY(var(--help-header-shift))",
        }}
      >
        <nav
          aria-label="게시판 탭"
          className="border-b border-slate-200 bg-white"
        >
          <HelpTabs />
        </nav>

        <div className="mx-auto w-full max-w-[920px] space-y-3 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="faq-search"
              type="text"
              value={search}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
              placeholder="궁금한 키워드를 검색해보세요"
              className={cn(
                "h-auto rounded-xl border-slate-200 bg-white py-3 pl-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#00abff]",
                search ? "pr-11" : "pr-4",
              )}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="검색어 지우기"
                className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100">
                  <X size={14} />
                </span>
              </button>
            ) : null}
          </div>

          <div className="-mx-4 sm:-mx-6">
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAQ_CATEGORIES.map((cat) => {
                const isActive = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    aria-pressed={isActive}
                    className={cn(
                      "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-75",
                      isActive
                        ? "border-[#0038F1] bg-[#0038F1] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[920px] space-y-4 px-4 pt-4 sm:px-6">

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            검색 결과가 없어요
          </p>
          <p className="text-xs leading-5 text-slate-500">
            다른 키워드로 검색하거나 카테고리를 변경해보세요.
            <br />원하는 내용이 없다면 고객센터로 문의 부탁드려요.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => {
            const isAnswerMatched = answerHasMatch(item.answer, tokens);
            const isOpen = isAnswerMatched || openId === item.id;
            const categoryLabel =
              FAQ_CATEGORIES.find((c) => c.key === item.category)?.label ?? "";
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-75 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0038F1]/10 text-xs font-bold text-[#0038F1]">
                    Q
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {categoryLabel}
                    </span>
                    <p className="mt-0.5 text-sm font-semibold leading-6 text-slate-900">
                      {highlight(item.question, tokens)}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "mt-1 shrink-0 text-slate-400 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        A
                      </span>
                      <p className="min-w-0 flex-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {highlight(item.answer, tokens)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}
