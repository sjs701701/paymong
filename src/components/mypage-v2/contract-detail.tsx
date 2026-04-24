"use client";

import { ArrowLeft, Ban, ReceiptText, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import {
  type ContractDetail,
  type ContractItem,
  USAGE_STATUS_BADGE_CLASS,
} from "./data";

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

type ContractDetailViewProps = {
  contract: ContractItem;
  detail: ContractDetail;
  onBack: () => void;
  onPay: () => void;
  onOpenUsage: (usageId: number) => void;
};

export function ContractDetailView({
  contract,
  detail,
  onBack,
  onPay,
  onOpenUsage,
}: ContractDetailViewProps) {
  const remaining = Math.max(detail.monthlyLimit - detail.usedThisMonth, 0);
  const isLimitClosed = remaining <= 0;
  const isMonthlyRentContract = contract.type.includes("월세");
  const usedPercent = detail.monthlyLimit
    ? Math.min(
        100,
        Math.round((detail.usedThisMonth / detail.monthlyLimit) * 100),
      )
    : 0;
  const isLimitWarning = !isLimitClosed && usedPercent >= 80;
  const limitBadgeText = isLimitClosed
    ? "한도마감"
    : isMonthlyRentContract
      ? "매월 1일 초기화"
      : "초기화 없음";
  const limitProgressText = isLimitClosed
    ? "사용 불가"
    : isLimitWarning
      ? "주의"
      : "사용 가능";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6 lg:py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="뒤로가기"
          className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1 text-center lg:text-left">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {contract.name}
          </h2>
          <p className="mt-0.5 truncate text-xs text-slate-600">
            {detail.counterparty.bank} · {detail.counterparty.accountNumber} ·
            예금주 {detail.counterparty.holder}
          </p>
        </div>
        <UserMenu trigger="icon" className="shrink-0 lg:hidden" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-5 lg:gap-4 lg:pt-4">
        <Card
          className={cn(
            "relative shrink-0 gap-3 overflow-hidden rounded-2xl border-0 py-4 shadow-none ring-0 lg:gap-4 lg:py-5",
            isLimitClosed
              ? "bg-slate-800"
              : isLimitWarning
                ? "bg-[#18120a]"
                : "bg-[#000d36]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/5 blur-2xl"
          />
          <CardHeader className="relative gap-1 px-4 lg:px-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isLimitClosed
                      ? "bg-slate-300"
                      : isLimitWarning
                        ? "bg-amber-300"
                        : "bg-[#00abff]",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.16em] lg:text-xs lg:tracking-[0.18em]",
                    isLimitClosed
                      ? "text-slate-200"
                      : isLimitWarning
                        ? "text-amber-200"
                        : "text-[#00abff]",
                  )}
                >
                  남은 한도
                </span>
              </span>
              <span
                className={cn(
                  "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/85 ring-1 ring-white/15 lg:px-2.5 lg:py-1 lg:text-[11px]",
                  isLimitClosed && "bg-white/10 text-white/90",
                  isLimitWarning && "bg-amber-300/15 text-amber-100 ring-amber-200/20",
                )}
              >
                {limitBadgeText}
              </span>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-2.5 px-4 lg:space-y-3 lg:px-5">
            <p className="truncate text-[1.65rem] font-bold leading-none tracking-[-0.02em] text-white lg:text-3xl lg:leading-normal">
              ₩{formatWon(remaining)}
            </p>
            <p className="truncate text-[11px] font-medium text-white/75 lg:text-xs">
              사용됨{" "}
              <span className="font-semibold text-white">
                ₩{formatWon(detail.usedThisMonth)}
              </span>{" "}
              / 전체한도{" "}
              <span className="font-semibold text-white">
                ₩{formatWon(detail.monthlyLimit)}
              </span>
            </p>
            <div className="relative">
              <Progress
                value={usedPercent}
                className={cn(
                  "gap-0 [&>[data-slot=progress-track]]:h-5 [&>[data-slot=progress-track]]:bg-white/10 [&>[data-slot=progress-track]]:ring-1 [&>[data-slot=progress-track]]:ring-white/5 lg:[&>[data-slot=progress-track]]:h-7",
                  isLimitClosed
                    ? "[&_[data-slot=progress-indicator]]:bg-slate-400"
                    : isLimitWarning
                      ? "[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-amber-300 [&_[data-slot=progress-indicator]]:to-orange-400 [&_[data-slot=progress-indicator]]:shadow-[0_0_16px_rgba(251,191,36,0.38)]"
                      : "[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#00abff] [&_[data-slot=progress-indicator]]:to-[#0038F1] [&_[data-slot=progress-indicator]]:shadow-[0_0_18px_rgba(0,171,255,0.55)]",
                )}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-[0.08em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] lg:text-[11px]">
                {limitProgressText} · {usedPercent}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-2xl border-slate-200 bg-white py-5 ring-0">
          <CardHeader className="shrink-0 gap-1 px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                이용 내역
              </span>
              <span className="text-xs text-slate-500">
                {detail.usageHistory.length}건
              </span>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-0">
            <CustomScrollArea className="h-full overflow-x-hidden px-5">
              {detail.usageHistory.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 py-10 text-center">
                  <ReceiptText size={24} className="text-slate-300" />
                  <p className="text-sm text-slate-500">
                    아직 이용 내역이 없어요.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 border-y border-slate-100">
                  {detail.usageHistory.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpenUsage(item.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-slate-50 lg:-mx-2 lg:w-[calc(100%+1rem)]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {item.date}
                            </span>
                            <Badge
                              className={cn(
                                "h-auto rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                USAGE_STATUS_BADGE_CLASS[item.status],
                              )}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">
                            송금자 · {item.senderName}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            ₩{formatWon(item.amount)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CustomScrollArea>
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={onPay}
          disabled={isLimitClosed}
          className={cn(
            "h-auto w-full shrink-0 gap-2 rounded-xl py-4 text-base font-bold shadow-sm",
            isLimitClosed
              ? "bg-slate-300 text-slate-600 shadow-none hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-100"
              : "bg-[#0038F1] text-white hover:bg-[#002fd0]",
          )}
        >
          {isLimitClosed ? <Ban size={18} /> : <Wallet size={18} />}
          {isLimitClosed ? "한도마감" : "결제하기"}
        </Button>
      </div>
    </div>
  );
}
