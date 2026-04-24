"use client";

// NOTE(paymong-navigation): /mypage-v2 is the current primary contract list
// and my page route. Keep /mypage as the legacy comparison screen until the
// v2 flow is finalized.

import {
  type CSSProperties,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { UserMenu } from "@/components/shared/user-menu";
import { cn } from "@/lib/utils";
import {
  CONTRACT_DETAILS,
  type ContractItem,
  SAMPLE_CONTRACTS,
} from "@/components/mypage-v2/data";
import { ContractDetailView } from "@/components/mypage-v2/contract-detail";
import { ContractList } from "@/components/mypage-v2/contract-list";
import {
  PaymentFormView,
  type PaymentFormDraft,
} from "@/components/mypage-v2/payment-form";
import { UsageDetailView } from "@/components/mypage-v2/usage-detail";

type DashboardView = "list" | "detail" | "payment" | "usage";

const UNDER_REVIEW_LOTTIE_PATH =
  "/design/mypage-v2/review-status/under-review.json";


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
  const [paymentDrafts, setPaymentDrafts] = useState<
    Record<number, PaymentFormDraft>
  >({});
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollTopRef = useRef(0);
  const isMobileViewportRef = useRef(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => {
      const nextHeight = el.offsetHeight;
      setHeaderHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleListScroll = useCallback((metrics: {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  }) => {
    if (!isMobileViewportRef.current) {
      setIsHeaderHidden((current) => (current ? false : current));
      return;
    }

    const maxScrollTop = Math.max(metrics.scrollHeight - metrics.clientHeight, 0);
    const scrollTop = Math.max(0, Math.min(metrics.scrollTop, maxScrollTop));
    const prev = lastScrollTopRef.current;
    const delta = scrollTop - prev;
    lastScrollTopRef.current = scrollTop;

    if (scrollTop < 40) {
      setIsHeaderHidden((current) => (current ? false : current));
      return;
    }
    if (Math.abs(delta) < 6) return;

    const bottomDistance = maxScrollTop - scrollTop;
    const previousBottomDistance = maxScrollTop - prev;
    if (
      delta < 0 &&
      bottomDistance < 24 &&
      previousBottomDistance < 24
    ) {
      return;
    }

    const shouldHideHeader = delta > 0;
    setIsHeaderHidden((current) =>
      current === shouldHideHeader ? current : shouldHideHeader,
    );
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      isMobileViewportRef.current = mobileQuery.matches;
      if (!mobileQuery.matches) {
        setIsHeaderHidden(false);
      }
    };

    syncViewport();
    mobileQuery.addEventListener("change", syncViewport);
    return () => mobileQuery.removeEventListener("change", syncViewport);
  }, []);

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

  const handlePaymentDraftChange = useCallback(
    (contractId: number, draft: PaymentFormDraft) => {
      setPaymentDrafts((prev) => ({ ...prev, [contractId]: draft }));
    },
    [],
  );

  const handleSelectedPaymentDraftChange = useCallback(
    (draft: PaymentFormDraft) => {
      if (selectedContractId == null) return;
      handlePaymentDraftChange(selectedContractId, draft);
    },
    [handlePaymentDraftChange, selectedContractId],
  );

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
      <DashboardHeader
        ref={headerRef}
        hidden={isHeaderHidden}
      />

      <section
        className="relative flex min-h-0 flex-1 overflow-hidden pt-[var(--mobile-header-offset)] transition-[padding-top] duration-200 ease-out lg:pt-[var(--dashboard-header-height)]"
        style={
          {
            "--mobile-header-offset": `${
              isHeaderHidden ? 0 : headerHeight
            }px`,
            "--dashboard-header-height": `${headerHeight}px`,
          } as CSSProperties
        }
      >
        <div className="flex min-h-0 w-full flex-col bg-white lg:w-[380px] lg:shrink-0 lg:border-r lg:border-slate-200 xl:w-[420px]">
          <ContractList
            contracts={filteredContracts}
            selectedId={selectedContractId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            onSelect={handleSelect}
            onListScrollChange={handleListScroll}
          />
        </div>

        <div
          className={cn(
            "absolute inset-0 z-[60] flex min-h-0 flex-col bg-[#eef2fa] transition-transform duration-300 ease-out",
            view === "list" ? "translate-x-full" : "translate-x-0",
            "lg:static lg:z-0 lg:flex-1 lg:translate-x-0 lg:transition-none",
          )}
        >
          {view === "payment" && selectedContract && selectedDetail ? (
            <PaymentFormView
              contract={selectedContract}
              detail={selectedDetail}
              initialDraft={paymentDrafts[selectedContract.id]}
              submitLabel={
                selectedContract.status === "반려" ? "보완하기" : "결제하기"
              }
              onDraftChange={handleSelectedPaymentDraftChange}
              onBack={handleBackToDetail}
              onCompleted={handlePaymentCompleted}
            />
          ) : selectedContract && selectedContract.status !== "승인됨" ? (
            <UnavailableState
              contract={selectedContract}
              onBack={handleBackToList}
              onSupplement={handleGoToPayment}
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
  onSupplement: () => void;
};

function UnavailableState({
  contract,
  onBack,
  onSupplement,
}: UnavailableStateProps) {
  const isRejected = contract.status === "반려";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-4 backdrop-blur-sm lg:px-6 lg:py-3">
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
        <UserMenu trigger="icon" className="shrink-0 lg:hidden" />
      </div>

      {isRejected ? (
        <RejectedState
          contract={contract}
          onBack={onBack}
          onSupplement={onSupplement}
        />
      ) : (
        <UnderReviewState
          contract={contract}
          onBack={onBack}
          onSupplement={onSupplement}
        />
      )}
    </div>
  );
}

function RejectedState({
  contract,
  onBack,
  onSupplement,
}: UnavailableStateProps) {
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
        <Button
          size="lg"
          onClick={onSupplement}
          className="h-auto w-full rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0]"
        >
          보완하기
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
    description: "승인됨 상태로 전환되면 결제를 시작할 수 있어요.",
  },
];

function UnderReviewState({ contract, onBack }: UnavailableStateProps) {
  const currentStep = 1;
  const reviewAnimationRef = useRef<LottieRefCurrentProps>(null);
  const [reviewAnimation, setReviewAnimation] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(UNDER_REVIEW_LOTTIE_PATH)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load under review animation.");
        }
        return response.json() as Promise<Record<string, unknown>>;
      })
      .then((animationData) => {
        if (isMounted) {
          setReviewAnimation(animationData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setReviewAnimation(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-lg space-y-5 px-5 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-20 w-20 shrink-0 items-center justify-center">
              {reviewAnimation ? (
                <Lottie
                  lottieRef={reviewAnimationRef}
                  animationData={reviewAnimation}
                  loop
                  autoplay
                  onDOMLoaded={() => reviewAnimationRef.current?.setSpeed(0.72)}
                  aria-hidden="true"
                  className="h-full w-full"
                />
              ) : (
                <span
                  aria-hidden
                  className="h-10 w-10 rounded-full bg-amber-500 shadow-[0_8px_22px_rgba(245,158,11,0.5)] ring-4 ring-white"
                />
              )}
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
