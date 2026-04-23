"use client";

// NOTE(paymong-navigation): /mypage-v2 is the current primary contract list
// and my page route. Keep /mypage as the legacy comparison screen until the
// v2 flow is finalized.

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, Hourglass, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CONTRACT_DETAILS,
  type ContractItem,
  SAMPLE_CONTRACTS,
} from "@/components/mypage-v2/data";
import { ContractDetailView } from "@/components/mypage-v2/contract-detail";
import { ContractList } from "@/components/mypage-v2/contract-list";
import { PaymentFormView } from "@/components/mypage-v2/payment-form";
import { UsageDetailView } from "@/components/mypage-v2/usage-detail";

type DashboardView = "list" | "detail" | "payment" | "usage";

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

export default function MyPageV2() {
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null,
  );
  const [selectedUsageId, setSelectedUsageId] = useState<number | null>(null);
  const [view, setView] = useState<DashboardView>("list");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);
    return SAMPLE_CONTRACTS.filter((contract) => {
      const searchable = normalizeSearchValue(
        `${contract.name} ${contract.type} ${contract.status}`,
      );
      return searchable.includes(normalizedQuery);
    });
  }, [searchQuery]);

  const selectedContract =
    selectedContractId != null
      ? SAMPLE_CONTRACTS.find((item) => item.id === selectedContractId) ?? null
      : null;
  const selectedDetail =
    selectedContractId != null ? CONTRACT_DETAILS[selectedContractId] ?? null : null;

  const handleSelect = (id: number) => {
    setSelectedContractId(id);
    setSelectedUsageId(null);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedUsageId(null);
    setView("list");
  };

  const handleGoToPayment = () => {
    setView("payment");
  };

  const handleBackToDetail = () => {
    setSelectedUsageId(null);
    setView("detail");
  };

  const handlePaymentCompleted = () => {
    setView("detail");
  };

  const handleOpenUsage = (usageId: number) => {
    setSelectedUsageId(usageId);
    setView("usage");
  };

  const selectedUsage =
    selectedDetail && selectedUsageId != null
      ? selectedDetail.usageHistory.find((item) => item.id === selectedUsageId) ??
        null
      : null;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#eef2fa]">
      <header className="shrink-0 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-sm md:px-8">
        <div className="flex w-full items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/paymong-header-logo.svg"
              alt="Paymong"
              width={148}
              height={32}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            aria-label="메뉴 열기"
            className="inline-flex items-center justify-center p-1 transition-opacity hover:opacity-75"
          >
            <span className="flex h-6 w-6 flex-col justify-center gap-[5px]">
              <span className="block h-[2px] w-full rounded-full bg-[#1f2a44]" />
              <span className="block h-[2px] w-full rounded-full bg-[#1f2a44]" />
              <span className="block h-[2px] w-full rounded-full bg-[#1f2a44]" />
            </span>
          </button>
        </div>
      </header>

      <section className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-full flex-col bg-white lg:w-[380px] lg:shrink-0 lg:border-r lg:border-slate-200 xl:w-[420px]">
          <ContractList
            contracts={filteredContracts}
            selectedId={selectedContractId}
            searchQuery={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setSelectedContractId(null);
              setView("list");
            }}
            onSelect={handleSelect}
          />
        </div>

        <div
          className={cn(
            "absolute inset-0 z-10 flex min-h-0 flex-col bg-[#eef2fa] transition-transform duration-300 ease-out",
            view === "list" ? "translate-x-full" : "translate-x-0",
            "lg:static lg:z-0 lg:flex-1 lg:translate-x-0 lg:transition-none",
          )}
        >
          {selectedContract && selectedContract.status !== "이용중" ? (
            <UnavailableState
              contract={selectedContract}
              onBack={handleBackToList}
            />
          ) : view === "payment" && selectedContract && selectedDetail ? (
            <PaymentFormView
              contract={selectedContract}
              detail={selectedDetail}
              onBack={handleBackToDetail}
              onCompleted={handlePaymentCompleted}
            />
          ) : view === "usage" &&
            selectedContract &&
            selectedDetail &&
            selectedUsage ? (
            <UsageDetailView
              contract={selectedContract}
              detail={selectedDetail}
              usage={selectedUsage}
              onBack={handleBackToDetail}
            />
          ) : selectedContract && selectedDetail ? (
            <ContractDetailView
              contract={selectedContract}
              detail={selectedDetail}
              onBack={handleBackToList}
              onPay={handleGoToPayment}
              onOpenUsage={handleOpenUsage}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </main>
  );
}

type UnavailableStateProps = {
  contract: ContractItem;
  onBack: () => void;
};

function UnavailableState({ contract, onBack }: UnavailableStateProps) {
  const isRejected = contract.status === "반려";
  const Icon = isRejected ? ShieldAlert : Hourglass;
  const title = isRejected
    ? "반려된 계약입니다"
    : "검토 중인 계약입니다";
  const description = isRejected
    ? "해당 계약은 반려되어 이용할 수 없어요. 새 계약을 등록하거나 지원팀에 문의해주세요."
    : "심사가 완료된 후에 상세 정보와 결제 기능을 이용할 수 있어요.";
  const iconWrapperClass = isRejected
    ? "bg-rose-50 text-rose-600 ring-rose-100"
    : "bg-amber-50 text-amber-600 ring-amber-100";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm lg:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="뒤로가기"
          className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <ArrowLeft size={16} />
        </Button>
        <span className="flex-1 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:text-left">
          계약 상세
        </span>
        <span className="w-7 shrink-0 lg:hidden" aria-hidden />
      </div>

      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <div
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-sm ring-1",
              iconWrapperClass,
            )}
          >
            <Icon size={22} />
          </div>
          <p className="mt-4 text-xs font-semibold text-[#00abff]">
            {contract.type}
          </p>
          <h2 className="mt-1 line-clamp-2 text-base font-bold text-slate-900">
            {contract.name}
          </h2>
          <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {description}
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="mt-6 h-auto rounded-xl border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            <ArrowLeft size={16} />
            리스트로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-center">
      <div className="max-w-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#0038F1] shadow-sm ring-1 ring-slate-200">
          <ClipboardList size={22} />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-900">
          계약을 선택해주세요
        </p>
        <p className="mt-1 text-xs text-slate-500">
          왼쪽 리스트에서 계약을 선택하면 상세 정보와 결제 기능을 확인할 수
          있습니다.
        </p>
      </div>
    </div>
  );
}
