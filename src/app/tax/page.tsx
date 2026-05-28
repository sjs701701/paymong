import type { Metadata } from "next";

import { TaxReportShell } from "@/components/tax/tax-report-shell";

export const metadata: Metadata = {
  title: "세금계산서/부가세 신고 | Paymong",
  description: "송금완료 내역을 선택해 정산 자료와 세금계산서 발급을 신청합니다.",
};

export default function TaxPage() {
  return <TaxReportShell />;
}
