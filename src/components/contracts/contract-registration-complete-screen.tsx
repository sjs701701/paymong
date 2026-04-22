"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export function ContractRegistrationCompleteScreen() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f6f8ff] font-sans text-[#151515]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px]"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(0,171,255,0.18), transparent 42%), linear-gradient(180deg, rgba(0,56,241,0.18) 0%, rgba(0,171,255,0.08) 34%, rgba(246,248,255,0) 100%)",
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

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[520px] rounded-[36px] border border-slate-200/80 bg-white/90 px-8 py-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-10">
          <div className="relative mx-auto mb-8 flex h-[96px] w-[96px] items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[#0038F1]/12 blur-[2px]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-[7px] rounded-full bg-[#0038F1]/18"
            />
            <span
              className="relative flex h-[70px] w-[70px] items-center justify-center rounded-full text-white shadow-[0_18px_34px_rgba(0,56,241,0.28)]"
              style={{
                background:
                  "linear-gradient(135deg, #0038F1 0%, #2F7BFF 55%, #00ABFF 100%)",
              }}
            >
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#00abff]">
            Contract Complete
          </p>
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-slate-950">
            계약 등록이
            <br />
            완료되었습니다.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-500">
            등록한 계약은 계약리스트에서 바로 확인할 수 있어요.
            <br />
            필요한 경우 이어서 새 계약도 등록할 수 있습니다.
          </p>

          <Link
            href="/mypage"
            className="mt-10 inline-flex w-full items-center justify-center rounded-[18px] bg-[#0038F1] py-[18px] text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(0,56,241,0.24)] transition-colors hover:bg-[#002fd0]"
          >
            계약리스트로 돌아가기
          </Link>

          <Link
            href="/contracts/new"
            className="mt-5 inline-block text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            새 계약 다시 등록하기
          </Link>
        </div>
      </main>
    </div>
  );
}
