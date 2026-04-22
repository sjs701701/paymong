"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Search,
  Upload,
  X,
} from "lucide-react";

export type ContractType =
  | "월세"
  | "관리비/배달료"
  | "보증금"
  | "교육비"
  | "인건비/용역비"
  | "수리비/인테리어"
  | "보험료"
  | "사업대금"
  | "기타";

type ContractRegistrationForm = {
  contractType: ContractType | null;
  address: string;
  addressDetail: string;
  contractName: string;
  bank: string;
  accountNumber: string;
  isAccountVerified: boolean;
  senderName: string;
  amount: string;
  attachments: File[];
};

const CONTRACT_TYPES: ContractType[] = [
  "월세",
  "관리비/배달료",
  "보증금",
  "교육비",
  "인건비/용역비",
  "수리비/인테리어",
  "보험료",
  "사업대금",
  "기타",
];

const BANK_OPTIONS = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
  "기업은행",
  "카카오뱅크",
  "토스뱅크",
  "케이뱅크",
  "새마을금고",
  "우체국",
  "SC제일은행",
  "씨티은행",
  "수협은행",
  "대구은행",
  "부산은행",
  "경남은행",
  "광주은행",
  "전북은행",
  "제주은행",
] as const;

const initialFormState: ContractRegistrationForm = {
  contractType: null,
  address: "",
  addressDetail: "",
  contractName: "",
  bank: "",
  accountNumber: "",
  isAccountVerified: false,
  senderName: "",
  amount: "",
  attachments: [],
};

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function formatMoney(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function dedupeAttachments(files: File[]) {
  const uniqueFiles = new Map<string, File>();

  files.forEach((file) => {
    uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
  });

  return Array.from(uniqueFiles.values());
}

export function ContractRegistrationScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bankLayerRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<ContractRegistrationForm>(initialFormState);
  const [bankQuery, setBankQuery] = useState("");
  const [isBankMenuOpen, setIsBankMenuOpen] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const isRentContract = form.contractType === "월세";
  const amountLabel = isRentContract ? "월세 입력" : "송금액 입력";
  const isAccountNumberValid = form.accountNumber.length >= 8;
  const normalizedBankQuery = normalizeSearchValue(bankQuery);
  const filteredBanks = useMemo(
    () =>
      BANK_OPTIONS.filter((bank) =>
        normalizeSearchValue(bank).includes(normalizedBankQuery),
      ),
    [normalizedBankQuery],
  );

  useEffect(() => {
    if (!isBankMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!bankLayerRef.current?.contains(event.target as Node)) {
        setIsBankMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isBankMenuOpen]);

  const isCoreInfoComplete = Boolean(
    form.contractType &&
      (isRentContract
        ? form.address.trim() && form.addressDetail.trim()
        : form.contractName.trim()),
  );
  const isTransferInfoComplete = Boolean(form.senderName.trim() && form.amount);
  const isFormComplete = Boolean(
    isCoreInfoComplete &&
      form.bank &&
      isAccountNumberValid &&
      form.isAccountVerified &&
      isTransferInfoComplete &&
      form.attachments.length > 0,
  );

  const completedSectionCount = [
    Boolean(form.contractType),
    isCoreInfoComplete,
    form.isAccountVerified,
    isTransferInfoComplete,
    form.attachments.length > 0,
  ].filter(Boolean).length;

  const updateForm = (patch: Partial<ContractRegistrationForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleContractTypeSelect = (contractType: ContractType) => {
    updateForm({ contractType });
  };

  const handleAccountNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 16);
    updateForm({ accountNumber: digitsOnly, isAccountVerified: false });
  };

  const handleMoneyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 13);
    updateForm({ amount: digitsOnly });
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const nextFiles = Array.from(files);
    if (nextFiles.length === 0) return;

    updateForm({
      attachments: dedupeAttachments([...form.attachments, ...nextFiles]),
    });
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    handleFilesAdded(event.dataTransfer.files);
  };

  const handleFileBrowseChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleFilesAdded(event.target.files);
    event.target.value = "";
  };

  const handleAttachmentRemove = (targetFile: File) => {
    updateForm({
      attachments: form.attachments.filter(
        (file) =>
          !(
            file.name === targetFile.name &&
            file.size === targetFile.size &&
            file.lastModified === targetFile.lastModified
          ),
      ),
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f8ff] font-sans text-[#151515]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px]"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(0,171,255,0.18), transparent 42%), linear-gradient(180deg, rgba(0,56,241,0.18) 0%, rgba(0,171,255,0.08) 34%, rgba(245,248,255,0) 100%)",
        }}
      />

      <header className="relative z-10 px-4 py-6 md:px-8 md:py-6">
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/paymong-header-logo.svg"
              alt="Paymong"
              width={148}
              height={32}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-500 shadow-[0_14px_36px_rgba(0,56,241,0.08)] backdrop-blur-sm">
            빠르게 작성하고 바로 등록해보세요
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-16 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[920px]">
          <Link
            href="/mypage"
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            계약리스트로 돌아가기
          </Link>

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[620px]">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#00abff]">
                Contract Registration
              </p>
              <h1 className="text-[clamp(2.1rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950">
                필요한 정보만 빠르게 입력하고
                <br />
                계약을 바로 등록해보세요.
              </h1>
              <p className="mt-4 max-w-[540px] text-[15px] leading-7 text-slate-600 sm:text-base">
                계약 유형에 맞는 필드만 보여드릴게요. 지루한 단계 나누기 없이 한 화면에서
                계좌인증과 서류 첨부까지 마무리할 수 있습니다.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 px-5 py-4 shadow-[0_20px_45px_rgba(0,56,241,0.08)] backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0038F1] text-white shadow-[0_12px_28px_rgba(0,56,241,0.24)]">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Progress
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  5개 단계 중 {completedSectionCount}개 완료
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!isFormComplete) return;
              router.push("/contracts/new/complete");
            }}
            className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm"
          >
            <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    1. 계약유형
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                    어떤 거래를 등록하시나요?
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  필수
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {CONTRACT_TYPES.map((type) => {
                  const isSelected = form.contractType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleContractTypeSelect(type)}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                        isSelected
                          ? "bg-[#0038F1] text-white shadow-[0_16px_32px_rgba(0,56,241,0.24)]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  2. 기본 정보
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  계약 핵심 정보를 입력해주세요
                </h2>
              </div>

              {form.contractType ? (
                isRentContract ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">주소</span>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(event) => updateForm({ address: event.target.value })}
                        placeholder="예: 서울특별시 강남구 테헤란로 123"
                        className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">상세주소</span>
                      <input
                        type="text"
                        value={form.addressDetail}
                        onChange={(event) =>
                          updateForm({ addressDetail: event.target.value })
                        }
                        placeholder="예: 502호"
                        className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">계약명</span>
                    <input
                      type="text"
                      value={form.contractName}
                      onChange={(event) => updateForm({ contractName: event.target.value })}
                      placeholder="예: 6월 디자인 용역비"
                      className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                    />
                  </label>
                )
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
                  계약유형을 먼저 선택하면 필요한 입력칸만 바로 보여드릴게요.
                </div>
              )}
            </section>

            <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  3. 거래 상대방 계좌
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  은행과 계좌번호를 확인해주세요
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                <div className="relative" ref={bankLayerRef}>
                  <span className="mb-2 block text-sm font-medium text-slate-600">은행 선택</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBankMenuOpen((current) => !current);
                      setBankQuery(form.bank);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-left text-slate-900 outline-none transition hover:bg-white focus:border-[#0038F1] focus:ring-4 focus:ring-[#0038F1]/10"
                  >
                    <span className={form.bank ? "text-slate-900" : "text-slate-400"}>
                      {form.bank || "은행을 검색해 선택하세요"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {isBankMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
                      <div className="border-b border-slate-100 p-3">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            value={bankQuery}
                            onChange={(event) => setBankQuery(event.target.value)}
                            placeholder="은행명을 검색하세요"
                            className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-2">
                        {filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => {
                                updateForm({ bank, isAccountVerified: false });
                                setBankQuery(bank);
                                setIsBankMenuOpen(false);
                              }}
                              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              {bank}
                              {form.bank === bank ? (
                                <CheckCircle2 className="h-4 w-4 text-[#0038F1]" />
                              ) : null}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-5 text-sm text-slate-500">
                            검색 결과가 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">계좌번호</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.accountNumber}
                    onChange={handleAccountNumberChange}
                    placeholder="숫자만 입력해주세요"
                    className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={!form.bank || !isAccountNumberValid || form.isAccountVerified}
                    onClick={() => updateForm({ isAccountVerified: true })}
                    className={`inline-flex h-[54px] items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${
                      form.isAccountVerified
                        ? "bg-emerald-100 text-emerald-700"
                        : form.bank && isAccountNumberValid
                          ? "bg-[#0038F1] text-white shadow-[0_14px_32px_rgba(0,56,241,0.24)] hover:bg-[#002fd0]"
                          : "cursor-not-allowed bg-slate-200 text-slate-500"
                    }`}
                  >
                    {form.isAccountVerified ? "인증완료" : "계좌인증"}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
                계좌인증은 이번 단계에서 UI 흐름만 먼저 제공합니다. 실제 인증 모듈은 이후
                연동 예정입니다.
              </div>
            </section>

            <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  4. 송금 정보
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  실제 송금 정보를 입력해주세요
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">송금자명</span>
                  <input
                    type="text"
                    value={form.senderName}
                    onChange={(event) => updateForm({ senderName: event.target.value })}
                    placeholder="예: 김페이몽"
                    className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">{amountLabel}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatMoney(form.amount)}
                    onChange={handleMoneyChange}
                    placeholder="숫자만 입력해주세요"
                    className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                  />
                </label>
              </div>
            </section>

            <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  5. 확인서류
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  확인에 필요한 서류를 첨부해주세요
                </h2>
              </div>

              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget.contains(event.relatedTarget as Node)) {
                    return;
                  }
                  setIsDraggingFiles(false);
                }}
                onDrop={handleFileDrop}
                className={`rounded-[28px] border border-dashed px-6 py-8 text-center transition ${
                  isDraggingFiles
                    ? "border-[#0038F1] bg-[#0038F1]/5"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0038F1] shadow-[0_14px_30px_rgba(0,56,241,0.08)]">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  파일을 끌어다 놓거나 버튼으로 업로드하세요
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  계약서, 영수증, 견적서 등 여러 파일을 한 번에 첨부할 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  파일 선택
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileBrowseChange}
                />
              </div>

              {form.attachments.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {form.attachments.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate font-medium text-slate-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAttachmentRemove(file)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                        aria-label={`${file.name} 제거`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    필수 정보와 계좌인증을 완료하면 바로 등록할 수 있어요.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    등록 후에는 완료 화면에서 계약리스트로 다시 돌아갈 수 있습니다.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isFormComplete}
                  className={`inline-flex min-w-[180px] items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition ${
                    isFormComplete
                      ? "bg-[#0038F1] text-white shadow-[0_18px_40px_rgba(0,56,241,0.24)] hover:bg-[#002fd0]"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  }`}
                >
                  완료
                </button>
              </div>
            </section>
          </form>
        </div>
      </main>
    </div>
  );
}
