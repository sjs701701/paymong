"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Shield,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
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

export type PaymentFormDraft = {
  amountRaw: string;
  senderName: string;
  timing: TransferTiming;
  reservedDate: string;
  paymentMethod: PaymentMethod;
  otherPhone: string;
  isSplitCard: boolean;
  hasAgreed: boolean;
};

type PaymentFormViewProps = {
  contract: ContractItem;
  detail: ContractDetail;
  initialDraft?: PaymentFormDraft;
  submitLabel?: string;
  onDraftChange?: (draft: PaymentFormDraft) => void;
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

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getReservedDateBounds() {
  const now = new Date();
  const min = new Date(now);
  min.setDate(min.getDate() + 1);
  const max = new Date(now);
  max.setMonth(max.getMonth() + 3);
  return { min: toIsoDate(min), max: toIsoDate(max) };
}

function formatReservedLabel(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(y)}년 ${Number(m)}월 ${Number(d)}일`;
}

export function PaymentFormView({
  contract,
  detail,
  initialDraft,
  submitLabel = "결제하기",
  onDraftChange,
  onBack,
  onCompleted,
}: PaymentFormViewProps) {
  const remaining = Math.max(detail.monthlyLimit - detail.usedThisMonth, 0);
  const reservedBounds = useMemo(() => getReservedDateBounds(), []);

  const [amountRaw, setAmountRaw] = useState(initialDraft?.amountRaw ?? "");
  const [senderName, setSenderName] = useState(initialDraft?.senderName ?? "");
  const [timing, setTiming] = useState<TransferTiming>(
    initialDraft?.timing ?? "now",
  );
  const [reservedDate, setReservedDate] = useState(
    initialDraft?.reservedDate ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialDraft?.paymentMethod ?? "default",
  );
  const [otherPhone, setOtherPhone] = useState(initialDraft?.otherPhone ?? "");
  const [isSplitCard, setIsSplitCard] = useState(
    initialDraft?.isSplitCard ?? false,
  );
  const [hasAgreed, setHasAgreed] = useState(initialDraft?.hasAgreed ?? false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isPgOpen, setIsPgOpen] = useState(false);
  const [isSplitInfoOpen, setIsSplitInfoOpen] = useState(false);
  const [touched, setTouched] = useState({
    amount: false,
    sender: false,
    otherPhone: false,
    reservedDate: false,
    agreement: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const amountSectionRef = useRef<HTMLDivElement>(null);
  const senderSectionRef = useRef<HTMLDivElement>(null);
  const reservedDateSectionRef = useRef<HTMLDivElement>(null);
  const otherPhoneSectionRef = useRef<HTMLDivElement>(null);
  const agreementSectionRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const senderInputRef = useRef<HTMLInputElement>(null);
  const reservedDateInputRef = useRef<HTMLInputElement>(null);
  const otherPhoneInputRef = useRef<HTMLInputElement>(null);

  const amountNumber = amountRaw ? Number(amountRaw) : 0;
  const amountOverLimit = amountNumber > remaining;
  const fee = Math.round(amountNumber * FEE_RATE[timing]);
  const total = amountNumber + fee;

  useEffect(() => {
    onDraftChange?.({
      amountRaw,
      senderName,
      timing,
      reservedDate,
      paymentMethod,
      otherPhone,
      isSplitCard,
      hasAgreed,
    });
  }, [
    amountRaw,
    senderName,
    timing,
    reservedDate,
    paymentMethod,
    otherPhone,
    isSplitCard,
    hasAgreed,
    onDraftChange,
  ]);

  const senderError =
    !senderName.trim() ? "송금자명을 입력해주세요." : null;
  const amountError = (() => {
    if (amountNumber <= 0) return "결제 금액을 입력해주세요.";
    if (amountOverLimit)
      return `한도를 초과했어요. 남은 한도 ₩${formatWon(remaining)}까지 입력 가능합니다.`;
    return null;
  })();
  const otherPhoneError = (() => {
    if (paymentMethod !== "other") return null;
    const digits = parseDigits(otherPhone);
    if (!digits) return "카드주 휴대폰 번호를 입력해주세요.";
    if (digits.length < 10 || digits.length > 11)
      return "휴대폰 번호 10~11자리를 정확히 입력해주세요.";
    return null;
  })();
  const reservedDateError = (() => {
    if (timing !== "reserved") return null;
    if (!reservedDate) return "송금 예약일을 선택해주세요.";
    if (reservedDate < reservedBounds.min || reservedDate > reservedBounds.max)
      return "선택 가능한 기간을 확인해주세요.";
    return null;
  })();
  const agreementError = !hasAgreed ? "서비스 이용 필수 동의가 필요해요." : null;

  const showError = (field: keyof typeof touched, error: string | null) =>
    error && (touched[field] || submitAttempted) ? error : null;

  const isFormValid =
    !amountError &&
    !senderError &&
    !otherPhoneError &&
    !reservedDateError &&
    !agreementError;

  const missingFieldLabels = (() => {
    const list: string[] = [];
    if (amountError) list.push("결제 금액");
    if (senderError) list.push("송금자명");
    if (reservedDateError) list.push("송금 예약일");
    if (otherPhoneError) list.push("카드주 휴대폰 번호");
    if (agreementError) list.push("필수 동의");
    return list;
  })();

  const formStatusMessage = missingFieldLabels.length
    ? `${missingFieldLabels.join(", ")} 항목이 입력되지 않았어요. ${submitLabel} 버튼을 누르면 해당 위치로 이동합니다.`
    : `결제 준비가 완료되었습니다. ${submitLabel} 버튼을 누르면 결제가 진행됩니다.`;

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
    setSubmitAttempted(true);
    if (!isFormValid) {
      const fieldsInOrder: Array<{
        error: string | null;
        section: RefObject<HTMLDivElement | null>;
        input?: RefObject<HTMLInputElement | null>;
      }> = [
        { error: amountError, section: amountSectionRef, input: amountInputRef },
        { error: senderError, section: senderSectionRef, input: senderInputRef },
        {
          error: reservedDateError,
          section: reservedDateSectionRef,
          input: reservedDateInputRef,
        },
        {
          error: otherPhoneError,
          section: otherPhoneSectionRef,
          input: otherPhoneInputRef,
        },
        { error: agreementError, section: agreementSectionRef },
      ];
      const firstInvalid = fieldsInOrder.find((item) => item.error);
      if (firstInvalid?.section.current) {
        firstInvalid.section.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        window.setTimeout(() => {
          firstInvalid.input?.current?.focus({ preventScroll: true });
        }, 320);
      }
      return;
    }
    setIsPgOpen(true);
  };

  const handleAgree = () => {
    setHasAgreed(true);
    setTouched((prev) => ({ ...prev, agreement: true }));
    setIsConsentOpen(false);
  };

  const handlePgClose = () => {
    setIsPgOpen(false);
    onCompleted();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm sm:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
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
        <span className="hidden w-7 shrink-0 lg:block" aria-hidden />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <div
          id="payment-form-status"
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {formStatusMessage}
        </div>
        <div className="space-y-5 p-4 pb-[140px] sm:p-6 lg:pb-8">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#00abff]">
              {contract.type}
            </span>
            <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900 sm:text-2xl">
              {submitLabel}
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              결제 완료 후 이용내역에서{" "}
              <span className="font-semibold text-slate-900">송금하기</span>를
              눌러야 송금 요청이 접수돼요.
              <span className="block text-xs text-slate-500">
                페이몽 확인 후 {detail.counterparty.holder}님 계좌로 송금 처리됩니다.
              </span>
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
                <div className="flex items-center gap-1.5">
                  <Label
                    htmlFor="split-card"
                    className="text-sm font-semibold text-slate-900"
                  >
                    카드분할결제 사용
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsSplitInfoOpen(true)}
                    aria-label="카드분할결제 안내 보기"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Info size={14} />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  선택 시 타인카드 결제는 이용할 수 없습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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

          <Card
            ref={amountSectionRef}
            className={cn(
              "scroll-mt-24 gap-3 rounded-2xl border-slate-200 bg-white py-5 transition-[border-color,box-shadow] ring-0",
              showError("amount", amountError) &&
                "border-rose-300",
            )}
          >
            <CardHeader className="gap-1 px-5">
              <Label
                htmlFor="amount"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                결제 금액
              </Label>
            </CardHeader>
            <CardContent className="space-y-2 px-5">
              <div className="relative">
                <Input
                  ref={amountInputRef}
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  value={amountRaw ? formatWon(amountNumber) : ""}
                  onChange={handleAmountChange}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, amount: true }))
                  }
                  placeholder="0"
                  className={cn(
                    "h-auto rounded-xl border-slate-200 bg-[#fbfcff] px-4 py-3.5 pr-10 text-right text-lg font-semibold text-slate-900 placeholder:text-slate-300 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10",
                    showError("amount", amountError) &&
                      "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-200",
                  )}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  원
                </span>
              </div>
              {showError("amount", amountError) ? (
                <FieldError message={amountError!} />
              ) : (
                <p className="text-xs text-slate-600">
                  한도 내에서 입력할 수 있습니다. (최대 ₩{formatWon(remaining)})
                </p>
              )}
            </CardContent>
          </Card>

          <Card
            ref={senderSectionRef}
            className={cn(
              "scroll-mt-24 gap-3 rounded-2xl border-slate-200 bg-white py-5 transition-[border-color,box-shadow] ring-0",
              showError("sender", senderError) &&
                "border-rose-300",
            )}
          >
            <CardHeader className="gap-1 px-5">
              <Label
                htmlFor="sender"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                송금자명
              </Label>
            </CardHeader>
            <CardContent className="space-y-2 px-5">
              <Input
                ref={senderInputRef}
                id="sender"
                type="text"
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, sender: true }))
                }
                placeholder="예: 김페이몽"
                className={cn(
                  "h-auto rounded-xl border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10",
                  showError("sender", senderError) &&
                    "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-200",
                )}
              />
              {showError("sender", senderError) ? (
                <FieldError message={senderError!} />
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                송금 시점 · 예상 수수료
              </span>
            </CardHeader>
            <CardContent className="space-y-3 px-5">
              <RadioGroup
                value={timing}
                onValueChange={(value) => {
                  const next = value as TransferTiming;
                  setTiming(next);
                  if (next !== "reserved") {
                    setReservedDate("");
                  }
                }}
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
                  description="원하는 일자에 이체"
                  rate="3.5%"
                />
              </RadioGroup>

              {timing === "reserved" ? (
                <div
                  ref={reservedDateSectionRef}
                  className={cn(
                    "scroll-mt-24 space-y-2 rounded-xl border border-[#0038F1]/20 bg-[#0038F1]/5 p-4 transition-[border-color,box-shadow]",
                    showError("reservedDate", reservedDateError) &&
                      "border-rose-300 bg-rose-50/60",
                  )}
                >
                  <Label
                    htmlFor="reserved-date"
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0038F1]"
                  >
                    송금 예약일
                  </Label>
                  <Input
                    ref={reservedDateInputRef}
                    id="reserved-date"
                    type="date"
                    value={reservedDate}
                    min={reservedBounds.min}
                    max={reservedBounds.max}
                    onChange={(event) => setReservedDate(event.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, reservedDate: true }))
                    }
                    className={cn(
                      "h-auto rounded-xl border-slate-200 bg-white px-4 py-3 text-slate-900 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10",
                      showError("reservedDate", reservedDateError) &&
                        "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-200",
                    )}
                  />
                  {showError("reservedDate", reservedDateError) ? (
                    <FieldError message={reservedDateError!} />
                  ) : reservedDate ? (
                    <p className="text-xs text-slate-700">
                      <span className="font-semibold text-[#0038F1]">
                        {formatReservedLabel(reservedDate)}
                      </span>
                      {"에 자동으로 송금돼요."}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600">
                      내일부터 최대 3개월 이내 날짜를 선택할 수 있어요.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">예상 수수료</span>
                  <span className="font-semibold text-slate-900">
                    ₩{formatWon(fee)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">총 결제 예상액</span>
                  <span className="font-bold text-slate-900">
                    ₩{formatWon(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-2xl border-slate-200 bg-white py-5 ring-0">
            <CardHeader className="gap-1 px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                      ? "카드분할결제와 동시에 사용할 수 없어요."
                      : "카드주에게 결제 링크 발송"
                  }
                  disabled={isSplitCard}
                  disabledHint={
                    isSplitCard
                      ? "카드분할결제를 끄면 선택할 수 있어요."
                      : undefined
                  }
                />
              </RadioGroup>

              {paymentMethod === "other" ? (
                <div
                  ref={otherPhoneSectionRef}
                  className={cn(
                    "scroll-mt-24 rounded-xl border border-[#0038F1]/20 bg-[#0038F1]/5 p-4 transition-[border-color,box-shadow]",
                    showError("otherPhone", otherPhoneError) &&
                      "border-rose-300 bg-rose-50/60",
                  )}
                >
                  <Label
                    htmlFor="other-phone"
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0038F1]"
                  >
                    카드주 휴대폰 번호
                  </Label>
                  <Input
                    ref={otherPhoneInputRef}
                    id="other-phone"
                    type="tel"
                    inputMode="numeric"
                    value={otherPhone}
                    onChange={handlePhoneChange}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, otherPhone: true }))
                    }
                    placeholder="01012345678"
                    className={cn(
                      "mt-2 h-auto rounded-xl border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0038F1] focus-visible:ring-[#0038F1]/10",
                      showError("otherPhone", otherPhoneError) &&
                        "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-200",
                    )}
                  />
                  {showError("otherPhone", otherPhoneError) ? (
                    <div className="mt-2">
                      <FieldError message={otherPhoneError!} />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-600">
                      입력한 번호로 결제 링크가 전송됩니다.
                    </p>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card
            ref={agreementSectionRef}
            className={cn(
              "scroll-mt-24 gap-0 rounded-2xl border-slate-200 bg-white py-4 transition-[border-color,box-shadow] ring-0",
              showError("agreement", agreementError) &&
                "border-rose-300",
            )}
          >
            <CardContent className="space-y-2 px-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={hasAgreed}
                  onCheckedChange={(value) => {
                    const next = Boolean(value);
                    setTouched((prev) => ({ ...prev, agreement: true }));
                    if (next && !hasAgreed) {
                      setIsConsentOpen(true);
                      return;
                    }
                    setHasAgreed(next);
                  }}
                  aria-haspopup="dialog"
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor="agree"
                    className="text-sm leading-6 text-slate-800"
                  >
                    서비스 이용 필수 동의 사항에 동의합니다.
                  </Label>
                </div>
              </div>
              {showError("agreement", agreementError) ? (
                <FieldError message={agreementError!} />
              ) : null}
            </CardContent>
          </Card>

          <div className="hidden space-y-3 lg:block">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>결제 금액</span>
                <span className="font-semibold text-slate-900">
                  ₩{formatWon(amountNumber)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                <span>수수료 ({timing === "now" ? "3.7%" : "3.5%"})</span>
                <span className="text-slate-800">₩{formatWon(fee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">총 결제액</span>
                <span className="text-base font-bold text-[#0038F1]">
                  ₩{formatWon(total)}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              data-invalid={!isFormValid || undefined}
              aria-describedby="payment-form-status"
              className="h-auto w-full gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white hover:bg-[#002fd0] data-[invalid=true]:bg-slate-200 data-[invalid=true]:text-slate-500 data-[invalid=true]:hover:bg-slate-200"
            >
              {submitLabel}
            </Button>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-4 lg:hidden">
          <div className="pointer-events-auto mb-2 rounded-xl bg-white/95 px-3 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>
                결제 금액 · 수수료 {timing === "now" ? "3.7%" : "3.5%"}
              </span>
              <span className="text-slate-800">
                ₩{formatWon(amountNumber)} · ₩{formatWon(fee)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                총 결제액
              </span>
              <span className="text-base font-bold text-[#0038F1]">
                ₩{formatWon(total)}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            data-invalid={!isFormValid || undefined}
            aria-describedby="payment-form-status"
            className="pointer-events-auto h-auto w-full gap-2 rounded-xl bg-[#0038F1] py-4 text-base font-bold text-white hover:bg-[#002fd0] data-[invalid=true]:bg-slate-200 data-[invalid=true]:text-slate-500 data-[invalid=true]:hover:bg-slate-200"
          >
            {submitLabel}
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
              아래 항목을 확인하고 동의해주세요. (임시 문구)
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
              동의하기
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

      <Dialog open={isSplitInfoOpen} onOpenChange={setIsSplitInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]">
              <Info size={18} />
            </div>
            <DialogTitle>카드분할결제 안내</DialogTitle>
            <DialogDescription>
              한 번의 송금을 여러 카드로 나눠 결제하고 싶을 때 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-slate-700">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                이용 순서
              </p>
              <ol className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0038F1]/10 text-[11px] font-bold text-[#0038F1]">
                    1
                  </span>
                  <span>
                    이번 카드로 결제할 금액을 아래 입력란에서 수정한 뒤 결제를
                    진행합니다.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0038F1]/10 text-[11px] font-bold text-[#0038F1]">
                    2
                  </span>
                  <span>
                    결제 완료 후 이용내역에서{" "}
                    <span className="font-semibold text-slate-900">
                      ‘분할결제 추가’
                    </span>
                    를 눌러 다음 카드로 남은 금액을 결제합니다.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0038F1]/10 text-[11px] font-bold text-[#0038F1]">
                    3
                  </span>
                  <span>
                    여러 카드 결제 금액이 하나의 송금 건으로 묶여 수취인
                    계좌로 이체됩니다.
                  </span>
                </li>
              </ol>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50/70 p-3 text-xs leading-5 text-rose-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>카드분할결제는 타인카드로 이용할 수 없어요.</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              size="lg"
              onClick={() => setIsSplitInfoOpen(false)}
              className="h-auto w-full rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0] sm:w-auto"
            >
              확인
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
        <p className="text-xs text-slate-600">{description}</p>
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
  disabledHint?: string;
};

function MethodOption({
  value,
  active,
  title,
  description,
  disabled,
  disabledHint,
}: MethodOptionProps) {
  return (
    <Label
      htmlFor={`method-${value}`}
      aria-disabled={disabled}
      title={disabled ? disabledHint : undefined}
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50"
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
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "text-sm font-semibold",
              disabled ? "text-slate-500" : "text-slate-900",
            )}
          >
            {title}
          </p>
          {disabled ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              <Info size={10} />
              사용 불가
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "text-xs leading-5",
            disabled ? "text-slate-600" : "text-slate-600",
          )}
        >
          {description}
        </p>
      </div>
    </Label>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-1 text-xs font-medium text-rose-600"
    >
      <AlertCircle size={13} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
