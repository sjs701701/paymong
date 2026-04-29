"use client";

import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { HelpTabs } from "@/components/help/help-tabs";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { cn } from "@/lib/utils";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFaqPage = pathname === "/help/faq";
  const pageHandlesTabs = isFaqPage || pathname === "/help/notice";
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const isMobileViewportRef = useRef(false);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const measure = () => {
      const nextHeader = headerEl.offsetHeight;
      setHeaderHeight((current) =>
        current === nextHeader ? current : nextHeader,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 749px)");
    const syncViewport = () => {
      isMobileViewportRef.current = mobileQuery.matches;
      if (!mobileQuery.matches) {
        setIsHeaderHidden((current) => (current ? false : current));
      }
    };
    syncViewport();
    mobileQuery.addEventListener("change", syncViewport);
    return () => mobileQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!isMobileViewportRef.current) {
        setIsHeaderHidden((current) => (current ? false : current));
        return;
      }

      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
      );
      const maxScrollTop = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      const safeScrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
      const prev = lastScrollTopRef.current;
      const delta = safeScrollTop - prev;
      lastScrollTopRef.current = safeScrollTop;

      if (safeScrollTop < 40) {
        setIsHeaderHidden((current) => (current ? false : current));
        return;
      }
      if (Math.abs(delta) < 6) return;

      const bottomDistance = maxScrollTop - safeScrollTop;
      const previousBottomDistance = maxScrollTop - prev;
      if (
        delta < 0 &&
        bottomDistance < 24 &&
        previousBottomDistance < 24
      ) {
        return;
      }

      const shouldHideHeader = delta > 0;
      setIsHeaderHidden((current) =>
        current === shouldHideHeader ? current : shouldHideHeader,
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset hidden state when route changes (so new page starts with header visible)
  useEffect(() => {
    lastScrollTopRef.current = 0;
    const frame = window.requestAnimationFrame(() => {
      setIsHeaderHidden(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const headerShift = isHeaderHidden ? -headerHeight : 0;
  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-[#eef2fa]"
      style={
        {
          "--help-header-height": `${headerHeight}px`,
          "--help-header-shift": `${headerShift}px`,
        } as CSSProperties
      }
    >
      <DashboardHeader
        ref={headerRef}
        hidden={isHeaderHidden}
        className="sticky z-30 px-0 md:px-0"
        innerClassName="mx-auto max-w-[920px] px-4 sm:px-6"
      />

      {!pageHandlesTabs ? (
        <nav
          aria-label="게시판 탭"
          className="sticky top-[var(--help-header-height)] z-20 border-b border-slate-200 bg-white transition-transform duration-200 ease-out will-change-transform"
          style={{
            transform: "translateY(var(--help-header-shift))",
          }}
        >
          <HelpTabs />
        </nav>
      ) : null}

      <div
        className={cn(
          "w-full flex-1 pb-4 sm:pb-5",
          !pageHandlesTabs && "mx-auto max-w-[920px] px-4 sm:px-6",
        )}
      >
        {children}
      </div>
    </main>
  );
}
