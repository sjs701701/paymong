import type { Metadata } from "next";
import { NavigationHistoryTracker } from "@/components/shared/navigation-history";
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
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full bg-[var(--bg)] text-[var(--text-primary)] antialiased selection:bg-[var(--brand-1)]/16">
        <NavigationHistoryTracker />
        {children}
      </body>
    </html>
  );
}
