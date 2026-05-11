import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PurchaseDetailShell } from "@/components/shop/purchase-detail-shell";
import { getPurchaseById } from "@/components/shop/data";

export const metadata: Metadata = {
  title: "기프티콘 상세 | Paymong",
  description: "구매한 기프티콘의 바코드와 이용 안내",
};

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = getPurchaseById(id);
  if (!purchase) {
    notFound();
  }
  return <PurchaseDetailShell purchase={purchase} />;
}
