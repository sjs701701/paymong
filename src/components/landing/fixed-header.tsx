"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HEADER_LOGO_PATH = "/brand/paymong-header-logo.svg";

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
  { name: "프로젝트", href: "#" },
  { name: "서비스", href: "#" },
  { name: "아티클", href: "#" },
  { name: "커뮤니티", href: "#" },
  { name: "고객지원", href: "#" },
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

function generateDisplacementMap(w: number, h: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  const img = ctx.createImageData(w, h);
  const d = img.data;
  const cx = w / 2;
  const cy = h / 2;
  const ior = 1.45;
  const thickness = 65;
  const bezel = 18;
  const profile: number[] = [];
  const samples = 128;

  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const surfAngle = Math.asin(t) * (thickness / 100);
    const sinRef = Math.sin(surfAngle) / ior;
    const refAngle = Math.asin(Math.min(Math.max(sinRef, -1), 1));
    profile.push(Math.tan(surfAngle - refAngle) * thickness);
  }

  const maxD = Math.max(...profile.map((value) => Math.abs(value)), 0.001);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = Math.min(cx, cy) - bezel;
      const px = (y * w + x) * 4;

      if (dist > maxR + bezel) {
        d[px] = 128;
        d[px + 1] = 128;
        d[px + 2] = 0;
        d[px + 3] = 255;
        continue;
      }

      const norm = dist <= maxR ? dist / maxR : 1;
      const pIdx = Math.min(Math.floor(norm * (samples - 1)), samples - 1);
      const disp = profile[pIdx] / maxD;
      const angle = Math.atan2(dy, dx);
      const edge = dist > maxR ? Math.max(0, 1 - (dist - maxR) / bezel) : 1;

      d[px] = Math.round(128 + disp * Math.cos(angle) * 127 * edge);
      d[px + 1] = Math.round(128 + disp * Math.sin(angle) * 127 * edge);
      d[px + 2] = 0;
      d[px + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function LiquidGlassFilter() {
  const imageRef = useRef<SVGFEImageElement>(null);

  useEffect(() => {
    const dataUrl = generateDisplacementMap(400, 120);

    if (dataUrl) {
      imageRef.current?.setAttribute("href", dataUrl);
    }
  }, []);

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
      <filter id="liquid-glass-filter" primitiveUnits="objectBoundingBox">
        <feImage
          ref={imageRef}
          result="map"
          width="100%"
          height="100%"
          x="0"
          y="0"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.04" result="blur" />
        <feDisplacementMap
          id="disp"
          in="blur"
          in2="map"
          scale="0.5"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [pillStyle, setPillStyle] = useState<PillStyle>(initialPillStyle);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousScrollYRef = useRef(0);

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

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [autoHideEnabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

  return (
    <>
      <LiquidGlassFilter />
      <div className="liquid-header-scope font-sans text-[#224]">
        <style>{`
          .liquid-header-scope {
            --c-glass: #bbbbbc;
            --c-light: #fff;
            --c-dark: #000;
            --c-content: #224;
            --c-action: #0052f5;
            --glass-reflex-dark: 1;
            --glass-reflex-light: 1;
            --saturation: 150%;
          }

          .liquid-header-scope .glass-panel {
            border-radius: 99em;
            background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
            backdrop-filter: blur(8px) url(#liquid-glass-filter) saturate(var(--saturation));
            -webkit-backdrop-filter: blur(8px) saturate(var(--saturation));
            box-shadow:
              inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 10%), transparent),
              inset 1.8px 3px 0 -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 90%), transparent),
              inset -2px -2px 0 -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 80%), transparent),
              inset -3px -8px 1px -6px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
              inset -0.3px -1px 4px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 12%), transparent),
              inset -1.5px 2.5px 0 -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
              inset 0 3px 4px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
              inset 2px -6.5px 1px -4px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
              0 1px 5px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
              0 6px 16px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);
            transition:
              background-color 400ms cubic-bezier(1, 0, 0.4, 1),
              box-shadow 400ms cubic-bezier(1, 0, 0.4, 1);
          }

          .liquid-header-scope .nav-item {
            position: relative;
            z-index: 2;
          }

          .liquid-header-scope .nav-item::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 99em;
            background-color: color-mix(in srgb, var(--c-glass) 36%, transparent);
            z-index: -1;
            opacity: 0;
            transform: scale(0.8);
            transition: all 300ms cubic-bezier(1, 0, 0.4, 1);
            box-shadow:
              inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 10%), transparent),
              inset 2px 1px 0 -1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 90%), transparent),
              inset -1.5px -1px 0 -1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 80%), transparent),
              inset -2px -6px 1px -5px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
              inset -1px 2px 3px -1px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
              inset 0 -4px 1px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
              0 3px 6px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);
          }

          .liquid-header-scope .nav-item:hover::after {
            opacity: 1;
            transform: scale(1);
            animation: scaleToggle 440ms ease;
          }

          .liquid-header-scope .action-pill {
            position: relative;
            background-color: color-mix(in srgb, var(--c-action) 65%, transparent);
            backdrop-filter: blur(8px) url(#liquid-glass-filter) saturate(var(--saturation));
            -webkit-backdrop-filter: blur(8px) saturate(var(--saturation));
            box-shadow:
              inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 30%), transparent),
              inset 1.8px 3px 0 -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 90%), transparent),
              inset -2px -2px 0 -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 80%), transparent),
              inset -3px -8px 1px -6px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
              inset -0.3px -1px 4px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 12%), transparent),
              inset -1.5px 2.5px 0 -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
              inset 0 3px 4px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
              inset 2px -6.5px 1px -4px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
              0 4px 12px 0 color-mix(in srgb, var(--c-action) 40%, transparent),
              0 6px 16px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);
            transition:
              transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              background-color 300ms ease;
          }

          .liquid-header-scope .action-pill:hover {
            transform: scale(1.05);
            background-color: color-mix(in srgb, var(--c-action) 85%, transparent);
          }

          .liquid-header-scope .nav-pill {
            position: absolute;
            border-radius: 99em;
            background-color: color-mix(in srgb, var(--c-glass) 36%, transparent);
            z-index: 1;
            pointer-events: none;
            box-shadow:
              inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 10%), transparent),
              inset 2px 1px 0 -1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 90%), transparent),
              inset -1.5px -1px 0 -1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 80%), transparent),
              inset -2px -6px 1px -5px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
              inset -1px 2px 3px -1px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
              inset 0 -4px 1px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
              0 3px 6px 0 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);
          }

          .liquid-header-scope .category-item {
            position: relative;
            z-index: 2;
          }

          @keyframes scaleToggle {
            0% { scale: 1 1; }
            50% { scale: 1.1 1; }
            100% { scale: 1 1; }
          }
        `}</style>

        <header
          data-fixed-header
          data-auto-hide-enabled={autoHideEnabled ? "true" : "false"}
          data-header-hidden={headerHidden ? "true" : "false"}
          className={`fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-4 pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform md:px-8 ${
            headerHidden ? "-translate-y-[140%]" : "translate-y-0"
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
            <Link
              href="/"
              className="relative z-10 inline-flex items-center text-[1.02rem] font-semibold tracking-[0.26em] text-[var(--text-primary)] uppercase pointer-events-auto"
            >
              <Image
                src={HEADER_LOGO_PATH}
                alt="Paymong"
                className="h-8 w-auto object-contain"
                width={148}
                height={32}
                priority
              />
              <span className="hidden">Paymong</span>
            </Link>

            <nav
              className="glass-panel relative hidden h-[60px] items-center gap-1 px-2 pointer-events-auto lg:flex"
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="nav-pill"
                style={{
                  left: pillStyle.left,
                  top: pillStyle.top,
                  width: pillStyle.width,
                  height: pillStyle.height,
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
                  className="category-item rounded-full px-5 py-2 text-[15px] font-medium transition-colors"
                >
                  {category.name}
                </a>
              ))}
            </nav>

            <div className="glass-panel hidden h-[60px] items-center gap-2 px-2 pointer-events-auto lg:flex">
              <Link
                href="/login"
                className="nav-item rounded-full px-5 py-2 text-[15px] font-medium transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/start"
                className="action-pill rounded-full px-5 py-2 text-[15px] font-medium text-white"
              >
                시작하기
              </Link>
            </div>

            <div className="glass-panel flex h-[60px] items-center justify-center px-4 pointer-events-auto lg:hidden">
              <button
                type="button"
                aria-label="모바일 메뉴 열기"
                aria-expanded={isMobileMenuOpen}
                className="z-10 flex h-6 w-6 flex-col justify-center gap-[5px]"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                <span
                  className={`block h-[2px] w-full rounded-full transition-transform duration-300 ${
                    isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                  style={{ backgroundColor: "var(--c-content)" }}
                />
                <span
                  className={`block h-[2px] w-full rounded-full transition-opacity duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ backgroundColor: "var(--c-content)" }}
                />
                <span
                  className={`block h-[2px] w-full rounded-full transition-transform duration-300 ${
                    isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                  style={{ backgroundColor: "var(--c-content)" }}
                />
              </button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
