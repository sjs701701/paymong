"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { CustomScrollArea } from "@/components/ui/custom-scroll-area";

type ContractStatus = "검토중" | "이용중" | "반려" | string;

type ContractItem = {
  id: number;
  type: string;
  name: string;
  amount: string;
  status: ContractStatus;
};

const SAMPLE_CONTRACTS: ContractItem[] = [
  {
    id: 1,
    type: "월세계약",
    name: "강남역 서희스타힐스 502호",
    amount: "1,200,000",
    status: "검토중",
  },
  {
    id: 2,
    type: "전세계약",
    name: "판교 푸르지오 그랑블 101동 1502호",
    amount: "850,000,000",
    status: "이용중",
  },
  {
    id: 3,
    type: "보증금계약",
    name: "마포 래미안 푸르지오 203동 401호",
    amount: "50,000,000",
    status: "반려",
  },
  {
    id: 4,
    type: "월세계약",
    name: "여의도 자이 402동 1105호",
    amount: "2,500,000",
    status: "검토중",
  },
  {
    id: 5,
    type: "전세계약",
    name: "잠실 엘스 120동 802호",
    amount: "1,200,000,000",
    status: "이용중",
  },
  {
    id: 6,
    type: "월세계약",
    name: "성수 트리마제 103동 1804호",
    amount: "3,100,000",
    status: "검토중",
  },
  {
    id: 7,
    type: "보증금계약",
    name: "광화문 디타워 오피스 12층 A호",
    amount: "120,000,000",
    status: "추가확인중",
  },
  {
    id: 8,
    type: "전세계약",
    name: "서초 래미안 리더스원 104동 702호",
    amount: "1,450,000,000",
    status: "이용중",
  },
  {
    id: 9,
    type: "월세계약",
    name: "해운대 엘시티 더샵 2207호",
    amount: "4,800,000",
    status: "반려",
  },
  {
    id: 10,
    type: "보증금계약",
    name: "송도 더샵 퍼스트파크 317동 903호",
    amount: "80,000,000",
    status: "검토중",
  },
  {
    id: 11,
    type: "전세계약",
    name: "용산 센트럴파크 해링턴 2차 1503호",
    amount: "980,000,000",
    status: "이용중",
  },
  {
    id: 12,
    type: "월세계약",
    name: "수원 광교중흥S클래스 220동 1101호",
    amount: "1,850,000",
    status: "계약만료예정",
  },
];

const STATUS_STYLES: Record<string, string> = {
  검토중: "border border-yellow-200 bg-yellow-100 text-yellow-800",
  이용중: "border border-green-200 bg-green-100 text-green-800",
  반려: "border border-red-200 bg-red-100 text-red-800",
};

const FALLBACK_STATUS_STYLE = "border border-slate-200 bg-slate-100 text-slate-700";

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function ContractCard({
  contract,
  isOpen,
  onToggle,
}: {
  contract: ContractItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const statusClassName = STATUS_STYLES[contract.status] ?? FALLBACK_STATUS_STYLE;

  return (
    <article
      className={`w-full rounded-2xl p-[2px] transition-[box-shadow] duration-200 ${
        isOpen
          ? "bg-gradient-to-r from-[#00abff] to-[#0038f1] shadow-md"
          : "bg-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="w-full overflow-hidden rounded-[14px] bg-white">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full cursor-pointer flex-col justify-between gap-4 p-5 text-left outline-none focus:outline-none sm:flex-row sm:items-center"
          aria-expanded={isOpen}
        >
          <div className="w-full">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-sm font-bold text-[#00abff]">{contract.type}</span>
                <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">{contract.name}</h2>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${statusClassName}`}
              >
                {contract.status}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-medium text-slate-500">계약 금액</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900">{contract.amount}</span>
                  <span className="ml-0.5 text-base font-bold text-slate-900">원</span>
                </div>
                <span
                  className={`rounded-full p-1.5 transition-colors ${
                    isOpen ? "bg-[#00abff]/10 text-[#00abff]" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </div>
            </div>
          </div>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 pb-5 pt-4">
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3.5">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-500" />
                <p className="text-sm font-medium text-slate-600">
                  결제된 송금건을 처리한 이후에 계약 수정 및 삭제가 가능합니다.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-slate-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                  계약삭제
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
                >
                  <CheckCircle size={16} />
                  이용하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyPage() {
  const [openContractId, setOpenContractId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = (id: number) => {
    setOpenContractId((previousId) => (previousId === id ? null : id));
  };

  const normalizedQuery = normalizeSearchValue(searchQuery);
  const filteredContracts = SAMPLE_CONTRACTS.filter((contract) => {
    const searchableValue = normalizeSearchValue(`${contract.name} ${contract.type} ${contract.status}`);
    return searchableValue.includes(normalizedQuery);
  });

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#f8faff]">
      <header className="shrink-0 px-4 py-6 md:px-8 md:py-6">
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

      <section className="min-h-0 flex-1 px-4 pb-6 pt-2 sm:px-6">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
          <header className="mb-6 shrink-0 text-center">
            <h1 className="text-2xl font-bold tracking-[-0.05em] text-slate-900 sm:text-3xl">계약리스트</h1>
            <p className="mt-2 text-sm text-slate-500">등록하신 모든 계약 건을 한 곳에서 관리할 수 있습니다.</p>
          </header>

          <main className="flex min-h-0 w-full flex-1 flex-col">
            <div className="mb-4 shrink-0">
              <label htmlFor="contract-search" className="sr-only">
                계약 검색
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search size={20} className="text-slate-400" />
                </div>
                <input
                  id="contract-search"
                  type="text"
                  placeholder="계약명을 검색해주세요"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setOpenContractId(null);
                  }}
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00abff] sm:text-sm"
                />
              </div>
            </div>

            <CustomScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-4 pb-2 md:pr-6">
                {filteredContracts.length > 0 ? (
                  filteredContracts.map((contract) => (
                    <ContractCard
                      key={contract.id}
                      contract={contract}
                      isOpen={openContractId === contract.id}
                      onToggle={() => handleToggle(contract.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                    <p className="text-slate-500">
                      {normalizedQuery ? "검색 결과가 없습니다." : "등록된 계약이 없습니다."}
                    </p>
                  </div>
                )}
              </div>
            </CustomScrollArea>

            <div className="mt-5 shrink-0 pt-1">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:text-lg"
              >
                <Plus size={22} />
                계약 등록하기
              </button>
            </div>
          </main>
        </div>
      </section>
    </main>
  );
}
