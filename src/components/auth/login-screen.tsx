"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ImageColumnProps = {
  direction: "up" | "down";
  duration: string;
  delay: string;
  seed: number;
};

const customStyles = `
  .login-marquee-column {
    --login-card-height: 400px;
    --login-card-gap: 1.5rem;
    --login-card-count: 6;
    --login-loop-height: calc(
      (var(--login-card-height) * var(--login-card-count)) +
      (var(--login-card-gap) * var(--login-card-count))
    );
  }
  @keyframes slide-up {
    0% { transform: translateY(0); }
    100% { transform: translateY(calc(-1 * var(--login-loop-height))); }
  }
  @keyframes slide-down {
    0% { transform: translateY(calc(-1 * var(--login-loop-height))); }
    100% { transform: translateY(0); }
  }
  .login-animate-slide-up {
    animation: slide-up linear infinite;
  }
  .login-animate-slide-down {
    animation: slide-down linear infinite;
  }
`;

const images = [
  "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1633390382894-0198de7e5fb0?auto=format&fit=crop&w=900&q=80",
] as const;

const authProviders = [
  {
    label: "Continue with Google",
    className: "border-gray-200 bg-white text-slate-900 hover:bg-gray-50",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    label: "Continue with NAVER",
    className: "border-[#03C75A] bg-[#03C75A] text-white hover:bg-[#02b451]",
    icon: <span className="text-base font-black leading-none">N</span>,
  },
  {
    label: "Continue with Kakao",
    className: "border-[#FEE500] bg-[#FEE500] text-[#191919] hover:bg-[#f4da00]",
    icon: <span className="text-sm font-black leading-none">k</span>,
  },
] as const;

function buildColumnImages(seed: number) {
  const rotated = images.map((_, index) => images[(index + seed) % images.length]);
  return [...rotated, ...rotated];
}

function ImageColumn({ direction, duration, delay, seed }: ImageColumnProps) {
  const columnImages = buildColumnImages(seed).slice(0, images.length);

  return (
    <div
      className={`login-marquee-column flex w-64 flex-col gap-6 will-change-transform ${
        direction === "up" ? "login-animate-slide-up" : "login-animate-slide-down"
      }`}
      style={{ animationDuration: duration, animationDelay: delay }}
    >
      {[0, 1].map((groupIndex) => (
        <div key={`${seed}-group-${groupIndex}`} className="flex flex-col gap-6">
          {columnImages.map((src, index) => (
            <div
              key={`${seed}-${groupIndex}-${index}`}
              className="h-[400px] w-full flex-shrink-0 overflow-hidden rounded-[1.75rem] bg-gray-200 shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [isVerificationErrorOpen, setIsVerificationErrorOpen] = useState(false);
  const verificationInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isPhoneValid = phoneNumber.length === 11;

  const closeVerificationError = () => {
    setIsVerificationErrorOpen(false);
    setVerificationCode(["", "", "", "", "", ""]);
    requestAnimationFrame(() => {
      verificationInputRefs.current[0]?.focus();
    });
  };

  const validateVerificationCode = (codeDigits: string[]) => {
    const joinedCode = codeDigits.join("");

    // TODO(paymong-auth): Replace this temporary hard-coded OTP check
    // with the real verification module/API once the auth integration is ready.
    if (joinedCode === "000000") {
      router.push("/mypage-v2");
      return;
    }

    setIsVerificationErrorOpen(true);
  };

  const handleVerificationDigitChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(0, 1);
    const nextCode = [...verificationCode];
    nextCode[index] = nextValue;

    setVerificationCode(nextCode);

    if (nextValue && index < verificationInputRefs.current.length - 1) {
      verificationInputRefs.current[index + 1]?.focus();
    }

    if (nextCode.every((digit) => digit.length === 1)) {
      validateVerificationCode(nextCode);
    }
  };

  const handleVerificationKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !verificationCode[index] && index > 0) {
      verificationInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <style>{customStyles}</style>
      <div className="flex min-h-screen w-full overflow-hidden bg-white font-sans text-gray-900">
        <div className="relative z-10 flex w-full items-center justify-center bg-white px-8 py-12 sm:px-14 md:px-20 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-black/5 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <Image src="/logo-icon.svg" alt="Paymong" width={32} height={20} priority />
              </div>
              <p className="mt-4 text-sm font-medium tracking-[0.2em] text-slate-400">PAYMONG</p>
            </div>

            <h1 className="mb-8 text-center text-3xl font-bold tracking-[-0.04em] text-slate-950">
              Welcome back
            </h1>

            <form
              className="flex w-full flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();

                if (!isPhoneValid) {
                  return;
                }

                setVerificationCode(["", "", "", "", "", ""]);
                setIsVerificationVisible(true);
                requestAnimationFrame(() => {
                  verificationInputRefs.current[0]?.focus();
                });
              }}
            >
              <input
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(event) => {
                  const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 11);
                  setPhoneNumber(digitsOnly);
                }}
                placeholder="휴대폰 번호 (-없이 숫자만 입력)"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors focus:border-black focus:bg-white focus:outline-none"
                maxLength={11}
                required
              />
              <button
                type="submit"
                disabled={!isPhoneValid}
                className={`group relative w-full overflow-hidden rounded-xl px-4 py-3 font-medium transition-colors ${
                  isPhoneValid
                    ? "bg-black text-white"
                    : "cursor-not-allowed bg-[#D9DDE3] text-[#5F6773]"
                }`}
                onMouseEnter={(event) => {
                  if (!isPhoneValid) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
                  event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
                }}
                onMouseMove={(event) => {
                  if (!isPhoneValid) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
                  event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
                }}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-[var(--pointer-x,50%)] top-[var(--pointer-y,50%)] h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0038F1] scale-0 transition-transform duration-500 ease-out ${
                    isPhoneValid ? "group-hover:scale-100" : ""
                  }`}
                />
                <span className="relative z-10">인증문자 받기</span>
              </button>

              {isVerificationVisible ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">인증번호 입력</p>
                    <button
                      type="button"
                      className="text-sm font-medium text-[#0038F1] transition-colors hover:text-[#002ec8]"
                    >
                      재전송
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={`verification-digit-${index}`}
                        ref={(element) => {
                          verificationInputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleVerificationDigitChange(index, event.target.value)}
                        onKeyDown={(event) => handleVerificationKeyDown(index, event)}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white text-center text-lg font-semibold text-slate-950 transition-colors focus:border-[#0038F1] focus:outline-none focus:ring-1 focus:ring-[#0038F1]"
                        aria-label={`인증번호 ${index + 1}번째 자리`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <label className="mt-1 flex items-center justify-between px-1 py-1">
                <span className="text-sm font-medium text-slate-700">자동로그인</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="h-7 w-12 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#0038F1]" />
                  <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </form>

            <div className="my-6 flex w-full items-center">
              <hr className="flex-grow border-gray-100" />
              <span className="px-4 text-sm text-gray-400">or</span>
              <hr className="flex-grow border-gray-100" />
            </div>

            <div className="space-y-3">
              {authProviders.map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 font-medium transition-colors ${provider.className}`}
                >
                  <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
                    {provider.icon}
                  </span>
                  <span>{provider.label}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              By continuing, you agree to our{" "}
              <a href="#" className="underline transition-colors hover:text-gray-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline transition-colors hover:text-gray-600">
                Privacy Policy
              </a>
              .
            </p>

            <p className="mt-4 text-center text-sm text-slate-500">
              아직 계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="relative inline-block font-bold text-slate-950 transition-colors hover:text-slate-700 after:absolute after:left-0 after:bottom-[-2px] after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out hover:after:scale-x-100"
              >
                회원가입 하러가기
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden border-l border-gray-100 bg-gray-50 lg:block lg:w-1/2">
          <div
            className="absolute left-1/2 top-1/2 flex h-[200%] w-[150%] gap-6"
            style={{ transform: "translate(-50%, -50%) rotate(15deg)" }}
          >
            <ImageColumn direction="up" duration="40s" delay="0s" seed={0} />
            <ImageColumn direction="down" duration="45s" delay="-10s" seed={1} />
            <ImageColumn direction="up" duration="35s" delay="-5s" seed={2} />
            <ImageColumn direction="down" duration="50s" delay="-20s" seed={3} />
            <ImageColumn direction="up" duration="42s" delay="-15s" seed={4} />
          </div>
        </div>
      </div>

      {isVerificationErrorOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/20 px-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/40 bg-white/25 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-[16px]">
            <div className="pointer-events-none absolute left-0 top-0 h-1/3 w-full bg-gradient-to-b from-white/30 to-transparent" />
            <h2 className="relative z-10 text-lg font-semibold text-slate-950">
              인증번호를 다시 확인해주세요
            </h2>
            <p className="relative z-10 mt-2 text-sm font-medium leading-6 text-black">
              입력한 인증번호가 올바르지 않습니다. 다시 입력해 주세요.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeVerificationError}
                className="relative z-10 rounded-xl border border-[#6ea8ff]/50 bg-[#0038F1]/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-[#002ec8]/85 hover:shadow-lg"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
