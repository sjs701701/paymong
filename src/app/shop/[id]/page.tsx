import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailShell } from "@/components/shop/product-detail-shell";
import { getProductById } from "@/components/shop/data";

export const metadata: Metadata = {
  title: "기프티콘 상품 상세 | Paymong",
  description: "마일리지로 교환할 수 있는 기프티콘 상세 정보",
};

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    notFound();
  }
  return <ProductDetailShell product={product} />;
}
