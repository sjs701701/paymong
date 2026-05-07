import type { Metadata } from "next";

import { ShopShell } from "@/components/shop/shop-shell";

export const metadata: Metadata = {
  title: "기프티콘 샵 | Paymong",
  description: "마일리지로 교환할 수 있는 기프티콘 모음",
};

export default function ShopPage() {
  return <ShopShell />;
}
