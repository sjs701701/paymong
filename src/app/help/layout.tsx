"use client";

import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import { cn } from "@/lib/utils";

const HELP_TABS = [
  { key: "faq", label: "자주하는 질문", path: "/help/faq" },
  { key: "notice", label: "공지사항", path: "/help/notice" },
  { key: "event", label: "이벤트", path: "/help/event" },
] as const;

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);
  const [tabsHeight, setTabsHeight] = useState(49);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollTopRef = useRef(0);
  const isMobileViewportRef = useRef(false);

  useEffect(() => {
    const headerEl = headerRef.current;
    const tabsEl = tabsRef.current;
    if (!headerEl || !tabsEl) return;
    const measure = () => {
      const nextHeader = headerEl.offsetHeight;
      const nextTabs = tabsEl.offsetHeight;
      setHeaderHeight((current) =>
        current === nextHeader ? current : nextHeader,
      );
      setTabsHeight((current) =>
        current === nextTabs ? current : nextTabs,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(headerEl);
    observer.observe(tabsEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
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

  const handleBack = () => {
    if (
      typeof window !== "undefined" &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      router.back();
      return;
    }
    router.push("/mypage-v2");
  };

  const effectiveHeaderHeight = isHeaderHidden ? 0 : headerHeight;
  const effectiveStickyOffset = effectiveHeaderHeight + tabsHeight;

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-[#eef2fa]"
      style={
        {
          "--help-header-height": `${effectiveHeaderHeight}px`,
          "--help-tabs-height": `${tabsHeight}px`,
          "--help-sticky-offset": `${effectiveStickyOffset}px`,
        } as CSSProperties
      }
    >
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-30 border-b border-slate-200 bg-white",
          "transition-transform duration-200 ease-out",
          isHeaderHidden && "-translate-y-full",
        )}
      >
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-4 py-4 md:px-5">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/paymong-header-logo.svg"
              alt="Paymong"
              width={148}
              height={32}
              priority
              className="h-6 w-auto object-contain sm:h-8"
            />
          </Link>
          <UserMenu />
        </div>
      </header>

      <nav
        ref={tabsRef}
        aria-label="게시판 탭"
        className="sticky top-[var(--help-header-height)] z-20 border-b border-slate-200 bg-white transition-[top] duration-200 ease-out"
      >
        <div className="mx-auto flex w-full max-w-[920px] items-center gap-1 px-2 sm:px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="shrink-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="flex flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {HELP_TABS.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.key}
                  href={tab.path}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative shrink-0 px-3 py-3 text-sm font-semibold transition-colors duration-75",
                    isActive
                      ? "text-[#0038F1]"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {tab.label}
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#0038F1]"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-[920px] flex-1 px-4 pb-4 sm:px-6 sm:pb-5">
        {children}
      </div>
    </main>
  );
}
