"use client";

import { ArrowLeft, ReceiptText, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const usedPercent = detail.monthlyLimit
    ? Math.min(
        100,
        Math.round((detail.usedThisMonth / detail.monthlyLimit) * 100),
      )
    : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm sm:px-6">
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
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {detail.counterparty.bank} · {detail.counterparty.accountNumber} ·
            예금주 {detail.counterparty.holder}
          </p>
        </div>
        <span className="w-7 shrink-0 lg:hidden" aria-hidden />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-5">
        <Card className="relative shrink-0 gap-4 overflow-hidden rounded-2xl border-0 bg-[#000d36] py-5 shadow-none ring-0">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/5 blur-2xl"
          />
          <CardHeader className="relative gap-1 px-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00abff]" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00abff]">
                  이번 달 남은 한도
                </span>
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 ring-1 ring-white/10">
                매월 1일 초기화
              </span>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 px-5">
            <div className="flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <p className="text-3xl font-bold tracking-[-0.02em] text-white">
                  ₩{formatWon(remaining)}
                </p>
              </div>
              <div className="text-right text-xs text-white/55">
                <p>
                  사용{" "}
                  <span className="font-semibold text-white">
                    ₩{formatWon(detail.usedThisMonth)}
                  </span>
                </p>
                <p>
                  총{" "}
                  <span className="font-semibold text-white">
                    ₩{formatWon(detail.monthlyLimit)}
                  </span>
                </p>
              </div>
            </div>
            <div className="relative">
              <Progress
                value={usedPercent}
                className="gap-0 [&>[data-slot=progress-track]]:h-7 [&>[data-slot=progress-track]]:bg-white/10 [&>[data-slot=progress-track]]:ring-1 [&>[data-slot=progress-track]]:ring-white/5 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#00abff] [&_[data-slot=progress-indicator]]:to-[#0038F1] [&_[data-slot=progress-indicator]]:shadow-[0_0_18px_rgba(0,171,255,0.55)]"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold tracking-[0.08em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                {usedPercent}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-2xl border-slate-200 bg-white py-5 ring-0">
          <CardHeader className="shrink-0 gap-1 px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                이용 내역
              </span>
              <span className="text-xs text-slate-400">
                {detail.usageHistory.length}건
              </span>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-0">
            <CustomScrollArea className="h-full px-5">
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
                        className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-slate-50"
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
          disabled={remaining <= 0}
          className="h-auto w-full shrink-0 gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white shadow-sm hover:bg-[#002fd0] disabled:opacity-50"
        >
          <Wallet size={18} />
          결제하기
        </Button>
      </div>
    </div>
  );
}
