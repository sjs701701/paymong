"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const HEADER_LOGO_PATH = "/brand/paymong-header-logo.svg";

const navItems = [
  "카테고리1",
  "카테고리2",
  "카테고리3",
  "카테고리4",
  "카테고리5",
];

/* ── Physics-based map generators (Snell's law) ── */

function generateDisplacementMap(w: number, h: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;

  const cx = w / 2;
  const cy = h / 2;
  const ior = 1.45;
  const thickness = 65;
  const bezel = 18;

  // Snell's law refraction profile
  const N = 128;
  const profile: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const surfAngle = Math.asin(t) * (thickness / 100);
    const sinRef = Math.sin(surfAngle) / ior;
    const refAngle = Math.asin(Math.min(Math.max(sinRef, -1), 1));
    profile.push(Math.tan(surfAngle - refAngle) * thickness);
  }
  const maxD = Math.max(...profile.map(Math.abs), 0.001);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
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
      const pIdx = Math.min(Math.floor(norm * (N - 1)), N - 1);
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

function generateSpecularMap(w: number, h: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(cx, cy);
  const lightAngle = (55 * Math.PI) / 180;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / maxR;
      const ny = (y - cy) / maxR;
      const dist = Math.sqrt(nx * nx + ny * ny);
      const px = (y * w + x) * 4;

      if (dist > 1) {
        d[px] = d[px + 1] = d[px + 2] = d[px + 3] = 0;
        continue;
      }

      const nz = Math.sqrt(Math.max(0, 1 - dist * dist));
      const lx = Math.cos(lightAngle);
      const ly = -0.5;
      const lz = Math.sin(lightAngle);
      const dot = nx * lx + ny * ly + nz * lz;
      const rz = 2 * dot * nz - lz;

      const spec = Math.pow(Math.max(0, rz), 20) * 0.72;
      const fresnel = Math.pow(1 - nz, 3) * 0.32;
      const intensity = Math.min(1, spec + fresnel);

      d[px] = 255;
      d[px + 1] = 255;
      d[px + 2] = 255;
      d[px + 3] = Math.round(intensity * 255);
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/* ── SVG Filter ── */

function LiquidGlassFilter() {
  const dispRef = useRef<SVGFEImageElement>(null);
  const specRef = useRef<SVGFEImageElement>(null);

  useEffect(() => {
    const dispUrl = generateDisplacementMap(400, 120);
    const specUrl = generateSpecularMap(400, 120);
    dispRef.current?.setAttribute("href", dispUrl);
    specRef.current?.setAttribute("href", specUrl);
  }, []);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute h-0 w-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="liquid-glass-filter"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          {/* 1. Glass thickness blur */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blurred" />

          {/* 2. Physics-based displacement (Snell's law) */}
          <feImage
            ref={dispRef}
            href=""
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="dispMap"
          />
          <feDisplacementMap
            in="blurred"
            in2="dispMap"
            scale={12}
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />

          {/* 3. Saturation boost */}
          <feColorMatrix
            in="refracted"
            type="saturate"
            values="1.5"
            result="saturated"
          />

          {/* 4. Specular composite */}
          <feImage
            ref={specRef}
            href=""
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="specMap"
          />
          <feComposite
            in="saturated"
            in2="specMap"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="0.35"
            k4="0"
          />
        </filter>
      </defs>
    </svg>
  );
}

/* ── Header ── */

export function FixedHeader() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <LiquidGlassFilter />
      <header className="fixed inset-x-0 top-0 z-50 bg-white/94 px-4 py-5 backdrop-blur-sm sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4">
          <Link
            href="/"
            className="relative z-10 inline-flex items-center text-[1.02rem] font-semibold tracking-[0.26em] text-[var(--text-primary)] uppercase"
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

          <nav className="hidden flex-1 justify-center lg:flex">
            <div className="liquid-glass-pill flex items-center gap-1 rounded-full bg-[#f3e9d5] px-2 py-2">
              {navItems.map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={reducedMotion ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reducedMotion ? 0 : 0.16 + index * 0.05,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition duration-300 hover:-translate-y-px hover:bg-[var(--brand-1)]/10 hover:text-[var(--brand-1)]"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.28, duration: 0.55 }}
            >
              <Link
                href="/login"
                className="liquid-glass-action inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-[var(--text-muted)] transition duration-300 hover:-translate-y-px hover:bg-[var(--brand-1)]/8 hover:text-[var(--brand-1)] hover:border-[var(--brand-1)]/20"
              >
                로그인
              </Link>
            </motion.div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.34, duration: 0.6 }}
            >
              <Link
                href="/start"
                className="liquid-glass-primary inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-px hover:brightness-110 hover:shadow-[0_20px_48px_rgba(0,56,241,0.3)]"
              >
                시작하기
              </Link>
            </motion.div>
          </div>
        </div>
      </header>
    </>
  );
}
