import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paymong",
  description:
    "Paymong enables premium credit-card payments for contract-based expenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body className="min-h-full bg-[var(--bg)] text-[var(--text-primary)] antialiased selection:bg-[var(--brand-1)]/16">
        {children}
      </body>
    </html>
  );
}
