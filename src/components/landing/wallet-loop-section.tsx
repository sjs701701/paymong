"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDashed, Cpu, Database, Globe, Layers, Search, Shield, Zap, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";

type NetworkItem = {
  name: string;
  Icon: LucideIcon;
  iconClassName: string;
  surfaceClassName: string;
};

const NETWORK_DATA: NetworkItem[] = [
  { name: "Ethereum", Icon: Globe, iconClassName: "text-blue-400", surfaceClassName: "bg-blue-500/10" },
  { name: "Solana", Icon: Zap, iconClassName: "text-purple-400", surfaceClassName: "bg-purple-500/10" },
  { name: "Polygon", Icon: Layers, iconClassName: "text-indigo-400", surfaceClassName: "bg-indigo-500/10" },
  { name: "Bitcoin", Icon: Database, iconClassName: "text-yellow-400", surfaceClassName: "bg-yellow-500/10" },
  { name: "Arbitrum", Icon: Shield, iconClassName: "text-cyan-400", surfaceClassName: "bg-cyan-500/10" },
  { name: "Optimism", Icon: Zap, iconClassName: "text-red-400", surfaceClassName: "bg-red-500/10" },
  { name: "Avalanche", Icon: Cpu, iconClassName: "text-red-500", surfaceClassName: "bg-red-600/10" },
  { name: "Base", Icon: CircleDashed, iconClassName: "text-blue-600", surfaceClassName: "bg-blue-700/10" },
  { name: "Cosmos", Icon: Globe, iconClassName: "text-emerald-400", surfaceClassName: "bg-emerald-500/10" },
];

const ITEM_SPACING = 140;
const CARD_STAGE_HEIGHT = 500;
const AUTO_ROTATE_SPEED = 0.5;
const SCROLL_MULTIPLIER = 1.2;
const LOOP_HEIGHT = NETWORK_DATA.length * ITEM_SPACING;
const CARD_CENTER = CARD_STAGE_HEIGHT / 2;

export function WalletLoopSection() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [autoRotateOffset, setAutoRotateOffset] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const commitScroll = () => {
      frameId = 0;

      const section = sectionRef.current;
      if (!section) return;

      const nextProgress = window.scrollY - section.offsetTop;
      setScrollProgress((current) => (current === nextProgress ? current : nextProgress));
    };

    const requestCommit = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(commitScroll);
    };

    requestCommit();
    window.addEventListener("scroll", requestCommit, { passive: true });
    window.addEventListener("resize", requestCommit);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestCommit);
      window.removeEventListener("resize", requestCommit);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let frameId = 0;

    const animate = () => {
      setAutoRotateOffset((current) => {
        const nextOffset = current + AUTO_ROTATE_SPEED;
        return nextOffset >= LOOP_HEIGHT ? nextOffset - LOOP_HEIGHT : nextOffset;
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [reducedMotion]);

  const currentOffset = scrollProgress * SCROLL_MULTIPLIER + (reducedMotion ? 0 : autoRotateOffset);

  return (
    <section
      id="section3"
      ref={sectionRef}
      className="relative z-40 h-svh w-full overflow-hidden bg-white px-6 py-12 text-slate-900 sm:px-10 lg:px-24"
    >
      <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-20">
        <div className="z-10 max-w-xl space-y-8">
          <h2 className="text-5xl font-bold leading-[0.94] tracking-[-0.08em] text-slate-900 sm:text-6xl lg:text-7xl">
            2,500+ chains.
            <br />
            One wallet.
          </h2>
          <p className="max-w-lg text-lg font-light leading-relaxed text-slate-500 sm:text-xl">
            Ctrl Wallet supports millions of assets and NFTs on 2,500+ blockchains.
          </p>
          <div className="group relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" size={20} />
            <input
              type="text"
              placeholder="Search assets or chains..."
              className="w-full rounded-[1.35rem] border-2 border-transparent bg-slate-100 py-4 pl-12 pr-4 text-lg text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center" style={{ perspective: "1000px" }}>
          <div className="relative flex h-[500px] w-full max-w-md items-center justify-center overflow-visible">
            {NETWORK_DATA.map((item, index) => {
              const basePos = index * ITEM_SPACING;
              let yOffset = (basePos - currentOffset) % LOOP_HEIGHT;

              if (yOffset < 0) {
                yOffset += LOOP_HEIGHT;
              }

              yOffset -= (LOOP_HEIGHT / 2) - CARD_CENTER;

              const distanceFromCenter = Math.abs(yOffset - CARD_CENTER);
              const opacity = Math.max(0, 1 - (distanceFromCenter / 300));
              const scale = Math.max(0.6, 1 - (distanceFromCenter / 800));
              const rotateX = (yOffset - CARD_CENTER) / 10;

              return (
                <div
                  key={item.name}
                  className="absolute flex w-full cursor-pointer items-center gap-4 rounded-[1.45rem] border border-slate-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
                  style={{
                    transform: `translateY(${yOffset - CARD_CENTER}px) scale(${scale}) rotateX(${rotateX}deg)`,
                    opacity,
                    zIndex: Math.round(100 - distanceFromCenter),
                  }}
                >
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${item.surfaceClassName}`}>
                    <item.Icon className={item.iconClassName} size={22} />
                  </div>
                  <span className="text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
