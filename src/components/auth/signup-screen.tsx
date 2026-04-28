"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";

export function SignupScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const isPhoneValid = phoneNumber.length === 11;

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
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/paymong-header-logo.svg"
              alt="Paymong"
              width={148}
              height={32}
              priority
              className="h-6 w-auto object-contain sm:h-10"
            />
          </Link>

          <div className="text-sm font-medium text-slate-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-slate-950 hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mt-10 flex flex-1 flex-col items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[480px]">
          <Link
            href="/login"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            뒤로가기
          </Link>

          <h1 className="mb-2 text-[34px] font-semibold leading-tight tracking-tight text-slate-950">
            휴대폰 번호 인증으로
            <br />
            가입해주세요.
          </h1>
          <p className="mb-8 text-[15px] text-[#7A7A7A]">
            휴대폰 인증 한번으로 회원가입 끝!
            <br />
            아이디/패스워드 없이 바로 이용이 가능합니다.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
                setPhoneNumber(digitsOnly);
              }}
              className="block w-full rounded-[8px] border border-[#E0E0E0] bg-white px-4 py-[14px] text-[15px] transition-shadow focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="휴대폰번호"
              maxLength={11}
              required
            />

            {isPhoneValid ? (
              <Link
                href="/signup/complete"
                className="block w-full rounded-[8px] bg-blue-600 py-[14px] text-center text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                본인인증 진행
              </Link>
            ) : (
              <button
                type="submit"
                disabled
                className="w-full cursor-not-allowed rounded-[8px] bg-[#D9DDE3] py-[14px] text-[15px] font-semibold text-[#5F6773]"
              >
                본인인증 진행
              </button>
            )}
          </form>

          <div className="my-7 flex items-center">
            <div className="h-px flex-1 bg-[#EAEAEA]" />
            <span className="px-4 text-[13px] text-[#A3A3A3]">또는</span>
            <div className="h-px flex-1 bg-[#EAEAEA]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-[#E0E0E0] bg-white px-4 py-[14px] text-[15px] font-medium shadow-sm transition-colors hover:bg-gray-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google 간편로그인
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-[#03C75A] bg-[#03C75A] px-4 py-[14px] text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-[#02b451]"
            >
              <span className="text-base font-black leading-none">N</span>
              NAVER 간편로그인
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-[#FEE500] bg-[#FEE500] px-4 py-[14px] text-[15px] font-medium text-[#191919] shadow-sm transition-colors hover:bg-[#f4da00]"
            >
              <span className="text-sm font-black leading-none">k</span>
              Kakao 간편로그인
            </button>
          </div>

          <p className="mt-6 text-[13px] leading-relaxed text-[#7A7A7A]">
            계정을 생성하면 아래 정책을 읽고 이해했으며 이에 동의한 것으로 간주됩니다.{" "}
            <a
              href="#"
              className="inline-flex items-center gap-[2px] text-[#2B6DED] hover:underline"
            >
              Paymong 정책 안내
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
