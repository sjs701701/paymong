"use client";

// NOTE(paymong-navigation): /mypage-v2 is the current primary contract list
// and my page route. Keep /mypage as the legacy comparison screen until the
// v2 flow is finalized.

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardList,
  Hourglass,
  ShieldAlert,
} from "lucide-react";

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

function MyPageV2Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const contractParam = searchParams.get("contract");
  const usageParam = searchParams.get("usage");
  const actionParam = searchParams.get("action");

  const selectedContractId = contractParam ? Number(contractParam) : null;
  const selectedUsageId = usageParam ? Number(usageParam) : null;

  const [searchQuery, setSearchQuery] = useState("");

  const view: DashboardView = (() => {
    if (!selectedContractId) return "list";
    if (actionParam === "payment") return "payment";
    if (selectedUsageId != null) return "usage";
    return "detail";
  })();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null) sp.delete(key);
        else sp.set(key, value);
      }
      const qs = sp.toString();
      router.push(qs ? `/mypage-v2?${qs}` : "/mypage-v2");
    },
    [router, searchParams],
  );

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
    updateParams({ contract: String(id), action: null, usage: null });
  };

  const handleBackToList = () => {
    updateParams({ contract: null, action: null, usage: null });
  };

  const handleGoToPayment = () => {
    updateParams({ action: "payment", usage: null });
  };

  const handleBackToDetail = () => {
    updateParams({ action: null, usage: null });
  };

  const handlePaymentCompleted = () => {
    updateParams({ action: null, usage: null });
  };

  const handleOpenUsage = (usageId: number) => {
    updateParams({ usage: String(usageId), action: null });
  };

  const selectedUsage =
    selectedDetail && selectedUsageId != null
      ? selectedDetail.usageHistory.find((item) => item.id === selectedUsageId) ??
        null
      : null;

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#eef2fa]">
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
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
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

export default function MyPageV2() {
  return (
    <Suspense fallback={null}>
      <MyPageV2Inner />
    </Suspense>
  );
}

type UnavailableStateProps = {
  contract: ContractItem;
  onBack: () => void;
};

function UnavailableState({ contract, onBack }: UnavailableStateProps) {
  const isRejected = contract.status === "반려";

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
        <span className="flex-1 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:text-left">
          계약 상세
        </span>
        <span className="w-7 shrink-0 lg:hidden" aria-hidden />
      </div>

      {isRejected ? (
        <RejectedState contract={contract} onBack={onBack} />
      ) : (
        <UnderReviewState contract={contract} onBack={onBack} />
      )}
    </div>
  );
}

function RejectedState({ contract, onBack }: UnavailableStateProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-lg space-y-5 px-5 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-4 ring-white">
              <ShieldAlert size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#00abff]">
                {contract.type}
              </p>
              <h2 className="mt-1 line-clamp-2 text-base font-bold text-slate-900">
                {contract.name}
              </h2>
              <p className="mt-2 text-sm font-semibold text-rose-800">
                반려된 계약입니다
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                해당 계약은 반려되어 결제 기능을 이용할 수 없어요.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <AlertTriangle size={12} className="text-rose-500" />
              반려 사유
            </span>
            {contract.rejectedAt ? (
              <span className="text-xs text-slate-500">
                {contract.rejectedAt} 안내
              </span>
            ) : null}
          </div>
          <p className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-sm leading-6 text-rose-900">
            {contract.rejectionReason ??
              "별도 안내된 사유가 없습니다. 지원팀에 문의해주세요."}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            사유를 보완한 후 새 계약으로 다시 등록해주세요. 추가 문의는 고객
            지원팀으로 연락 주시면 안내해드려요.
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-auto w-full rounded-xl border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
        >
          <ArrowLeft size={16} />
          리스트로 돌아가기
        </Button>
      </div>
    </div>
  );
}

type ReviewStep = {
  title: string;
  description: string;
};

const REVIEW_STEPS: ReviewStep[] = [
  {
    title: "계약 등록 완료",
    description: "제출하신 계약 정보가 접수되었어요.",
  },
  {
    title: "서류 심사 진행 중",
    description: "영업일 기준 1~2일 이내 완료 예정이에요.",
  },
  {
    title: "심사 결과 안내",
    description: "등록된 연락처로 결과를 안내드려요.",
  },
  {
    title: "이용 시작",
    description: "이용중 상태로 전환되면 결제를 시작할 수 있어요.",
  },
];

function UnderReviewState({ contract, onBack }: UnavailableStateProps) {
  const currentStep = 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-lg space-y-5 px-5 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="relative mt-1 inline-flex h-14 w-14 shrink-0 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-amber-400/45"
                style={{
                  animation:
                    "paymong-review-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
              <span
                aria-hidden
                className="absolute inset-2 rounded-full bg-amber-500/55"
                style={{
                  animation:
                    "paymong-review-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
                  animationDelay: "1.2s",
                }}
              />
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 shadow-[0_8px_22px_rgba(245,158,11,0.5)] ring-4 ring-white">
                <Hourglass size={16} className="text-white" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#00abff]">
                {contract.type}
              </p>
              <h2 className="mt-1 line-clamp-2 text-base font-bold text-slate-900">
                {contract.name}
              </h2>
              <p className="mt-2 text-sm font-semibold text-amber-800">
                심사가 진행 중이에요
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                영업일 기준 1~2일 이내에 결과를 안내드릴게요. 심사 완료 후
                결제 기능을 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              처리 프로세스
            </span>
            <span className="text-xs font-medium text-slate-500">
              {currentStep + 1} / {REVIEW_STEPS.length} 단계
            </span>
          </div>
          <ol className="space-y-0">
            {REVIEW_STEPS.map((step, index) => {
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;
              const isLast = index === REVIEW_STEPS.length - 1;
              return (
                <li key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                        isDone
                          ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200"
                          : isCurrent
                            ? "bg-amber-100 text-amber-700 ring-4 ring-amber-50"
                            : "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
                      )}
                    >
                      {isDone ? <Check size={14} /> : index + 1}
                    </span>
                    {!isLast ? (
                      <span
                        className={cn(
                          "mt-1 w-px flex-1",
                          isDone ? "bg-emerald-200" : "bg-slate-200",
                        )}
                      />
                    ) : null}
                  </div>
                  <div className={cn("flex-1 pb-5", isLast && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent
                          ? "text-slate-900"
                          : isDone
                            ? "text-slate-700"
                            : "text-slate-500",
                      )}
                    >
                      {step.title}
                      {isCurrent ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          진행 중
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-auto w-full rounded-xl border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
        >
          <ArrowLeft size={16} />
          리스트로 돌아가기
        </Button>
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
        <p className="mt-1 text-xs text-slate-600">
          왼쪽 리스트에서 계약을 선택하면 상세 정보와 결제 기능을 확인할 수
          있습니다.
        </p>
      </div>
    </div>
  );
}
