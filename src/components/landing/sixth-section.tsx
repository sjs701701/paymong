"use client";

import type { CSSProperties, ReactNode } from "react";

type SixthSectionShellProps = {
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  style?: CSSProperties;
};

type SixthSectionSurfaceProps = {
  className?: string;
};

const SIXTH_SECTION_GRADIENT =
  "linear-gradient(180deg, #001335 13.46%, #001F58 30.29%, #003B79 42.31%, #006DC7 55.77%, #93E2FF 79.33%, #FFF 96.63%)";

export function SixthSectionShell({
  className = "",
  contentClassName = "",
  children,
  style,
}: SixthSectionShellProps) {
  return (
    <div
      className={`h-full w-full overflow-hidden text-white ${className}`.trim()}
      style={{
        backgroundImage: SIXTH_SECTION_GRADIENT,
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    >
      <div
        className={`mx-auto flex h-full w-full max-w-[1440px] items-center justify-center px-6 text-center ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}

export function SixthSectionSurface({ className = "" }: SixthSectionSurfaceProps) {
  return (
    <div className={`text-center ${className}`.trim()}>
      <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/38">Section 6</div>
      <h2 className="mt-6 text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.92] tracking-[-0.08em]">
        섹션 6 내용이
        <br />
        들어갈 예정입니다.
      </h2>
    </div>
  );
}

export function SixthSection() {
  return (
    <section
      className="section-two-onward-font relative z-20 overflow-hidden px-5 py-28 text-white sm:px-8 lg:px-16 lg:py-36"
      style={{
        backgroundColor: "#FFF",
        backgroundImage: SIXTH_SECTION_GRADIENT,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 200vh",
        backgroundPosition: "0 -100vh",
      }}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <SixthSectionShell
          className="min-h-[70vh]"
          style={{ backgroundImage: "none" }}
        >
          <SixthSectionSurface />
        </SixthSectionShell>
      </div>
    </section>
  );
}
