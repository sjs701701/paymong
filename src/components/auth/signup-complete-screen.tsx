"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export function SignupCompleteScreen() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f6f6f6] font-sans text-[#151515]">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[500px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 56, 241, 0.16) 0%, rgba(0, 171, 255, 0.08) 34%, rgba(246, 246, 246, 0) 100%)",
        }}
      />

      <header className="relative z-10 px-4 py-6 md:px-8 md:py-6">
        <div className="mx-auto flex w-full max-w-[1360px] items-center">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/paymong-header-logo.svg"
              alt="Paymong"
              width={148}
              height={32}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-[480px] text-center">
          <div className="relative mx-auto mb-8 flex h-[88px] w-[88px] items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[#0038F1]/12 blur-[2px]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-[6px] rounded-full bg-[#0038F1]/18"
            />
            <span
              className="relative flex h-[64px] w-[64px] items-center justify-center rounded-full text-white shadow-[0_14px_30px_rgba(0,56,241,0.32)]"
              style={{
                background:
                  "linear-gradient(135deg, #0038F1 0%, #2F7BFF 55%, #00ABFF 100%)",
              }}
            >
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
          </div>

          <h1 className="mb-3 text-[34px] font-semibold leading-tight tracking-tight text-slate-950">
            페이몽 회원가입을
            <br />
            축하드립니다.
          </h1>

          <Link
            href="/contracts/new"
            className="mt-10 inline-flex w-full items-center justify-center rounded-[8px] bg-blue-600 py-[18px] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 hover:text-white visited:text-white"
          >
            계약 등록하기
          </Link>

          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
