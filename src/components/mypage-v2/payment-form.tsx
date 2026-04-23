"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
} from "react";
import { ArrowLeft, CheckCircle2, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  type ContractDetail,
  type ContractItem,
  STATUS_BADGE_CLASS,
} from "./data";

type TransferTiming = "now" | "reserved";
type PaymentMethod = "default" | "other";

type PaymentFormViewProps = {
  contract: ContractItem;
  detail: ContractDetail;
  onBack: () => void;
  onCompleted: () => void;
};

const FEE_RATE: Record<TransferTiming, number> = {
  now: 0.037,
  reserved: 0.035,
};

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function parseDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function PaymentFormView({
  contract,
  detail,
  onBack,
  onCompleted,
}: PaymentFormViewProps) {
  const remaining = Math.max(detail.monthlyLimit - detail.usedThisMonth, 0);

  const [amountRaw, setAmountRaw] = useState("");
  const [senderName, setSenderName] = useState("");
  const [timing, setTiming] = useState<TransferTiming>("now");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("default");
  const [otherPhone, setOtherPhone] = useState("");
  const [isSplitCard, setIsSplitCard] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isPgOpen, setIsPgOpen] = useState(false);

  const amountNumber = amountRaw ? Number(amountRaw) : 0;
  const amountOverLimit = amountNumber > remaining;
  const fee = Math.round(amountNumber * FEE_RATE[timing]);
  const total = amountNumber + fee;

  const isFormValid = useMemo(() => {
    if (amountNumber <= 0 || amountOverLimit) return false;
    if (!senderName.trim()) return false;
    if (paymentMethod === "other") {
      const digits = parseDigits(otherPhone);
      if (digits.length < 10 || digits.length > 11) return false;
    }
    if (!hasAgreed) return false;
    return true;
  }, [
    amountNumber,
    amountOverLimit,
    senderName,
    paymentMethod,
    otherPhone,
    hasAgreed,
  ]);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = parseDigits(event.target.value).slice(0, 13);
    setAmountRaw(digits);
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = parseDigits(event.target.value).slice(0, 11);
    setOtherPhone(digits);
  };

  const handleSplitCardChange = (value: boolean) => {
    setIsSplitCard(value);

    if (value && paymentMethod === "other") {
      setPaymentMethod("default");
      setOtherPhone("");
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    const nextMethod = value as PaymentMethod;

    if (isSplitCard && nextMethod === "other") {
      return;
    }

    setPaymentMethod(nextMethod);

    if (nextMethod !== "other") {
      setOtherPhone("");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;
    setIsConsentOpen(true);
  };

  const handleAgree = () => {
    setIsConsentOpen(false);
    setIsPgOpen(true);
  };

  const handlePgClose = () => {
    setIsPgOpen(false);
    onCompleted();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm lg:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="뒤로가기"
          className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
        </Button>
        <span className="flex-1 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          결제하기
        </span>
        <span className="w-7 shrink-0" aria-hidden />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <div className="space-y-5 p-4 pb-32 sm:p-6 lg:pb-8">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#00abff]">
              {contract.type}
            </span>
            <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900 sm:text-2xl">
              {contract.name}
            </h2>
            <p className="text-sm text-slate-600">
              송금 시{" "}
              <span className="font-semibold text-slate-900">
                {detail.counterparty.holder}
              </span>
              님 계좌로 이체됩니다.
            </p>
          </div>

          <Card className="gap-0 rounded-2xl border-slate-200 bg-white py-4 ring-0">
            <CardContent className="flex items-center gap-3 px-4">
              <Checkbox
                id="split-card"
                checked={isSplitCard}
                onCheckedChange={(value) => handleSplitCardChange(Boolean(value))}
              />
              <div className="min-w-0 flex-1">
                <Label
                  htmlFor="split-card"
                  className="text-sm font-semibold text-slate-900"
                >
                  카드분할결제 사용
                </Label>
                <p className="mt-0.5 text-xs text-slate-500">
                  선택 시 타인카드 결제는 이용할 수 없습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                계약 내용
              </span>
            </CardHeader>
            <CardContent className="space-y-3 px-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">계약 종류</span>
                <Badge
                  className={cn(
                    "h-auto rounded-full px-3 py-1 text-xs font-semibold",
                    STATUS_BADGE_CLASS[contract.status],
                  )}
                >
                  {contract.type}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">등록 송금액</span>
                <span className="text-sm font-semibold text-slate-900">
                  ₩{formatWon(detail.monthlyLimit)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">이번 달 남은 한도</span>
                <span className="text-sm font-semibold text-slate-900">
                  ₩{formatWon(remaining)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <Label
                htmlFor="amount"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
              >
                결제 금액
              </Label>
            </CardHeader>
            <CardContent className="space-y-2 px-5">
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  value={amountRaw ? formatWon(amountNumber) : ""}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={cn(
                    "h-auto rounded-xl border-slate-200 bg-[#fbfcff] px-4 py-3.5 pr-10 text-right text-lg font-semibold text-slate-900 placeholder:text-slate-300 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10",
                    amountOverLimit &&
                      "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-200",
                  )}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  원
                </span>
              </div>
              <p
                className={cn(
                  "text-xs",
                  amountOverLimit ? "text-rose-600" : "text-slate-500",
                )}
              >
                {amountOverLimit
                  ? `한도를 초과했어요. 남은 한도 ₩${formatWon(remaining)}까지 입력 가능합니다.`
                  : `한도 내에서 입력할 수 있습니다. (최대 ₩${formatWon(remaining)})`}
              </p>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <Label
                htmlFor="sender"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
              >
                송금자명
              </Label>
            </CardHeader>
            <CardContent className="px-5">
              <Input
                id="sender"
                type="text"
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                placeholder="예: 김페이몽"
                className="h-auto rounded-xl border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10"
              />
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                송금 시점 · 예상 수수료
              </span>
            </CardHeader>
            <CardContent className="space-y-3 px-5">
              <RadioGroup
                value={timing}
                onValueChange={(value) => setTiming(value as TransferTiming)}
                className="grid gap-2 sm:grid-cols-2"
              >
                <TimingOption
                  value="now"
                  active={timing === "now"}
                  title="바로 송금"
                  description="지금 즉시 송금"
                  rate="3.7%"
                />
                <TimingOption
                  value="reserved"
                  active={timing === "reserved"}
                  title="예약 송금"
                  description="다음 영업일 이체"
                  rate="3.5%"
                />
              </RadioGroup>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">예상 수수료</span>
                  <span className="font-semibold text-slate-900">
                    ₩{formatWon(fee)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">총 결제 예상액</span>
                  <span className="font-bold text-slate-900">
                    ₩{formatWon(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                결제 방식
              </span>
            </CardHeader>
            <CardContent className="space-y-3 px-5">
              <RadioGroup
                value={paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="grid gap-2 sm:grid-cols-2"
              >
                <MethodOption
                  value="default"
                  active={paymentMethod === "default"}
                  title="일반결제"
                  description="내 카드로 결제"
                  disabled={false}
                />
                <MethodOption
                  value="other"
                  active={paymentMethod === "other"}
                  title="타인카드"
                  description={
                    isSplitCard
                      ? "카드분할결제와 동시 사용 불가"
                      : "카드주에게 결제 링크 발송"
                  }
                  disabled={isSplitCard}
                />
              </RadioGroup>

              {paymentMethod === "other" ? (
                <div className="rounded-xl border border-[#0038F1]/20 bg-[#0038F1]/5 p-4">
                  <Label
                    htmlFor="other-phone"
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0038F1]"
                  >
                    카드주 휴대폰 번호
                  </Label>
                  <Input
                    id="other-phone"
                    type="tel"
                    inputMode="numeric"
                    value={otherPhone}
                    onChange={handlePhoneChange}
                    placeholder="01012345678"
                    className="mt-2 h-auto rounded-xl border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    입력한 번호로 결제 링크가 전송됩니다.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border-slate-200 bg-white py-4 ring-0">
            <CardContent className="flex items-start gap-3 px-4">
              <Checkbox
                id="agree"
                checked={hasAgreed}
                onCheckedChange={(value) => setHasAgreed(Boolean(value))}
                className="mt-0.5"
              />
              <Label
                htmlFor="agree"
                className="text-sm leading-6 text-slate-700"
              >
                결제 진행 전 서비스 이용 필수 동의 사항을 확인했으며, 위 내용에 동의합니다.
              </Label>
            </CardContent>
          </Card>

          <div className="hidden lg:block">
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid}
              className="h-auto w-full gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white shadow-sm hover:bg-[#002fd0] disabled:opacity-50"
            >
              결제하기
            </Button>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-4 pt-6 lg:hidden">
          <Button
            type="submit"
            size="lg"
            disabled={!isFormValid}
            className="pointer-events-auto h-auto w-full gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(0,56,241,0.24)] hover:bg-[#002fd0] disabled:opacity-50"
          >
            결제하기
          </Button>
        </div>
      </form>

      <Dialog open={isConsentOpen} onOpenChange={setIsConsentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]">
              <Shield size={18} />
            </div>
            <DialogTitle>서비스 이용 필수 동의</DialogTitle>
            <DialogDescription>
              결제를 계속 진행하려면 아래 항목에 동의해주세요. (임시 문구)
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs leading-5 text-slate-600">
            <p className="font-semibold text-slate-800">제1조 (목적)</p>
            <p className="mt-1">
              본 동의 사항은 페이몽 서비스 이용에 필요한 필수 사항에 대한 사용자 동의를 수령하기 위한 임시 문구입니다.
            </p>
            <p className="mt-3 font-semibold text-slate-800">
              제2조 (개인정보 수집 및 이용)
            </p>
            <p className="mt-1">
              결제 진행을 위해 필요한 최소한의 개인정보(이름·연락처·계좌 정보)를 수집·이용합니다.
            </p>
            <p className="mt-3 font-semibold text-slate-800">제3조 (수수료)</p>
            <p className="mt-1">
              송금 시점에 따라 수수료가 달라지며, 바로 송금 시 3.7%, 예약 송금 시 3.5%의 수수료가 부과됩니다.
            </p>
            <p className="mt-3 font-semibold text-slate-800">
              제4조 (타인 카드 결제)
            </p>
            <p className="mt-1">
              타인 카드 결제 선택 시 카드주 휴대폰 번호로 결제 링크가 발송되며, 카드주의 동의 하에 결제가 진행됩니다.
            </p>
          </div>
          <DialogFooter className="flex-row sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsConsentOpen(false)}
              className="h-auto rounded-xl px-5 py-3 text-sm font-semibold"
            >
              닫기
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleAgree}
              className="h-auto rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0]"
            >
              동의하고 결제 진행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPgOpen} onOpenChange={setIsPgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <DialogTitle>PG 결제 모듈</DialogTitle>
            <DialogDescription>
              실제 서비스에서는 이 영역에 PG사 결제 모듈이 노출됩니다. (데모)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>결제 금액</span>
              <span className="font-semibold text-slate-900">
                ₩{formatWon(amountNumber)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>수수료</span>
              <span className="text-slate-700">₩{formatWon(fee)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold text-slate-800">총액</span>
              <span className="font-bold text-slate-900">
                ₩{formatWon(total)}
              </span>
            </div>
          </div>
          <DialogFooter className="flex-row sm:flex-row sm:justify-end">
            <Button
              type="button"
              size="lg"
              onClick={handlePgClose}
              className="h-auto rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0]"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type TimingOptionProps = {
  value: TransferTiming;
  active: boolean;
  title: string;
  description: string;
  rate: string;
};

function TimingOption({
  value,
  active,
  title,
  description,
  rate,
}: TimingOptionProps) {
  return (
    <Label
      htmlFor={`timing-${value}`}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
        active
          ? "border-[#0038F1] bg-[#0038F1]/5"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <RadioGroupItem id={`timing-${value}`} value={value} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Badge className="h-auto rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
        {rate}
      </Badge>
    </Label>
  );
}

type MethodOptionProps = {
  value: PaymentMethod;
  active: boolean;
  title: string;
  description: string;
  disabled: boolean;
};

function MethodOption({
  value,
  active,
  title,
  description,
  disabled,
}: MethodOptionProps) {
  return (
    <Label
      htmlFor={`method-${value}`}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
          : active
            ? "border-[#0038F1] bg-[#0038F1]/5"
            : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <RadioGroupItem
        id={`method-${value}`}
        value={value}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </Label>
  );
}
