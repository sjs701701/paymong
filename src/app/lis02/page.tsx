import type { Metadata } from "next";

import { Lis02Shell } from "@/components/lis02/lis02-shell";

export const metadata: Metadata = {
  title: "계약 사용 내역 | Paymong",
  description: "계약별 이용 내역과 사용 가능 한도를 확인합니다.",
};

export default function Lis02Page() {
  return <Lis02Shell />;
}
