import type { Metadata } from "next";

import { PaymentRecordsShell } from "@/components/payment-records/payment-records-shell";

export const metadata: Metadata = {
  title: "결제/송금자료 조회 | Paymong",
  description: "결제·송금완료 내역을 조회합니다.",
};

export default function PaymentRecordsPage() {
  return <PaymentRecordsShell />;
}
