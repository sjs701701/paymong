"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Check,
  FileSpreadsheet,
  ReceiptText,
  Search,
  X,
} from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  CONTRACT_DETAILS,
  SAMPLE_CONTRACTS,
  type ContractItem,
  type UsageHistoryItem,
} from "@/components/mypage-v2/data";

type TaxReportItem = {
  id: string;
  usageId: number;
  date: string;
  month: string;
  amount: number;
  supplyAmount: number;
  vat: number;
  senderName: string;
  contractId: number;
  contractType: string;
  contractCategory: ContractCategory;
  contractName: string;
  counterpartyName: string;
};

const CONTRACT_TYPE_FILTERS = [
  "월세",
  "관리비/배달료",
  "보증금",
  "교육비",
  "인건비/용역비",
  "보험료",
  "수리비/인테리어",
  "사업대금",
  "기타",
] as const;

type ContractCategory = (typeof CONTRACT_TYPE_FILTERS)[number];

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function getContractCategory(contractType: string): ContractCategory {
  if (contractType.includes("월세")) return "월세";
  if (contractType.includes("관리비") || contractType.includes("배달료")) {
    return "관리비/배달료";
  }
  if (contractType.includes("보증금")) return "보증금";
  if (contractType.includes("교육")) return "교육비";
  if (contractType.includes("인건비") || contractType.includes("용역")) {
    return "인건비/용역비";
  }
  if (contractType.includes("수리") || contractType.includes("인테리어")) {
    return "수리비/인테리어";
  }
  if (contractType.includes("보험")) return "보험료";
  if (contractType.includes("사업")) return "사업대금";
  return "기타";
}

function buildTaxReportItems(): TaxReportItem[] {
  return SAMPLE_CONTRACTS.flatMap((contract: ContractItem) => {
    const detail = CONTRACT_DETAILS[contract.id];
    if (!detail) return [];

    return detail.usageHistory
      .filter((usage: UsageHistoryItem) => usage.status === "송금완료")
      .map((usage) => {
        const supplyAmount = Math.round(usage.amount / 1.1);
        const vat = usage.amount - supplyAmount;

        return {
          id: `${contract.id}-${usage.id}`,
          usageId: usage.id,
          date: usage.date,
          month: usage.date.slice(0, 7),
          amount: usage.amount,
          supplyAmount,
          vat,
          senderName: usage.senderName,
          contractId: contract.id,
          contractType: contract.type,
          contractCategory: getContractCategory(contract.type),
          contractName: contract.name,
          counterpartyName: detail.counterparty.holder,
        };
      });
  }).sort((a, b) => b.date.localeCompare(a.date));
}

const TAX_REPORT_ITEMS = buildTaxReportItems();

function getDateRangeLabel(from: string, to: string) {
  if (from && to) return `${from} ~ ${to}`;
  if (from) return `${from} 이후`;
  if (to) return `${to} 이전`;
  return "날짜 선택";
}

export function TaxReportShell() {
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollTopRef = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedContractTypes, setSelectedContractTypes] = useState<
    ContractCategory[]
  >([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

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
      const scrollTop = window.scrollY;
      const delta = scrollTop - lastScrollTopRef.current;
      lastScrollTopRef.current = scrollTop;

      if (scrollTop < 40) {
        setIsHeaderHidden((current) => (current ? false : current));
        return;
      }
      if (Math.abs(delta) < 2) return;

      const shouldHideHeader = delta > 0;
      setIsHeaderHidden((current) =>
        current === shouldHideHeader ? current : shouldHideHeader,
      );
    };

    lastScrollTopRef.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return TAX_REPORT_ITEMS.filter((item) => {
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;
      if (
        selectedContractTypes.length > 0 &&
        !selectedContractTypes.includes(item.contractCategory)
      ) {
        return false;
      }
      if (!keyword) return true;

      const combined = [
        item.date,
        item.contractType,
        item.contractCategory,
        item.contractName,
        item.senderName,
        item.counterpartyName,
        String(item.amount),
      ]
        .join(" ")
        .toLowerCase();

      return combined.includes(keyword);
    });
  }, [dateFrom, dateTo, search, selectedContractTypes]);

  const selectedItems = useMemo(
    () => TAX_REPORT_ITEMS.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );

  const selectedTotalAmount = selectedItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const selectedVat = selectedItems.reduce((sum, item) => sum + item.vat, 0);
  const hasActiveFilters =
    Boolean(dateFrom || dateTo) ||
    selectedContractTypes.length > 0 ||
    Boolean(search.trim());
  const visibleSelectedCount = filteredItems.filter((item) =>
    selectedIds.includes(item.id),
  ).length;
  const allVisibleSelected =
    filteredItems.length > 0 && visibleSelectedCount === filteredItems.length;

  const toggleItem = (id: string) => {
    setRequestMessage(null);
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleVisibleItems = () => {
    setRequestMessage(null);
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredItems.map((item) => item.id));
      setSelectedIds((current) =>
        current.filter((selectedId) => !visibleIds.has(selectedId)),
      );
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      filteredItems.forEach((item) => next.add(item.id));
      return Array.from(next);
    });
  };

  const toggleContractTypeFilter = (contractType: ContractCategory) => {
    setSelectedContractTypes((current) =>
      current.includes(contractType)
        ? current.filter((item) => item !== contractType)
        : [...current, contractType],
    );
  };

  const openDateRangeModal = () => {
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setIsDateRangeOpen(true);
  };

  const applyDateRange = () => {
    if (draftDateFrom && draftDateTo && draftDateFrom > draftDateTo) {
      setDateFrom(draftDateTo);
      setDateTo(draftDateFrom);
      setIsDateRangeOpen(false);
      return;
    }

    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setIsDateRangeOpen(false);
  };

  const clearDateRange = () => {
    setDraftDateFrom("");
    setDraftDateTo("");
    setDateFrom("");
    setDateTo("");
    setIsDateRangeOpen(false);
  };

  const clearAllFilters = () => {
    setDateFrom("");
    setDateTo("");
    setDraftDateFrom("");
    setDraftDateTo("");
    setSelectedContractTypes([]);
    setSearch("");
  };

  const handleRequest = (label: string) => {
    if (selectedItems.length === 0) return;
    setRequestMessage(
      `${label} 신청 대상 ${selectedItems.length}건이 선택되었습니다.`,
    );
  };

  return (
    <div
      className="section-two-onward-font min-h-screen bg-[#eef2fa] text-[#151515]"
      style={
        {
          "--tax-header-height": `${headerHeight}px`,
          "--tax-header-shift": `${isHeaderHidden ? -headerHeight : 0}px`,
        } as CSSProperties
      }
    >
      <DashboardHeader
        ref={headerRef}
        hidden={isHeaderHidden}
        className="sticky top-0 z-30 px-0 md:px-0"
        innerClassName="mx-auto max-w-[1200px] px-4 sm:px-6"
      />

      <div
        className="sticky z-20 border-b border-slate-200 bg-white transition-transform duration-300 ease-in-out will-change-transform"
        style={{
          top: "var(--tax-header-height)",
          transform: "translateY(var(--tax-header-shift))",
        }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <BackButton
            variant="ghost"
            fallbackHref="/mypage-v2"
            iconClassName="transition-transform group-hover:-translate-x-1"
            className="group h-auto shrink-0 rounded-none p-0 text-slate-600 hover:bg-transparent hover:text-slate-950"
          />
          <h1 className="text-lg font-bold tracking-[-0.04em] text-slate-900 sm:text-lg sm:tracking-[-0.03em] sm:text-slate-950 lg:text-xl">
            세금계산서/부가세 신고
          </h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-56 pt-5 sm:px-6 sm:pb-44 sm:pt-6 lg:pb-36">
        <section
          className="relative mb-6 overflow-hidden rounded-[28px] p-6 text-white shadow-[0_24px_60px_rgba(0,71,171,0.18)] sm:p-7"
          style={{ backgroundColor: "#0047ab" }}
        >
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-[0.02em] text-white/90 ring-1 ring-inset ring-white/20">
                <ReceiptText size={13} />
                송금완료 내역 통합 관리
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] sm:text-[28px] sm:leading-[1.2]">
                신고와 발급에 필요한 내역을
                <br className="hidden sm:block" />{" "}
                선택해주세요
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                송금완료 처리된 내역을 계약별로 모아 보여드려요. 여러 건을
                선택해 정산 자료 요청과 세금계산서 발급을 한 번에 진행할 수
                있어요.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
              <SummaryChip
                label="전체 송금완료"
                value={`${TAX_REPORT_ITEMS.length}건`}
              />
              <SummaryChip
                label="선택 내역"
                value={`${selectedItems.length}건`}
                accent
              />
              <SummaryChip
                label="선택 부가세"
                value={`${formatWon(selectedVat)}원`}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)_320px] lg:items-start lg:gap-4">
              <div className="min-w-0">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  날짜
                </span>
                <button
                  type="button"
                  onClick={openDateRangeModal}
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus-visible:border-[#0038F1] focus-visible:ring-4 focus-visible:ring-[#0038F1]/10"
                >
                  <span className="truncate">
                    {getDateRangeLabel(dateFrom, dateTo)}
                  </span>
                  <CalendarDays size={16} className="shrink-0 text-slate-400" />
                </button>
              </div>

              <div className="min-w-0">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  계약항목
                </span>
                <div
                  className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-xl bg-white py-1 lg:min-h-20 lg:px-2 lg:py-2"
                  role="group"
                  aria-label="계약항목 필터"
                >
                  <button
                    type="button"
                    aria-pressed={selectedContractTypes.length === 0}
                    onClick={() => setSelectedContractTypes([])}
                    className={cn(
                      "h-8 shrink-0 rounded-full px-2.5 text-[11px] font-bold transition-colors",
                      selectedContractTypes.length === 0
                        ? "bg-[#0038F1] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
                    )}
                  >
                    전체
                  </button>
                  {CONTRACT_TYPE_FILTERS.map((contractType) => (
                    <button
                      key={contractType}
                      type="button"
                      aria-pressed={selectedContractTypes.includes(
                        contractType,
                      )}
                      onClick={() => toggleContractTypeFilter(contractType)}
                      className={cn(
                        "h-8 shrink-0 rounded-full px-2.5 text-[11px] font-bold transition-colors",
                        selectedContractTypes.includes(contractType)
                          ? "bg-[#0038F1] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
                      )}
                    >
                      {contractType}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block min-w-0">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  검색
                </span>
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="계약명, 송금자명, 예금주 검색"
                    className={cn(
                      "h-11 rounded-xl border-slate-200 bg-white pl-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#00abff]",
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
              </label>
          </div>

          {hasActiveFilters ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                선택한 필터
              </span>
              {dateFrom || dateTo ? (
                <button
                  type="button"
                  onClick={clearDateRange}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-[#0038F1]/10 px-3 text-xs font-bold text-[#0038F1] transition hover:bg-[#0038F1]/15"
                >
                  날짜: {getDateRangeLabel(dateFrom, dateTo)}
                  <X size={13} />
                </button>
              ) : null}
              {selectedContractTypes.map((contractType) => (
                <button
                  key={contractType}
                  type="button"
                  onClick={() => toggleContractTypeFilter(contractType)}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200/70"
                >
                  {contractType}
                  <X size={13} />
                </button>
              ))}
              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200/70"
                >
                  검색: {search.trim()}
                  <X size={13} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex h-8 items-center rounded-full px-2 text-xs font-bold text-slate-400 transition hover:text-slate-700"
              >
                전체 해제
              </button>
            </div>
          ) : null}
        </section>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_18px_52px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]">
                <CalendarDays size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  조회 결과
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  총{" "}
                  <span className="text-[#0038F1]">
                    {filteredItems.length}
                  </span>
                  건
                  {visibleSelectedCount > 0 ? (
                    <span className="ml-2 text-xs font-semibold text-slate-500">
                      · {visibleSelectedCount}건 선택됨
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleVisibleItems}
              disabled={filteredItems.length === 0}
              className="inline-flex h-9 items-center justify-center self-start rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto"
            >
              {allVisibleSelected ? "조회 결과 선택 해제" : "조회 결과 전체 선택"}
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  조건에 맞는 송금완료 내역이 없어요
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  날짜, 계약항목, 검색어를 변경해 다시 확인해주세요.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "group/row relative flex w-full items-start gap-4 px-5 py-4 text-left transition sm:px-6 sm:py-5",
                        isSelected
                          ? "bg-[#0038F1]/[0.04]"
                          : "bg-white hover:bg-slate-50/80",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-y-3 left-0 w-1 rounded-r-full transition",
                          isSelected ? "bg-[#0038F1]" : "bg-transparent",
                        )}
                      />
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                          isSelected
                            ? "border-[#0038F1] bg-[#0038F1] text-white"
                            : "border-slate-300 bg-white text-transparent group-hover/row:border-slate-400",
                        )}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-[#0038F1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0038F1]">
                            {item.contractCategory}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold leading-6 text-slate-950 sm:text-[15px]">
                          {item.contractName}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          송금자 {item.senderName} · 예금주{" "}
                          {item.counterpartyName}
                          <span className="hidden sm:inline">
                            {" "}
                            · 내역번호 {item.usageId}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-extrabold tracking-[-0.01em] text-slate-950 sm:text-base">
                          {formatWon(item.amount)}원
                        </p>
                        <div className="mt-1 space-y-0.5 text-[11px] font-medium leading-4 text-slate-400 sm:text-xs">
                          <p>공급가 {formatWon(item.supplyAmount)}원</p>
                          <p>부가세 {formatWon(item.vat)}원</p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-14px_44px_rgba(15,23,42,0.10)] backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#0038F1] px-2 text-[11px] font-bold text-white">
                {selectedItems.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                건 선택됨
              </span>
            </div>
            <p className="mt-1.5 truncate text-sm font-bold tracking-[-0.01em] text-slate-950 sm:text-[15px]">
              총{" "}
              <span className="text-[#0038F1]">
                {formatWon(selectedTotalAmount)}원
              </span>
              <span className="mx-1.5 text-slate-300">·</span>
              부가세 {formatWon(selectedVat)}원
            </p>
            {requestMessage ? (
              <p className="mt-1 text-xs font-medium text-[#0038F1]">
                {requestMessage}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:min-w-[520px]">
            <Button
              type="button"
              size="lg"
              disabled={selectedItems.length === 0}
              onClick={() => handleRequest("부가세 신고용 정산 자료 요청")}
              className="h-auto min-h-12 w-full whitespace-normal rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-center text-xs font-bold leading-tight text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100 sm:text-sm"
            >
              <FileSpreadsheet size={16} />
              부가세 신고용 정산 자료 요청
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={selectedItems.length === 0}
              onClick={() => handleRequest("세금계산서 발급 신청")}
              className="h-auto min-h-12 w-full whitespace-normal rounded-2xl bg-[#0038F1] px-3 py-3.5 text-center text-xs font-bold leading-tight text-white transition hover:bg-[#002fd0] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-100 sm:text-sm"
            >
              <ReceiptText size={16} />
              세금계산서 발급 신청
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isDateRangeOpen}
        onOpenChange={(open) => {
          if (open) {
            openDateRangeModal();
            return;
          }
          setIsDateRangeOpen(false);
        }}
      >
        <DialogContent className="w-[min(320px,calc(100%-2rem))] max-w-none sm:max-w-none">
          <DialogHeader>
            <DialogTitle>날짜 범위 선택</DialogTitle>
            <DialogDescription>
              송금완료 내역을 조회할 시작일과 종료일을 선택해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">
                시작일
              </span>
              <input
                type="date"
                value={draftDateFrom}
                onChange={(event) => setDraftDateFrom(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#0038F1] focus:ring-4 focus:ring-[#0038F1]/10"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">
                종료일
              </span>
              <input
                type="date"
                value={draftDateTo}
                onChange={(event) => setDraftDateTo(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#0038F1] focus:ring-4 focus:ring-[#0038F1]/10"
              />
            </label>
          </div>

          <DialogFooter className="flex-row gap-2.5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={clearDateRange}
              className="h-auto flex-1 rounded-xl border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-initial"
            >
              초기화
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={applyDateRange}
              className="h-auto flex-[2] rounded-xl bg-[#0038F1] px-4 py-3 text-sm font-semibold text-white hover:bg-[#002fd0] sm:flex-initial"
            >
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-3.5 py-3 transition",
        accent
          ? "bg-white/95 text-slate-900"
          : "bg-white/10 text-white ring-1 ring-inset ring-white/15",
      )}
      style={
        accent
          ? {
              border: "0",
              outline: "0",
              boxShadow: "0 8px 20px rgba(0,28,176,0.18)",
            }
          : undefined
      }
    >
      <p
        className={cn(
          "text-[11px] font-semibold tracking-[0.02em]",
          accent ? "text-[#0038F1]" : "text-white/60",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-base font-extrabold sm:text-lg",
          accent ? "text-slate-900" : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}
