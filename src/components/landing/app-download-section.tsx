"use client";

// NOTE(paymong-app-download): Mini section that lives between FAQ and the
// footer. It's the "you've seen everything, now grab the app" call-to-action
// that converts users who scrolled all the way through the landing pitch.
// Replace the placeholder href values with the real Play Store / App Store
// listing URLs once the apps are published.

const PLAY_STORE_URL = "#";
const APP_STORE_URL = "#";

type BrandIconProps = {
  className?: string;
};

function GooglePlayLogo({ className }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.7 2.45v19.1l9.64-9.55L4.7 2.45Z" fill="#00C853" />
      <path d="M14.34 12 4.7 2.45l11.94 6.74L14.34 12Z" fill="#40C4FF" />
      <path d="m14.34 12-9.64 9.55 11.94-6.74L14.34 12Z" fill="#FFD600" />
      <path
        d="m16.64 9.19 2.88 1.62c.86.48.86 1.9 0 2.38l-2.88 1.62L14.34 12l2.3-2.81Z"
        fill="#FF3D00"
      />
    </svg>
  );
}

function AppleLogo({ className }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16.36 12.4c-.02-2.05 1.67-3.04 1.75-3.09-.96-1.39-2.43-1.58-2.94-1.6-1.24-.13-2.44.73-3.07.73-.64 0-1.61-.71-2.65-.69-1.36.02-2.62.79-3.32 2.01-1.43 2.47-.37 6.12 1.01 8.12.68.98 1.48 2.07 2.53 2.03 1.03-.04 1.41-.65 2.65-.65 1.22 0 1.58.65 2.66.63 1.1-.02 1.79-.98 2.45-1.96.79-1.13 1.1-2.24 1.11-2.29-.02-.01-2.15-.82-2.18-3.24ZM14.36 6.4c.55-.68.93-1.6.83-2.53-.8.03-1.8.54-2.37 1.19-.52.59-.98 1.55-.86 2.45.91.07 1.83-.46 2.4-1.11Z" />
    </svg>
  );
}

export function AppDownloadSection() {
  return (
    <section className="section-two-onward-font relative z-40 overflow-hidden bg-[#0a0f1e] px-5 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, rgba(0, 56, 241, 0.35) 0%, rgba(10, 15, 30, 0) 70%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center gap-5 text-center sm:gap-7">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-sm">
          Download the app
        </span>
        <h2 className="text-[clamp(1.85rem,5.2vw,4.2rem)] font-semibold leading-[1.1] tracking-[-0.06em] text-white">
          페이몽을 손안에
        </h2>
        <p className="text-[0.95rem] leading-[1.6] text-white/72 sm:text-base lg:text-lg">
          앱으로 더 빠르고 편하게 시작해보세요.
        </p>

        <div className="mt-3 grid w-full max-w-md grid-cols-1 gap-3 sm:mt-5 sm:max-w-[28rem] sm:grid-cols-2 sm:gap-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Play에서 다운로드"
            style={{ color: "#ffffff" }}
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-black/60 px-6 text-left transition-colors duration-200 hover:bg-black/80 sm:h-16 sm:px-7"
          >
            <GooglePlayLogo className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <div className="leading-tight">
              <div
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                className="text-[0.7rem] font-medium uppercase tracking-[0.16em] sm:text-[0.72rem]"
              >
                Download on
              </div>
              <div
                style={{ color: "#ffffff" }}
                className="text-base font-semibold tracking-[-0.01em] sm:text-lg"
              >
                Google Play
              </div>
            </div>
          </a>

          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="App Store에서 다운로드"
            style={{ color: "#ffffff" }}
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-black/60 px-6 text-left transition-colors duration-200 hover:bg-black/80 sm:h-16 sm:px-7"
          >
            <AppleLogo className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <div className="leading-tight">
              <div
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                className="text-[0.7rem] font-medium uppercase tracking-[0.16em] sm:text-[0.72rem]"
              >
                Download on
              </div>
              <div
                style={{ color: "#ffffff" }}
                className="text-base font-semibold tracking-[-0.01em] sm:text-lg"
              >
                App Store
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
