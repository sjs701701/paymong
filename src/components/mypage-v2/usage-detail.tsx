"use client";

import { useState } from "react";
import { ArrowLeft, Check, Download, FileCheck2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  type ContractDetail,
  type ContractItem,
  type UsageHistoryItem,
} from "./data";

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

type UsageReceipt = {
  cardPayment: {
    company: string;
    approvalNumber: string;
    cardNumber: string;
    type: string;
    serviceName: string;
    paidAt: string;
    totalAmount: number;
  };
  usage: {
    transferAmount: number;
    serviceFee: number;
    supplyAmount: number;
    vat: number;
  };
  seller: {
    businessName: string;
    representative: string;
    businessNumber: string;
    phone: string;
    address: string;
  };
  merchant: {
    name: string;
    storeName: string;
    representative: string;
    businessNumber: string;
    phone: string;
    address: string;
  };
};

function buildReceipt(item: UsageHistoryItem, contract: ContractItem): UsageReceipt {
  const transferAmount = item.amount;
  const serviceFee = Math.round(transferAmount * 0.037);
  const supplyAmount = Math.round(serviceFee / 1.1);
  const vat = serviceFee - supplyAmount;
  const totalAmount = transferAmount + serviceFee;
  return {
    cardPayment: {
      company: "비씨",
      approvalNumber: String(62000000 + item.id),
      cardNumber: "****-****-****-2456",
      type: "신용(개인)/일시불",
      serviceName: `${contract.type} 납입`,
      paidAt: `${item.date} 11:51`,
      totalAmount,
    },
    usage: {
      transferAmount,
      serviceFee,
      supplyAmount,
      vat,
    },
    seller: {
      businessName: "페이몽컴퍼니",
      representative: "홍길동",
      businessNumber: "111-22-33333",
      phone: "02-123-4568",
      address: "서울특별시 영등포구 여의대로 123",
    },
    merchant: {
      name: "주식회사 저쩌구",
      storeName: "(주)케이플립",
      representative: "권민식",
      businessNumber: "123-44-55555",
      phone: "02-1234-5678",
      address: "서울특별시 영등포구 국회대로 321",
    },
  };
}

type UsageDetailViewProps = {
  contract: ContractItem;
  detail: ContractDetail;
  usage: UsageHistoryItem;
  onBack: () => void;
};

export function UsageDetailView({
  contract,
  detail,
  usage,
  onBack,
}: UsageDetailViewProps) {
  const receipt =
    usage.status === "송금완료" ? buildReceipt(usage, contract) : null;
  const isPendingTransfer = usage.status === "결제완료";
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransferSuccessOpen, setIsTransferSuccessOpen] = useState(false);
  const [isTransferRequested, setIsTransferRequested] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = () => {
    if (isExiting) return;
    const prefersMobileMotion =
      typeof window !== "undefined" &&
      !window.matchMedia("(min-width: 1024px)").matches;
    if (!prefersMobileMotion) {
      onBack();
      return;
    }
    setIsExiting(true);
    window.setTimeout(onBack, 300);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6 lg:py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col duration-300 ease-out lg:animate-none",
          isExiting
            ? "animate-out fade-out-0 slide-out-to-bottom-16 fill-mode-forwards"
            : "animate-in fade-in-0 slide-in-from-bottom-16",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-4 pt-4 pb-24 sm:px-6 sm:pt-5 sm:pb-24">
            {receipt ? (
              <>
                <ReceiptCard title="카드결제정보">
                <ReceiptRow label="카드사" value={receipt.cardPayment.company} />
                <ReceiptRow
                  label="승인번호"
                  value={receipt.cardPayment.approvalNumber}
                />
                <ReceiptRow
                  label="카드번호"
                  value={receipt.cardPayment.cardNumber}
                />
                <ReceiptRow
                  label="거래종류/할부"
                  value={receipt.cardPayment.type}
                />
                <ReceiptRow
                  label="이용 서비스명"
                  value={receipt.cardPayment.serviceName}
                />
                <ReceiptRow
                  label="결제일자"
                  value={receipt.cardPayment.paidAt}
                />
                <Separator />
                <ReceiptRow
                  label="총결제금액"
                  value={`${formatWon(receipt.cardPayment.totalAmount)} 원`}
                  emphasize
                />
              </ReceiptCard>

              <ReceiptCard title="이용정보">
                <ReceiptRow
                  label="송금액"
                  value={`${formatWon(receipt.usage.transferAmount)} 원`}
                />
                <ReceiptRow
                  label="서비스 이용료"
                  value={`${formatWon(receipt.usage.serviceFee)} 원`}
                />
                <ReceiptRow
                  label="공급가액"
                  value={`${formatWon(receipt.usage.supplyAmount)} 원`}
                />
                <ReceiptRow
                  label="부가세"
                  value={`${formatWon(receipt.usage.vat)} 원`}
                />
              </ReceiptCard>

              <ReceiptCard title="판매자 정보">
                <ReceiptRow
                  label="판매자 상호"
                  value={receipt.seller.businessName}
                />
                <ReceiptRow
                  label="대표자명"
                  value={receipt.seller.representative}
                />
                <ReceiptRow
                  label="사업자등록번호"
                  value={receipt.seller.businessNumber}
                />
                <ReceiptRow label="전화번호" value={receipt.seller.phone} />
                <ReceiptRow
                  label="사업장 주소"
                  value={receipt.seller.address}
                />
              </ReceiptCard>

                <ReceiptCard title="가맹점 정보">
                  <ReceiptRow label="가맹점명" value={receipt.merchant.name} />
                  <ReceiptRow
                    label="상점명"
                    value={receipt.merchant.storeName}
                  />
                  <ReceiptRow
                    label="대표자명"
                    value={receipt.merchant.representative}
                  />
                  <ReceiptRow
                    label="사업자등록번호"
                    value={receipt.merchant.businessNumber}
                  />
                  <ReceiptRow
                    label="전화번호"
                    value={receipt.merchant.phone}
                  />
                  <ReceiptRow
                    label="사업장 주소"
                    value={receipt.merchant.address}
                  />
                </ReceiptCard>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsCertOpen(true)}
                    className="h-auto w-full gap-2 rounded-xl border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FileCheck2 size={16} />
                    이체확인증
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-auto w-full gap-2 rounded-xl border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download size={16} />
                    PDF 다운
                  </Button>
                </div>
              </>
            ) : (
              <StatusFallbackCard usage={usage} />
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-3 sm:px-6">
          {isPendingTransfer ? (
            <Button
              size="lg"
              disabled={isTransferRequested}
              onClick={() => setIsTransferOpen(true)}
              className="pointer-events-auto h-auto w-full gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white hover:bg-[#002fd0] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-100 disabled:shadow-none"
            >
              {isTransferRequested ? (
                <>
                  <Check size={18} />
                  송금 요청됨
                </>
              ) : (
                <>
                  <Send size={18} />
                  송금하기
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleBack}
              className="pointer-events-auto h-auto w-full gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white hover:bg-[#002fd0]"
            >
              <Check size={18} />
              확인
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              송금요청 하시겠습니까?
            </DialogTitle>
            <DialogDescription>
              결제완료된 건을 수취인 계좌로 송금 요청합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsTransferOpen(false)}
              className="h-auto flex-1 rounded-xl border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-initial"
            >
              취소
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                setIsTransferOpen(false);
                setIsTransferSuccessOpen(true);
                setIsTransferRequested(true);
              }}
              className="h-auto flex-1 rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0] sm:flex-initial"
            >
              송금요청
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isTransferSuccessOpen}
        onOpenChange={setIsTransferSuccessOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check size={18} />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              송금 요청이 완료되었습니다
            </DialogTitle>
            <DialogDescription>
              페이몽에서 검토 후 00분 이내에 송금 처리 예정입니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              size="lg"
              onClick={() => setIsTransferSuccessOpen(false)}
              className="h-auto w-full rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0]"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold tracking-[-0.01em] text-slate-900">
              이체증
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm">
            <ReceiptRow label="고객명" value={usage.senderName} />
            <ReceiptRow label="거래일시" value={`${usage.date} 11:51`} />
            <ReceiptRow
              label="입금계좌"
              value={detail.counterparty.accountNumber}
            />
            <ReceiptRow label="입금은행" value={detail.counterparty.bank} />
            <ReceiptRow
              label="수취인성명"
              value={detail.counterparty.holder}
            />
            <Separator />
            <ReceiptRow
              label="입금금액"
              value={`${formatWon(usage.amount)} 원`}
              emphasize
            />
            <ReceiptRow label="입금자성명" value={usage.senderName} />
          </div>
          <DialogFooter className="flex-row gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-auto flex-1 gap-2 rounded-xl border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-initial"
            >
              <Download size={16} />
              PDF 다운
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => setIsCertOpen(false)}
              className="h-auto flex-1 rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0] sm:flex-initial"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceiptCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
      <CardHeader className="gap-1 px-5">
        <span className="text-sm font-bold tracking-[-0.01em] text-slate-900">
          {title}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 px-5 text-sm">{children}</CardContent>
    </Card>
  );
}

function ReceiptRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span
        className={cn(
          "min-w-0 text-right",
          emphasize
            ? "text-base font-bold text-slate-900"
            : "font-medium text-slate-800",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function StatusFallbackCard({ usage }: { usage: UsageHistoryItem }) {
  const message = (() => {
    switch (usage.status) {
      case "결제완료":
        return "카드 결제는 완료되었으며, 송금하기를 눌러 송금을 진행해주세요";
      case "예약":
        return usage.scheduledDate
          ? `${formatReservedDateLabel(usage.scheduledDate)}에 자동으로 이체될 예정이에요.`
          : "예약된 송금입니다. 지정된 일자에 자동으로 이체됩니다.";
      case "실패":
        return "송금이 실패했어요. 잔액 부족 또는 일시적인 오류일 수 있습니다.";
      default:
        return "상세 정보가 아직 제공되지 않습니다.";
    }
  })();

  return (
    <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
      <CardHeader className="gap-1 px-5">
        <span className="text-sm font-bold tracking-[-0.01em] text-slate-900">
          상세 정보
        </span>
      </CardHeader>
      <CardContent className="space-y-3 px-5 text-sm">
        <p className="leading-6 text-slate-700">{message}</p>
        <Separator />
        <ReceiptRow label="거래일" value={usage.date} />
        {usage.status === "예약" && usage.scheduledDate ? (
          <ReceiptRow
            label="예약 송금일"
            value={formatReservedDateLabel(usage.scheduledDate)}
          />
        ) : null}
        <ReceiptRow label="송금자" value={usage.senderName} />
        <ReceiptRow
          label="금액"
          value={`${formatWon(usage.amount)} 원`}
          emphasize
        />
      </CardContent>
    </Card>
  );
}

function formatReservedDateLabel(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(y)}년 ${Number(m)}월 ${Number(d)}일`;
}
