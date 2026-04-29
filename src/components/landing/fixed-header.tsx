"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { UserMenu } from "@/components/shared/user-menu";
import { setLoggedIn, useIsLoggedIn } from "@/lib/use-is-logged-in";

const HEADER_LOGO_PATH = "/brand/paymong-header-logo.svg";
const HEADER_LOGO_WHITE_PATH = "/brand/white-logo/paymong-header-logo-white.svg";
const HEADER_AUTO_HIDE_SYNC_EVENT = "paymong:header-auto-hide-sync";
const HEADER_PREVIEW_LOGO_SYNC_EVENT = "paymong:header-preview-logo-sync";

type HeaderCategory = {
  name: string;
  href: string;
};

type PillStyle = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  scale: number;
  transition: string;
};

const defaultCategories: HeaderCategory[] = [
  { name: "\uC790\uC8FC\uD558\uB294 \uC9C8\uBB38", href: "#" },
  { name: "\uC774\uC6A9\uAC00\uC774\uB4DC", href: "#" },
  { name: "\uC774\uC6A9\uD6C4\uAE30", href: "#" },
  { name: "\uB9C8\uC77C\uB9AC\uC9C0\uC0F5", href: "#" },
];

const initialPillStyle: PillStyle = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  opacity: 0,
  scale: 0.8,
  transition: "all 300ms ease",
};

function LiquidGlassFilter() {
  return (
    <svg
      aria-hidden
      style={{
        display: "none",
        position: "absolute",
        width: 0,
        height: 0,
        zIndex: -1,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.002 0.002"
          numOctaves="1"
          seed="5"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="5" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="1.5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="15"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

export function FixedHeader({
  categories = defaultCategories,
  autoHideEnabled = false,
}: {
  categories?: HeaderCategory[];
  autoHideEnabled?: boolean;
}) {
  const [isHidden, setIsHidden] = useState(false);
  const [useWhiteLogo, setUseWhiteLogo] = useState(false);
  const [pillStyle, setPillStyle] = useState<PillStyle>(initialPillStyle);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousScrollYRef = useRef(0);
  const previewLogoActiveRef = useRef(false);

  const isLoggedIn = useIsLoggedIn();
  const startHref = isLoggedIn ? "/mypage-v2" : "/login";

  useEffect(() => {
    previousScrollYRef.current = window.scrollY;
    const resetFrame = window.requestAnimationFrame(() => {
      setIsHidden(false);
    });

    if (!autoHideEnabled) {
      return () => {
        window.cancelAnimationFrame(resetFrame);
      };
    }

    let ticking = false;
    const threshold = 8;

    const syncVisibility = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousScrollYRef.current;

      if (currentY <= 8) {
        setIsHidden(false);
      } else if (delta > threshold) {
        setIsHidden(true);
      } else if (delta < -threshold) {
        setIsHidden(false);
      }

      previousScrollYRef.current = currentY;
      ticking = false;
    };

    previousScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncVisibility);
    };
    const handleHeaderSync = (event: Event) => {
      const hidden = (event as CustomEvent<{ hidden?: boolean }>).detail?.hidden;
      if (typeof hidden === "boolean") {
        setIsHidden(hidden);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener(HEADER_AUTO_HIDE_SYNC_EVENT, handleHeaderSync as EventListener);

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(HEADER_AUTO_HIDE_SYNC_EVENT, handleHeaderSync as EventListener);
    };
  }, [autoHideEnabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const evaluateLogoContext = () => {
      const sixthSection = document.querySelector<HTMLElement>("[data-sixth-section-root]");
      const faqSection = document.querySelector<HTMLElement>("[data-faq-section-root]");
      const headerBandBottom = 124;
      const faqSyncLine = 180;
      const isSixthSectionUnderHeader = sixthSection
        ? sixthSection.getBoundingClientRect().top <= headerBandBottom &&
          sixthSection.getBoundingClientRect().bottom >= 0
        : false;
      const isFaqSectionUnderHeader = faqSection
        ? faqSection.getBoundingClientRect().top <= faqSyncLine &&
          faqSection.getBoundingClientRect().bottom >= 0
        : false;

      setUseWhiteLogo((previewLogoActiveRef.current || isSixthSectionUnderHeader) && !isFaqSectionUnderHeader);
    };

    const handlePreviewSync = (event: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }>).detail?.active;

      if (typeof active === "boolean") {
        previewLogoActiveRef.current = active;
        evaluateLogoContext();
      }
    };

    evaluateLogoContext();
    window.addEventListener("scroll", evaluateLogoContext, { passive: true });
    window.addEventListener("resize", evaluateLogoContext);
    window.addEventListener(HEADER_PREVIEW_LOGO_SYNC_EVENT, handlePreviewSync as EventListener);

    return () => {
      window.removeEventListener("scroll", evaluateLogoContext);
      window.removeEventListener("resize", evaluateLogoContext);
      window.removeEventListener(HEADER_PREVIEW_LOGO_SYNC_EVENT, handlePreviewSync as EventListener);
    };
  }, []);

  const headerHidden = autoHideEnabled && isHidden;

  const handleMouseEnter = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } =
      event.currentTarget;

    if (pillStyle.opacity === 0) {
      setPillStyle({
        left: offsetLeft,
        top: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
        opacity: 1,
        scale: 1,
        transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      });
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const isMovingRight = offsetLeft > pillStyle.left;
    const rawLeft = Math.min(pillStyle.left, offsetLeft);
    const rawRight = Math.max(
      pillStyle.left + pillStyle.width,
      offsetLeft + offsetWidth,
    );
    const rawWidth = rawRight - rawLeft;
    const maxStretch = offsetWidth * 1.5;

    let stretchedLeft: number;
    let stretchedWidth: number;

    if (rawWidth <= maxStretch) {
      stretchedLeft = rawLeft;
      stretchedWidth = rawWidth;
    } else {
      stretchedWidth = maxStretch;
      stretchedLeft = isMovingRight
        ? offsetLeft + offsetWidth - maxStretch
        : offsetLeft;
    }

    setPillStyle((prev) => ({
      ...prev,
      left: stretchedLeft,
      width: stretchedWidth,
      scale: 0.85,
      transition: "all 120ms ease-out",
    }));

    timeoutRef.current = setTimeout(() => {
      setPillStyle({
        left: offsetLeft,
        top: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
        opacity: 1,
        scale: 1,
        transition: "all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      });
    }, 120);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setPillStyle((prev) => ({
      ...prev,
      opacity: 0,
      scale: 0.8,
      transition: "all 300ms ease",
    }));
  };

  const handleStartButtonPointer = (
    event: ReactMouseEvent<HTMLAnchorElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--start-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--start-y",
      `${event.clientY - rect.top}px`,
    );
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <>
      <LiquidGlassFilter />
      <div className="liquid-header-scope font-sans text-[#224]">
        <style>{`
          .liquid-header-scope {
            --c-content: #1f2a44;
            --c-action: rgba(10, 15, 30, 0.86);
          }

          .liquid-header-scope .glass-panel {
            border-radius: 99em;
            position: relative;
            overflow: hidden;
            box-shadow: 0 6px 6px rgba(0, 0, 0, 0.16), 0 0 20px rgba(0, 0, 0, 0.08);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
          }

          .liquid-header-scope .glass-effect {
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: 99em;
            backdrop-filter: blur(4px);
            filter: url(#glass-distortion);
            overflow: hidden;
            pointer-events: none;
          }

          .liquid-header-scope .glass-tint {
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: 99em;
            background: rgba(255, 255, 255, 0.5);
            pointer-events: none;
          }

          .liquid-header-scope .glass-shine {
            position: absolute;
            inset: 0;
            z-index: 2;
            border-radius: 99em;
            overflow: hidden;
            box-shadow:
              inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
              inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);
            pointer-events: none;
          }

          .liquid-header-scope .glass-content-top {
            position: relative;
            z-index: 3;
          }

          .liquid-header-scope .nav-item {
            color: rgba(31, 42, 68, 0.82);
          }

          .liquid-header-scope .action-pill {
            position: relative;
            background: var(--c-action);
            color: #ffffff;
            box-shadow: 0 8px 18px rgba(10, 15, 30, 0.18);
            transition: all 0.25s ease;
          }

          .liquid-header-scope .action-pill:hover {
            background: rgba(10, 15, 30, 0.95);
          }

          .liquid-header-scope .nav-pill {
            position: absolute;
            top: 50%;
            border-radius: 99em;
            background: rgba(0, 0, 0, 0.08);
            z-index: 2;
            pointer-events: none;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
          }

          .liquid-header-scope .category-item {
            position: relative;
            z-index: 3;
          }

          .liquid-header-scope .desktop-header-panel {
            background: #f3f4f6;
            border: none;
            box-shadow: none;
          }

          .liquid-header-scope .desktop-header-panel .glass-effect {
            backdrop-filter: none;
            filter: none;
          }

          .liquid-header-scope .desktop-header-panel .glass-tint {
            background: #f3f4f6;
          }

          .liquid-header-scope .desktop-header-panel .glass-shine {
            box-shadow: none;
          }

          .liquid-header-scope .desktop-start-button {
            --start-x: 50%;
            --start-y: 50%;
            position: relative;
            isolation: isolate;
            overflow: hidden;
            background: #06152d;
            color: #edf1f5;
          }

          .liquid-header-scope .desktop-start-button::before {
            content: "";
            position: absolute;
            left: var(--start-x);
            top: var(--start-y);
            z-index: -1;
            width: 14rem;
            height: 14rem;
            border-radius: 9999px;
            background: #0145f2;
            transform: translate(-50%, -50%) scale(0);
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .liquid-header-scope .desktop-start-button:hover::before,
          .liquid-header-scope .desktop-start-button:focus-visible::before {
            transform: translate(-50%, -50%) scale(1);
          }

          .liquid-header-scope .desktop-logout-button {
            background: #f3f4f6;
            color: #06152d;
          }
        `}</style>

        <header
          data-fixed-header
          data-auto-hide-enabled={autoHideEnabled ? "true" : "false"}
          data-header-hidden={headerHidden ? "true" : "false"}
          className={`fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-4 pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform md:px-8 ${
            headerHidden ? "-translate-y-[220%] lg:-translate-y-[140%]" : "translate-y-0"
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              className="relative z-10 inline-flex items-center pointer-events-auto drop-shadow-md lg:justify-self-start"
            >
              <Image
                src={useWhiteLogo ? HEADER_LOGO_WHITE_PATH : HEADER_LOGO_PATH}
                alt="Paymong"
                className="h-6 w-auto object-contain transition-transform hover:scale-[1.03] sm:h-10"
                width={148}
                height={32}
                priority
              />
              <span className="hidden">Paymong</span>
            </Link>

            <nav
              className="glass-panel desktop-header-panel relative hidden h-[60px] items-center gap-1 px-2 pointer-events-auto lg:flex"
              onMouseLeave={handleMouseLeave}
            >
              <div className="glass-effect" />
              <div className="glass-tint" />
              <div className="glass-shine" />
              <div
                className="nav-pill"
                style={{
                  left: pillStyle.left,
                  top: pillStyle.top + pillStyle.height / 2,
                  width: pillStyle.width,
                  height: Math.max(0, pillStyle.height - 16),
                  marginTop: `-${Math.max(0, pillStyle.height - 16) / 2}px`,
                  opacity: pillStyle.opacity,
                  transform: `scale(${pillStyle.scale})`,
                  transition: pillStyle.transition,
                }}
              />
              {categories.map((category) => (
                <a
                  key={`${category.name}-${category.href}`}
                  href={category.href}
                  onMouseEnter={handleMouseEnter}
                  className="category-item glass-content-top rounded-full px-5 py-2 text-[15px] font-medium transition-colors hover:text-black"
                >
                  {category.name}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex lg:justify-self-end">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="desktop-logout-button pointer-events-auto inline-flex h-[60px] items-center rounded-full px-6 text-[15px] font-medium shadow-none transition-[filter] hover:brightness-95"
                >
                  {"\uB85C\uADF8\uC544\uC6C3"}
                </button>
              ) : null}
              <Link
                href={startHref}
                onMouseEnter={handleStartButtonPointer}
                onMouseMove={handleStartButtonPointer}
                onFocus={(event) => {
                  event.currentTarget.style.setProperty("--start-x", "50%");
                  event.currentTarget.style.setProperty("--start-y", "50%");
                }}
                className="desktop-start-button pointer-events-auto inline-flex h-[60px] items-center rounded-full px-6 text-[15px] font-medium shadow-none"
              >
                <span className="relative z-10">
                  {"\uC2DC\uC791\uD558\uAE30"}
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto lg:hidden">
              <Link
                href={startHref}
                style={{ backgroundColor: "#06152d", color: "#edf1f5" }}
                className="inline-flex h-11 items-center rounded-full px-4 text-[13px] font-medium shadow-none transition-[filter] hover:brightness-95"
              >
                {"\uC2DC\uC791\uD558\uAE30"}
              </Link>
              <div
                className="glass-panel relative inline-flex h-11 w-11 items-center justify-center"
                style={{ boxShadow: "none" }}
              >
                <div className="glass-effect" />
                <div className="glass-tint" />
                <div className="glass-shine" />
                <UserMenu
                  trigger="icon"
                  triggerClassName="glass-content-top h-9 w-9 border-transparent bg-transparent text-[#1f2a44] shadow-none hover:bg-black/5"
                />
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
