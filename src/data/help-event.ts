export type EventContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export type EventStatus = "ongoing" | "ended";

export type EventItem = {
  id: number;
  title: string;
  status: EventStatus;
  startsAt: string;
  endsAt: string;
  thumbnail: string;
  thumbnailAlt: string;
  content: EventContentBlock[];
};

export function formatEventDate(iso: string): string {
  return iso.slice(0, 10);
}

export function formatEventPeriod(item: Pick<EventItem, "startsAt" | "endsAt">) {
  return `${formatEventDate(item.startsAt)} ~ ${formatEventDate(item.endsAt)}`;
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  ongoing: "진행중",
  ended: "종료",
};

export const EVENT_ITEMS: EventItem[] = [
  {
    id: 12,
    title: "첫 계약 등록 수수료 50% 할인 이벤트",
    status: "ongoing",
    startsAt: "2026-04-20T00:00:00",
    endsAt: "2026-05-31T23:59:59",
    thumbnail: "/events/event-contract-favorite.png",
    thumbnailAlt: "첫 계약 등록 할인 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "페이몽에서 처음으로 계약을 등록하는 회원을 위해 첫 결제 수수료 50% 할인 이벤트를 진행합니다.",
      },
      {
        type: "image",
        src: "/events/event-contract-favorite.png",
        alt: "첫 계약 등록 수수료 할인",
        caption: "이벤트 기간 내 첫 계약 등록 및 결제 완료 시 자동 적용됩니다.",
      },
      {
        type: "text",
        value:
          "■ 대상\n이벤트 기간 내 첫 계약을 등록하고 결제를 완료한 회원\n\n■ 혜택\n첫 결제 건 서비스 수수료 50% 할인\n\n■ 유의사항\n할인 혜택은 계정당 1회만 제공되며, 내부 정책에 따라 부정 이용으로 판단되는 경우 혜택이 취소될 수 있습니다.",
      },
    ],
  },
  {
    id: 11,
    title: "5월 월세 자동결제 예약 이벤트",
    status: "ongoing",
    startsAt: "2026-04-15T00:00:00",
    endsAt: "2026-05-15T23:59:59",
    thumbnail: "/events/event-rent-reservation-color.png",
    thumbnailAlt: "월세 자동결제 예약 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "월세 송금을 미리 예약하면 추첨을 통해 페이몽 수수료 쿠폰을 드립니다.",
      },
      {
        type: "text",
        value:
          "■ 참여 방법\n1. 계약리스트에서 월세 계약 선택\n2. 결제하기에서 예약 송금 선택\n3. 5월 송금일 지정 후 결제 완료\n\n■ 경품\n수수료 3천원 할인 쿠폰 100명",
      },
    ],
  },
  {
    id: 10,
    title: "카드분할결제 체험 프로모션",
    status: "ongoing",
    startsAt: "2026-04-01T00:00:00",
    endsAt: "2026-05-10T23:59:59",
    thumbnail: "/events/event-split-payment-color.png",
    thumbnailAlt: "카드분할결제 체험 프로모션 배너",
    content: [
      {
        type: "text",
        value:
          "한 번의 송금을 여러 카드로 나누어 결제하는 카드분할결제를 체험해보세요.",
      },
      {
        type: "image",
        src: "/events/event-split-payment-color.png",
        alt: "카드분할결제 체험 프로모션",
      },
      {
        type: "text",
        value:
          "이벤트 기간 동안 카드분할결제를 이용한 회원 중 추첨을 통해 결제 수수료 캐시백 혜택을 제공합니다.",
      },
    ],
  },
  {
    id: 9,
    title: "관리비 결제 카테고리 오픈 기념 이벤트",
    status: "ongoing",
    startsAt: "2026-03-28T00:00:00",
    endsAt: "2026-04-30T23:59:59",
    thumbnail: "/events/event-management-fee-color.png",
    thumbnailAlt: "관리비 카테고리 오픈 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "관리비 카테고리 오픈을 기념해 관리비 계약을 등록한 회원에게 수수료 할인 혜택을 제공합니다.",
      },
    ],
  },
  {
    id: 8,
    title: "친구 초대하고 수수료 쿠폰 받기",
    status: "ongoing",
    startsAt: "2026-03-20T00:00:00",
    endsAt: "2026-05-31T23:59:59",
    thumbnail: "/events/event-friend-invite-color.png",
    thumbnailAlt: "친구 초대 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "친구가 초대 링크로 가입하고 첫 결제를 완료하면 초대한 회원과 친구 모두에게 수수료 쿠폰을 드립니다.",
      },
    ],
  },
  {
    id: 7,
    title: "교육비 정기결제 오픈 사전 신청 이벤트",
    status: "ended",
    startsAt: "2026-02-20T00:00:00",
    endsAt: "2026-03-31T23:59:59",
    thumbnail: "/events/event-education-favorite.png",
    thumbnailAlt: "교육비 정기결제 사전 신청 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "교육비 정기결제 오픈 전 사전 신청에 참여해주신 모든 회원께 감사드립니다. 지급 대상 쿠폰은 순차 발급되었습니다.",
      },
    ],
  },
  {
    id: 6,
    title: "PC 웹 마이페이지 리뉴얼 체험 이벤트",
    status: "ended",
    startsAt: "2026-02-12T00:00:00",
    endsAt: "2026-03-15T23:59:59",
    thumbnail: "/events/event-contract-discount-color.png",
    thumbnailAlt: "PC 웹 마이페이지 리뉴얼 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "리뉴얼된 PC 웹 마이페이지를 이용하고 의견을 남겨주신 회원께 감사드립니다.",
      },
    ],
  },
  {
    id: 5,
    title: "설 연휴 예약 송금 안심 이벤트",
    status: "ended",
    startsAt: "2026-01-25T00:00:00",
    endsAt: "2026-02-18T23:59:59",
    thumbnail: "/events/event-rent-reservation-color.png",
    thumbnailAlt: "설 연휴 예약 송금 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "설 연휴 전 예약 송금을 등록한 회원을 대상으로 진행한 안심 이벤트가 종료되었습니다.",
      },
    ],
  },
  {
    id: 4,
    title: "신년 첫 결제 응원 이벤트",
    status: "ended",
    startsAt: "2026-01-01T00:00:00",
    endsAt: "2026-01-31T23:59:59",
    thumbnail: "/events/event-management-fee-color.png",
    thumbnailAlt: "신년 첫 결제 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "2026년 새해 첫 결제 이벤트에 참여해주셔서 감사합니다. 당첨자는 개별 안내되었습니다.",
      },
    ],
  },
  {
    id: 3,
    title: "연말정산 자료 발급 알림 신청 이벤트",
    status: "ended",
    startsAt: "2025-12-20T00:00:00",
    endsAt: "2026-01-15T23:59:59",
    thumbnail: "/events/event-friend-invite-color.png",
    thumbnailAlt: "연말정산 알림 신청 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "연말정산 자료 발급 알림 신청 이벤트가 종료되었습니다. 신청 회원께 알림이 발송되었습니다.",
      },
    ],
  },
  {
    id: 2,
    title: "크리스마스 수수료 쿠폰 이벤트",
    status: "ended",
    startsAt: "2025-12-01T00:00:00",
    endsAt: "2025-12-25T23:59:59",
    thumbnail: "/events/event-education-fee-color.png",
    thumbnailAlt: "크리스마스 수수료 쿠폰 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "크리스마스 시즌 수수료 쿠폰 이벤트가 종료되었습니다. 쿠폰은 마이페이지에서 확인할 수 있습니다.",
      },
    ],
  },
  {
    id: 1,
    title: "페이몽 정식 오픈 기념 신규 가입 이벤트",
    status: "ended",
    startsAt: "2025-08-15T00:00:00",
    endsAt: "2025-11-30T23:59:59",
    thumbnail: "/events/event-contract-discount-color.png",
    thumbnailAlt: "페이몽 정식 오픈 기념 이벤트 배너",
    content: [
      {
        type: "text",
        value:
          "페이몽 정식 오픈 기념 신규 가입 이벤트가 종료되었습니다. 앞으로도 다양한 혜택으로 찾아뵙겠습니다.",
      },
    ],
  },
];
