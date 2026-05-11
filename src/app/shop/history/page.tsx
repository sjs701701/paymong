import type { Metadata } from "next";

import { WalletShell } from "@/components/shop/wallet-shell";

export const metadata: Metadata = {
  title: "내 마일리지 | Paymong",
  description: "보유 마일리지 잔액과 구매한 기프티콘 내역",
};

export default function ShopHistoryPage() {
  return <WalletShell />;
}
