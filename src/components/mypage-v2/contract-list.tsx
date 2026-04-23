"use client";

import Link from "next/link";
import { type ChangeEvent } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";

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
  onSelect: (id: number) => void;
};

export function ContractList({
  contracts,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
}: ContractListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pb-4 pt-4 sm:px-5 lg:px-5 lg:pt-5">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h1 className="text-xl font-bold tracking-[-0.04em] text-slate-900 sm:text-2xl">
            계약리스트
          </h1>
          <span className="text-xs text-slate-400">{contracts.length}건</span>
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
            className="h-auto rounded-xl border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#00abff]"
          />
        </div>
      </div>

      <CustomScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 px-4 pb-4 sm:px-5">
          {contracts.length > 0 ? (
            contracts.map((contract) => {
              const isSelected = selectedId === contract.id;
              return (
                <button
                  key={contract.id}
                  type="button"
                  onClick={() => onSelect(contract.id)}
                  aria-current={isSelected ? "true" : undefined}
                  className={cn(
                    "group/card flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left transition",
                    isSelected
                      ? "border-transparent bg-gradient-to-br from-[#00abff]/10 to-[#0038F1]/10 shadow-md ring-2 ring-[#0038F1]/40"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#00abff]">
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
                    <h2 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                      {contract.name}
                    </h2>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">계약 금액</span>
                      <span className="text-sm font-bold text-slate-900">
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

      <div className="shrink-0 border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-5">
        <Button
          size="lg"
          nativeButton={false}
          className="h-auto w-full gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white! shadow-sm hover:bg-black hover:text-white!"
          render={<Link href="/contracts/new" />}
        >
          <Plus size={18} />
          계약 등록하기
        </Button>
      </div>
    </div>
  );
}
