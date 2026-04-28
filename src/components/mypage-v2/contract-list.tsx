"use client";

import Link from "next/link";
import { type ChangeEvent } from "react";
import { ChevronRight, Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  type ContractItem,
  STATUS_BADGE_CLASS,
} from "./data";

type ContractListProps = {
  contracts: ContractItem[];
  selectedId: number | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onSelect: (id: number) => void;
  onListScrollChange?: (metrics: {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }) => void;
};

export function ContractList({
  contracts,
  selectedId,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onSelect,
  onListScrollChange,
}: ContractListProps) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden [--contract-list-footer-height:82px]">
      <div
        className="absolute inset-x-0 top-0 flex h-[calc(100%-var(--contract-list-footer-height)+var(--dashboard-content-extension,0px))] min-h-0 flex-col transition-[height,transform] duration-200 ease-out will-change-transform lg:h-[calc(100%-var(--contract-list-footer-height))] lg:translate-y-0 lg:transition-none"
        style={{
          transform: "translateY(var(--dashboard-header-shift,0px))",
        }}
      >
        <div className="shrink-0 px-4 pb-4 pt-4 sm:px-5 lg:px-5 lg:pt-5">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h1 className="text-xl font-bold tracking-[-0.04em] text-slate-900 sm:text-2xl">
              계약리스트
            </h1>
            <span className="text-xs text-slate-500">
              {contracts.length}건
            </span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
              <Search size={18} className="text-slate-400" />
            </div>
            <Input
              id="contract-search-v2"
              type="text"
              placeholder="계약명 검색"
              value={searchQuery}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onSearchChange(event.target.value)
              }
              className={cn(
                "h-auto rounded-xl border-slate-200 bg-white py-3 pl-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#00abff]",
                searchQuery ? "pr-11" : "pr-4",
              )}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="검색어 지우기"
                className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100">
                  <X size={14} />
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <CustomScrollArea
          className="min-h-0 flex-1"
          onScrollChange={onListScrollChange}
        >
          <div className="flex flex-col gap-2 px-4 pt-1 pb-4 sm:px-5">
            {contracts.length > 0 ? (
              contracts.map((contract) => {
                const isSelected = selectedId === contract.id;
                const isActive = contract.status === "승인됨";
                return (
                  <button
                    key={contract.id}
                    type="button"
                    onClick={() => onSelect(contract.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "group/card flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
                      isSelected
                        ? "border-transparent bg-gradient-to-br from-[#00abff]/10 to-[#0038F1]/10 shadow-md ring-2 ring-[#0038F1]/40"
                        : isActive
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100/70",
                    )}
                  >
                    <div
                      className={cn(
                        "min-w-0 flex-1",
                        !isActive && !isSelected && "opacity-70",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            isActive ? "text-[#00abff]" : "text-slate-500",
                          )}
                        >
                          {contract.type}
                        </span>
                        <Badge
                          className={cn(
                            "h-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            STATUS_BADGE_CLASS[contract.status],
                          )}
                        >
                          {contract.status}
                        </Badge>
                      </div>
                      <h2
                        className={cn(
                          "mt-1.5 line-clamp-2 text-sm font-semibold leading-snug",
                          isActive ? "text-slate-900" : "text-slate-700",
                        )}
                      >
                        {contract.name}
                      </h2>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-600">
                          계약 금액
                        </span>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            isActive ? "text-slate-900" : "text-slate-600",
                          )}
                        >
                          {contract.amount}원
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className={cn(
                        "mt-1 shrink-0 transition-transform",
                        isSelected
                          ? "text-[#0038F1]"
                          : "text-slate-300 group-hover/card:translate-x-0.5 group-hover/card:text-slate-400",
                      )}
                    />
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <p className="text-sm text-slate-500">
                  {searchQuery.trim()
                    ? "검색 결과가 없습니다."
                    : "등록된 계약이 없습니다."}
                </p>
              </div>
            )}
          </div>
        </CustomScrollArea>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[var(--contract-list-footer-height)] border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-5">
        <Button
          size="lg"
          nativeButton={false}
          onMouseEnter={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty(
              "--pointer-x",
              `${event.clientX - rect.left}px`,
            );
            event.currentTarget.style.setProperty(
              "--pointer-y",
              `${event.clientY - rect.top}px`,
            );
          }}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty(
              "--pointer-x",
              `${event.clientX - rect.left}px`,
            );
            event.currentTarget.style.setProperty(
              "--pointer-y",
              `${event.clientY - rect.top}px`,
            );
          }}
          className="relative h-auto w-full gap-2 overflow-hidden rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white! shadow-sm"
          render={<Link href="/contracts/new" />}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[var(--pointer-y,50%)] left-[var(--pointer-x,50%)] h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#0038F1] transition-transform duration-500 ease-out group-hover/button:scale-100"
          />
          <span className="relative z-10 inline-flex items-center gap-2">
            <Plus size={18} />
            계약 등록하기
          </span>
        </Button>
      </div>
    </div>
  );
}
