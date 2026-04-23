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
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileImage,
  FileText,
  Info,
  Lock,
  Search,
  Upload,
  Wallet,
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

type DocumentGuide = {
  type: ContractType;
  docs: string;
  description: string;
};

const DOCUMENT_GUIDES: DocumentGuide[] = [
  {
    type: "월세",
    docs: "임대차계약서",
    description:
      "임대인의 계좌번호가 있어야 합니다. 계약서에 임대인의 계좌번호가 없다면 입금하셨던 기록, 임대인과의 문자내용이 있으면 첨부 부탁드립니다.",
  },
  {
    type: "관리비/배달료",
    docs: "관리비 고지서",
    description: "관리비 고지서 또는 계좌정보 파일이 필요합니다.",
  },
  {
    type: "보증금",
    docs: "임대차계약서",
    description:
      "임대인의 계좌번호가 있어야 합니다. 계약서에 임대인의 계좌번호가 없다면 입금하셨던 기록, 임대인과의 문자내용이 있으면 첨부 부탁드립니다.",
  },
  {
    type: "교육비",
    docs: "교육비 고지서",
    description:
      "교육비 고지서가 없다면 교사와 나눈 대화 등 상세내용을 첨부 부탁드립니다.",
  },
  {
    type: "인건비/용역비",
    docs: "사업자등록증, 임금 명세서, 통장사본",
    description:
      "사업자등록은 지급하는 사업장의 사업자등록증이며, 최초 1회 이후는 자동 기록되기에 첨부하지 않으셔도 됩니다.",
  },
  {
    type: "수리비/인테리어",
    docs: "수리비 견적서, 계좌정보 스크린샷",
    description: "견적서와 함께 입금할 계좌 정보를 확인할 수 있는 자료가 필요합니다.",
  },
  {
    type: "보험료",
    docs: "보험사로부터 받은 알림톡 등",
    description: "보험사에서 발송된 청구 알림톡, 청구서 등을 첨부해주세요.",
  },
  {
    type: "사업대금",
    docs: "계약서 또는 세금계산서",
    description: "정식 계약서 및 세금계산서 등을 첨부해주세요.",
  },
  {
    type: "기타",
    docs: "자유롭게 파일 첨부",
    description: "단, 추가 확인이 필요할 경우 추가자료를 요청할 수 있습니다.",
  },
];

type SavedAccount = {
  id: number;
  bank: string;
  accountNumber: string;
  holder: string;
  lastPaidAt: string;
};

const SAVED_ACCOUNTS: SavedAccount[] = [
  {
    id: 1,
    bank: "국민은행",
    accountNumber: "123456789012",
    holder: "김페이몽",
    lastPaidAt: "2026-03-18",
  },
  {
    id: 2,
    bank: "신한은행",
    accountNumber: "98765432109",
    holder: "이사장",
    lastPaidAt: "2026-02-04",
  },
  {
    id: 3,
    bank: "토스뱅크",
    accountNumber: "5556667788",
    holder: "박대표",
    lastPaidAt: "2026-01-22",
  },
  {
    id: 4,
    bank: "카카오뱅크",
    accountNumber: "333322221111",
    holder: "디자인 스튜디오",
    lastPaidAt: "2025-12-30",
  },
];

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

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return FileImage;
  return FileText;
}

type SectionHeaderProps = {
  number: number;
  title: string;
  isComplete: boolean;
  isActive: boolean;
  isLocked?: boolean;
  hint?: string;
};

function SectionHeader({
  number,
  title,
  isComplete,
  isActive,
  isLocked = false,
  hint,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
          isComplete
            ? "bg-emerald-500 text-white"
            : isLocked
              ? "border border-slate-200 bg-slate-100 text-slate-300"
              : isActive
                ? "bg-[#0038F1] text-white shadow-[0_10px_22px_rgba(0,56,241,0.24)]"
                : "border border-slate-200 bg-white text-slate-400"
        }`}
      >
        {isComplete ? (
          <Check className="h-5 w-5" />
        ) : (
          String(number).padStart(2, "0")
        )}
      </div>
      <div className="min-w-0 pt-1">
        <h2
          className={`text-lg font-semibold tracking-[-0.03em] sm:text-xl ${
            isLocked ? "text-slate-400" : "text-slate-950"
          }`}
        >
          {title}
        </h2>
        {hint ? (
          <p className={`mt-1 text-sm ${isLocked ? "text-slate-400" : "text-slate-500"}`}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LockedPlaceholder() {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-5 text-sm text-slate-500">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Lock className="h-4 w-4" />
      </div>
      <p>이전 단계를 먼저 완료하면 입력할 수 있어요.</p>
    </div>
  );
}

type SummaryItem = {
  label: string;
  value: string;
  isComplete: boolean;
};

type SummaryPanelProps = {
  form: ContractRegistrationForm;
  sectionStatuses: boolean[];
  completedSectionCount: number;
  isFormComplete: boolean;
};

function SummaryPanel({
  form,
  sectionStatuses,
  completedSectionCount,
  isFormComplete,
}: SummaryPanelProps) {
  const coreInfoValue = (() => {
    if (form.contractType === "월세") {
      const combined = [form.address, form.addressDetail].filter(Boolean).join(" ");
      return combined || "미입력";
    }
    return form.contractName || "미입력";
  })();

  const accountValue =
    form.bank && form.accountNumber
      ? `${form.bank} ${form.accountNumber}`
      : "미입력";

  const transferValue = form.amount
    ? `${form.senderName || "—"} · ${formatMoney(form.amount)}원`
    : "미입력";

  const items: SummaryItem[] = [
    {
      label: "계약유형",
      value: form.contractType ?? "미선택",
      isComplete: sectionStatuses[0],
    },
    { label: "기본 정보", value: coreInfoValue, isComplete: sectionStatuses[1] },
    {
      label: "계좌",
      value: accountValue,
      isComplete: sectionStatuses[2],
    },
    { label: "송금", value: transferValue, isComplete: sectionStatuses[3] },
    {
      label: "첨부",
      value:
        form.attachments.length > 0
          ? `${form.attachments.length}개 파일`
          : "미첨부",
      isComplete: sectionStatuses[4],
    },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-[#f5f9ff] to-white px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          진행률
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-[-0.03em] text-slate-950">
            {completedSectionCount}
          </span>
          <span className="text-sm font-medium text-slate-500">/ 5 단계</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={completedSectionCount}
          aria-valuemin={0}
          aria-valuemax={5}
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00abff] to-[#0038F1] transition-all duration-500"
            style={{ width: `${(completedSectionCount / 5) * 100}%` }}
          />
        </div>
      </div>

      <dl className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 px-6 py-3.5"
          >
            <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </dt>
            <dd className="flex min-w-0 items-center justify-end gap-2 text-right">
              <span
                className={`truncate text-sm font-medium transition-colors ${
                  item.isComplete ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {item.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-slate-100 px-6 py-5">
        <button
          type="submit"
          disabled={!isFormComplete}
          className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-sm font-semibold transition ${
            isFormComplete
              ? "bg-[#0038F1] text-white shadow-[0_18px_40px_rgba(0,56,241,0.24)] hover:bg-[#002fd0]"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          계약 등록 완료
        </button>
        <p className="mt-3 text-center text-xs text-slate-500">
          등록 후 계약리스트에서 확인할 수 있어요.
        </p>
      </div>
    </div>
  );
}

export function ContractRegistrationScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bankLayerRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<ContractRegistrationForm>(initialFormState);
  const [bankQuery, setBankQuery] = useState("");
  const [isBankMenuOpen, setIsBankMenuOpen] = useState(false);
  const [isSavedAccountsOpen, setIsSavedAccountsOpen] = useState(false);
  const [isDocumentGuideOpen, setIsDocumentGuideOpen] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
    const anyModalOpen =
      isConfirmOpen || isSavedAccountsOpen || isDocumentGuideOpen;
    if (!anyModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isConfirmOpen) setIsConfirmOpen(false);
      else if (isDocumentGuideOpen) setIsDocumentGuideOpen(false);
      else if (isSavedAccountsOpen) setIsSavedAccountsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmOpen, isSavedAccountsOpen, isDocumentGuideOpen]);

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

  const sectionStatuses = [
    Boolean(form.contractType),
    isCoreInfoComplete,
    form.isAccountVerified,
    isTransferInfoComplete,
    form.attachments.length > 0,
  ];
  const effectiveComplete = sectionStatuses.map((_, index) =>
    sectionStatuses.slice(0, index + 1).every(Boolean),
  );
  const sectionUnlocked = sectionStatuses.map((_, index) =>
    index === 0 ? true : effectiveComplete[index - 1],
  );
  const completedSectionCount = sectionStatuses.filter(Boolean).length;
  const activeSectionIndex = effectiveComplete.findIndex((done) => !done);
  const verifyButtonEnabled =
    Boolean(form.bank) && isAccountNumberValid && !form.isAccountVerified;

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
    <div className="relative min-h-screen overflow-x-clip bg-[#f5f8ff] font-sans text-[#151515]">
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

      <main className="relative z-10 px-4 pb-[160px] pt-2 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/mypage"
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            계약리스트로 돌아가기
          </Link>

          <div className="mb-8 max-w-[620px]">
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.5rem]">
              계약등록
            </h1>
          </div>

          <form
            id="contract-registration-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!isFormComplete) return;
              setIsConfirmOpen(true);
            }}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
              <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
                  <SectionHeader
                    number={1}
                    title="어떤 거래를 등록하시나요?"
                    hint="계약 유형에 따라 입력 필드가 달라져요."
                    isComplete={effectiveComplete[0]}
                    isActive={activeSectionIndex === 0}
                  />
                  <div className="flex flex-wrap gap-2.5">
                    {CONTRACT_TYPES.map((type) => {
                      const isSelected = form.contractType === type;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleContractTypeSelect(type)}
                          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                            isSelected
                              ? "bg-[#0038F1] text-white shadow-[0_12px_24px_rgba(0,56,241,0.24)]"
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
                  <SectionHeader
                    number={2}
                    title="계약 핵심 정보를 입력해주세요"
                    isComplete={effectiveComplete[1]}
                    isActive={activeSectionIndex === 1}
                    isLocked={!sectionUnlocked[1]}
                  />

                  {sectionUnlocked[1] ? (
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
                    <LockedPlaceholder />
                  )}
                </section>

                <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
                  <SectionHeader
                    number={3}
                    title="거래 상대방 계좌정보를 입력해주세요"
                    isComplete={effectiveComplete[2]}
                    isActive={activeSectionIndex === 2}
                    isLocked={!sectionUnlocked[2]}
                  />

                  {sectionUnlocked[2] ? (
                  <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      이전에 송금한 계좌를 불러와 빠르게 입력할 수 있어요.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSavedAccountsOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Wallet className="h-4 w-4" />
                      계좌 불러오기
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
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
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 transition-transform ${
                            isBankMenuOpen ? "rotate-180" : ""
                          }`}
                        />
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

                    <div className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">계좌번호</span>
                      <div
                        className={`flex items-stretch rounded-2xl border bg-[#fbfcff] transition focus-within:bg-white focus-within:ring-4 ${
                          form.isAccountVerified
                            ? "border-emerald-200 focus-within:border-emerald-300 focus-within:ring-emerald-100"
                            : "border-slate-200 focus-within:border-[#0038F1] focus-within:ring-[#0038F1]/10"
                        }`}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.accountNumber}
                          onChange={handleAccountNumberChange}
                          placeholder="숫자만 입력해주세요"
                          className="block w-full bg-transparent px-4 py-3.5 text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          disabled={form.isAccountVerified || !verifyButtonEnabled}
                          onClick={() => updateForm({ isAccountVerified: true })}
                          className={`m-1 inline-flex shrink-0 items-center justify-center rounded-[14px] px-4 text-sm font-semibold transition ${
                            form.isAccountVerified
                              ? "bg-emerald-100 text-emerald-700"
                              : verifyButtonEnabled
                                ? "bg-[#0038F1] text-white hover:bg-[#002fd0]"
                                : "cursor-not-allowed bg-slate-200 text-slate-500"
                          }`}
                        >
                          {form.isAccountVerified ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              인증완료
                            </>
                          ) : (
                            "계좌인증"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    계좌인증은 이번 단계에서 UI 흐름만 먼저 제공합니다. 실제 인증 모듈은 이후
                    연동 예정입니다.
                  </div>
                  </>
                  ) : (
                    <LockedPlaceholder />
                  )}
                </section>

                <section className="border-b border-slate-200/80 px-6 py-7 sm:px-8 sm:py-8">
                  <SectionHeader
                    number={4}
                    title="실제 송금 정보를 입력해주세요"
                    isComplete={effectiveComplete[3]}
                    isActive={activeSectionIndex === 3}
                    isLocked={!sectionUnlocked[3]}
                  />

                  {sectionUnlocked[3] ? (
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
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatMoney(form.amount)}
                          onChange={handleMoneyChange}
                          placeholder="숫자만 입력해주세요"
                          className="block w-full rounded-2xl border border-slate-200 bg-[#fbfcff] px-4 py-3.5 pr-12 text-slate-900 outline-none transition focus:border-[#0038F1] focus:bg-white focus:ring-4 focus:ring-[#0038F1]/10"
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                          원
                        </span>
                      </div>
                    </label>
                  </div>
                  ) : (
                    <LockedPlaceholder />
                  )}
                </section>

                <section className="px-6 py-7 sm:px-8 sm:py-8">
                  <SectionHeader
                    number={5}
                    title="확인에 필요한 서류를 첨부해주세요"
                    isComplete={effectiveComplete[4]}
                    isActive={activeSectionIndex === 4}
                    isLocked={!sectionUnlocked[4]}
                  />

                  {sectionUnlocked[4] ? (
                  <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      계약 유형별로 필요한 서류를 확인해보세요.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsDocumentGuideOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Info className="h-4 w-4" />
                      계약별 첨부서류 안내
                    </button>
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
                    className={`rounded-[24px] border border-dashed px-6 py-8 text-center transition ${
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
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {form.attachments.map((file) => {
                        const Icon = getFileIcon(file);
                        return (
                          <li
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAttachmentRemove(file)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                              aria-label={`${file.name} 제거`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  </>
                  ) : (
                    <LockedPlaceholder />
                  )}
                </section>
              </div>

              <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
                <SummaryPanel
                  form={form}
                  sectionStatuses={sectionStatuses}
                  completedSectionCount={completedSectionCount}
                  isFormComplete={isFormComplete}
                />
              </aside>
            </div>
          </form>
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-[920px] px-4 pb-4 pt-2 sm:px-6">
          <div className="rounded-[22px] border border-slate-200 bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                진행률
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {completedSectionCount} / 5 단계
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={completedSectionCount}
              aria-valuemin={0}
              aria-valuemax={5}
              className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00abff] to-[#0038F1] transition-all duration-500"
                style={{ width: `${(completedSectionCount / 5) * 100}%` }}
              />
            </div>
            <button
              type="submit"
              form="contract-registration-form"
              disabled={!isFormComplete}
              className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold transition ${
                isFormComplete
                  ? "bg-[#0038F1] text-white shadow-[0_14px_32px_rgba(0,56,241,0.24)] hover:bg-[#002fd0]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              계약 등록 완료
            </button>
          </div>
        </div>
      </div>

      {isConfirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contract-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsConfirmOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_36px_90px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00abff]">
                  Confirm
                </p>
                <h2
                  id="contract-confirm-title"
                  className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-[1.375rem]"
                >
                  계약 내용을 확인해주세요
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  등록 전에 입력하신 내용을 다시 한 번 확인해주세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                aria-label="닫기"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-7">
              <dl className="divide-y divide-slate-100">
                {(
                  [
                    { label: "계약 유형", value: form.contractType ?? "—" },
                    ...(isRentContract
                      ? [
                          { label: "주소", value: form.address },
                          { label: "상세주소", value: form.addressDetail },
                        ]
                      : [{ label: "계약명", value: form.contractName }]),
                    { label: "은행", value: form.bank },
                    { label: "계좌번호", value: form.accountNumber },
                    { label: "송금자명", value: form.senderName },
                    {
                      label: isRentContract ? "월세" : "송금액",
                      value: `${formatMoney(form.amount)}원`,
                    },
                  ] as { label: string; value: string }[]
                ).map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 py-3.5"
                  >
                    <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {row.label}
                    </dt>
                    <dd className="min-w-0 text-right text-sm font-medium text-slate-900">
                      {row.value}
                    </dd>
                  </div>
                ))}

                <div className="py-3.5">
                  <dt className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    첨부 파일 · {form.attachments.length}개
                  </dt>
                  <dd>
                    <ul className="space-y-2">
                      {form.attachments.map((file) => {
                        const Icon = getFileIcon(file);
                        return (
                          <li
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                              {file.name}
                            </span>
                            <span className="shrink-0 text-xs text-slate-400">
                              {formatFileSize(file.size)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2.5 border-t border-slate-100 px-5 py-4 sm:gap-3 sm:px-7 sm:py-5">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-6"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  router.push("/contracts/new/complete");
                }}
                className="inline-flex flex-[2] items-center justify-center whitespace-nowrap rounded-2xl bg-[#0038F1] px-3 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,56,241,0.24)] transition hover:bg-[#002fd0] sm:flex-1 sm:px-6"
              >
                계약 등록하기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isSavedAccountsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-accounts-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsSavedAccountsOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <div className="relative z-10 flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_36px_90px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00abff]">
                  Saved Accounts
                </p>
                <h2
                  id="saved-accounts-title"
                  className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950"
                >
                  계좌 불러오기
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  결제 이력이 있는 계좌 {SAVED_ACCOUNTS.length}건을 불러왔어요. 클릭하면 자동으로 입력됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSavedAccountsOpen(false)}
                aria-label="닫기"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 sm:px-4">
              <ul className="divide-y divide-slate-100">
                {SAVED_ACCOUNTS.map((account) => {
                  const isSelected =
                    form.bank === account.bank &&
                    form.accountNumber === account.accountNumber;

                  return (
                    <li key={account.id}>
                      <button
                        type="button"
                        onClick={() => {
                          updateForm({
                            bank: account.bank,
                            accountNumber: account.accountNumber,
                            isAccountVerified: true,
                          });
                          setBankQuery(account.bank);
                          setIsBankMenuOpen(false);
                          setIsSavedAccountsOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition ${
                          isSelected ? "bg-[#0038F1]/5" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-sm font-semibold text-slate-900">
                              {account.bank}
                            </span>
                            <span className="text-sm text-slate-700">
                              {account.accountNumber}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            예금주 {account.holder} · 마지막 송금 {account.lastPaidAt}
                          </p>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0038F1]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
              <button
                type="button"
                onClick={() => setIsSavedAccountsOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDocumentGuideOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsDocumentGuideOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <div className="relative z-10 flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_36px_90px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00abff]">
                  Document Guide
                </p>
                <h2
                  id="document-guide-title"
                  className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950"
                >
                  계약별 첨부서류 안내
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  계약 유형에 따라 필요한 서류가 다릅니다. 아래 항목을 참고해주세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDocumentGuideOpen(false)}
                aria-label="닫기"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <ul className="space-y-4">
                {DOCUMENT_GUIDES.map((guide) => (
                  <li
                    key={guide.type}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#0038F1]/10 px-3 py-1 text-xs font-semibold text-[#0038F1]">
                        {guide.type}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {guide.docs}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {guide.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
              <button
                type="button"
                onClick={() => setIsDocumentGuideOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
