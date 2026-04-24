export type ContractStatus = "검토중" | "이용중" | "반려";

export type ContractItem = {
  id: number;
  type: string;
  name: string;
  amount: string;
  status: ContractStatus;
  rejectionReason?: string;
  rejectedAt?: string;
};

export type UsageStatus = "송금완료" | "결제완료" | "예약" | "실패";

export type UsageHistoryItem = {
  id: number;
  date: string;
  amount: number;
  senderName: string;
  status: UsageStatus;
  scheduledDate?: string;
};

export type CounterpartyAccount = {
  bank: string;
  accountNumber: string;
  holder: string;
};

export type ContractDetail = {
  counterparty: CounterpartyAccount;
  monthlyLimit: number;
  usedThisMonth: number;
  usageHistory: UsageHistoryItem[];
};

export const SAMPLE_CONTRACTS: ContractItem[] = [
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
    rejectionReason:
      "제출하신 임대차 계약서의 확정일자 도장이 확인되지 않아요. 확정일자가 포함된 원본 사본을 다시 등록해주세요.",
    rejectedAt: "2026-04-18",
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
    status: "검토중",
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
    rejectionReason:
      "등록된 수취 계좌 예금주 정보가 계약서상 임대인과 일치하지 않아요. 명의가 동일한 계좌로 재등록이 필요합니다.",
    rejectedAt: "2026-04-10",
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
    status: "반려",
    rejectionReason:
      "첨부된 신분증 사진이 흐려 본인 확인이 어려워요. 모서리가 잘 보이는 선명한 사진으로 다시 제출해주세요.",
    rejectedAt: "2026-03-29",
  },
];

export const STATUS_BADGE_CLASS: Record<ContractStatus, string> = {
  검토중: "border border-yellow-200 bg-yellow-100 text-yellow-800",
  이용중: "border border-green-200 bg-green-100 text-green-800",
  반려: "border border-red-200 bg-red-100 text-red-800",
};

export const USAGE_STATUS_BADGE_CLASS: Record<UsageStatus, string> = {
  송금완료: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  결제완료: "border border-indigo-200 bg-indigo-50 text-indigo-700",
  예약: "border border-sky-200 bg-sky-50 text-sky-700",
  실패: "border border-rose-200 bg-rose-50 text-rose-700",
};

export const CONTRACT_DETAILS: Record<number, ContractDetail> = {
  1: {
    counterparty: {
      bank: "국민은행",
      accountNumber: "123456789012",
      holder: "김임대",
    },
    monthlyLimit: 1_200_000,
    usedThisMonth: 0,
    usageHistory: [
      {
        id: 101,
        date: "2026-03-01",
        amount: 1_200_000,
        senderName: "김페이몽",
        status: "송금완료",
      },
      {
        id: 102,
        date: "2026-02-01",
        amount: 1_200_000,
        senderName: "김페이몽",
        status: "송금완료",
      },
    ],
  },
  2: {
    counterparty: {
      bank: "신한은행",
      accountNumber: "98765432109",
      holder: "이전세",
    },
    monthlyLimit: 850_000_000,
    usedThisMonth: 850_000_000,
    usageHistory: [
      {
        id: 201,
        date: "2026-04-10",
        amount: 850_000_000,
        senderName: "이사장",
        status: "송금완료",
      },
    ],
  },
  3: {
    counterparty: {
      bank: "하나은행",
      accountNumber: "3335550000",
      holder: "박보증",
    },
    monthlyLimit: 50_000_000,
    usedThisMonth: 0,
    usageHistory: [],
  },
  4: {
    counterparty: {
      bank: "카카오뱅크",
      accountNumber: "333322221111",
      holder: "자이관리소",
    },
    monthlyLimit: 2_500_000,
    usedThisMonth: 1_200_000,
    usageHistory: [
      {
        id: 401,
        date: "2026-04-05",
        amount: 1_200_000,
        senderName: "김페이몽",
        status: "예약",
        scheduledDate: "2026-05-05",
      },
    ],
  },
  5: {
    counterparty: {
      bank: "우리은행",
      accountNumber: "100212345678",
      holder: "엘스관리",
    },
    monthlyLimit: 1_200_000_000,
    usedThisMonth: 600_000_000,
    usageHistory: [
      {
        id: 509,
        date: "2026-04-23",
        amount: 100_000_000,
        senderName: "박대표",
        status: "예약",
        scheduledDate: "2026-05-10",
      },
      {
        id: 510,
        date: "2026-04-21",
        amount: 50_000_000,
        senderName: "이사장",
        status: "예약",
        scheduledDate: "2026-04-30",
      },
      {
        id: 501,
        date: "2026-04-15",
        amount: 600_000_000,
        senderName: "박대표",
        status: "송금완료",
      },
      {
        id: 502,
        date: "2026-04-02",
        amount: 200_000_000,
        senderName: "박대표",
        status: "결제완료",
      },
      {
        id: 503,
        date: "2026-03-28",
        amount: 150_000_000,
        senderName: "이사장",
        status: "송금완료",
      },
      {
        id: 504,
        date: "2026-03-10",
        amount: 300_000_000,
        senderName: "박대표",
        status: "송금완료",
      },
      {
        id: 505,
        date: "2026-02-20",
        amount: 100_000_000,
        senderName: "이사장",
        status: "실패",
      },
      {
        id: 506,
        date: "2026-02-05",
        amount: 250_000_000,
        senderName: "박대표",
        status: "송금완료",
      },
      {
        id: 507,
        date: "2026-01-22",
        amount: 180_000_000,
        senderName: "김페이몽",
        status: "송금완료",
      },
      {
        id: 508,
        date: "2026-01-05",
        amount: 220_000_000,
        senderName: "박대표",
        status: "송금완료",
      },
    ],
  },
  6: {
    counterparty: {
      bank: "토스뱅크",
      accountNumber: "5556667788",
      holder: "트리마제",
    },
    monthlyLimit: 3_100_000,
    usedThisMonth: 2_000_000,
    usageHistory: [
      {
        id: 601,
        date: "2026-04-01",
        amount: 2_000_000,
        senderName: "김페이몽",
        status: "송금완료",
      },
      {
        id: 602,
        date: "2026-03-01",
        amount: 3_100_000,
        senderName: "김페이몽",
        status: "송금완료",
      },
    ],
  },
  7: {
    counterparty: {
      bank: "기업은행",
      accountNumber: "0021234567",
      holder: "디타워임대",
    },
    monthlyLimit: 120_000_000,
    usedThisMonth: 0,
    usageHistory: [],
  },
  8: {
    counterparty: {
      bank: "농협은행",
      accountNumber: "302-1234-5678-01",
      holder: "리더스원",
    },
    monthlyLimit: 1_450_000_000,
    usedThisMonth: 1_450_000_000,
    usageHistory: [
      {
        id: 801,
        date: "2026-01-03",
        amount: 1_450_000_000,
        senderName: "이사장",
        status: "송금완료",
      },
    ],
  },
  9: {
    counterparty: {
      bank: "부산은행",
      accountNumber: "100123456",
      holder: "엘시티",
    },
    monthlyLimit: 4_800_000,
    usedThisMonth: 0,
    usageHistory: [
      {
        id: 901,
        date: "2026-02-01",
        amount: 4_800_000,
        senderName: "김페이몽",
        status: "실패",
      },
    ],
  },
  10: {
    counterparty: {
      bank: "신한은행",
      accountNumber: "110987654321",
      holder: "퍼스트파크",
    },
    monthlyLimit: 80_000_000,
    usedThisMonth: 0,
    usageHistory: [],
  },
  11: {
    counterparty: {
      bank: "국민은행",
      accountNumber: "44411122233",
      holder: "센트럴파크",
    },
    monthlyLimit: 980_000_000,
    usedThisMonth: 400_000_000,
    usageHistory: [
      {
        id: 1103,
        date: "2026-04-23",
        amount: 120_000_000,
        senderName: "박대표",
        status: "예약",
        scheduledDate: "2026-06-01",
      },
      {
        id: 1102,
        date: "2026-04-22",
        amount: 80_000_000,
        senderName: "이사장",
        status: "예약",
        scheduledDate: "2026-05-15",
      },
      {
        id: 1101,
        date: "2026-04-20",
        amount: 400_000_000,
        senderName: "박대표",
        status: "예약",
        scheduledDate: "2026-05-20",
      },
    ],
  },
  12: {
    counterparty: {
      bank: "케이뱅크",
      accountNumber: "700123456789",
      holder: "광교S클래스",
    },
    monthlyLimit: 1_850_000,
    usedThisMonth: 0,
    usageHistory: [],
  },
};
