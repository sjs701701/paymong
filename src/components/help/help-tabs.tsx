"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BackButton } from "@/components/shared/back-button";
import { cn } from "@/lib/utils";

const HELP_TABS = [
  { key: "faq", label: "자주하는 질문", path: "/help/faq" },
  { key: "notice", label: "공지사항", path: "/help/notice" },
  { key: "event", label: "이벤트", path: "/help/event" },
] as const;

export function HelpTabs() {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-[920px] items-center gap-1 px-2 sm:px-4">
      <BackButton
        variant="ghost"
        size="icon-sm"
        fallbackHref="/mypage-v2"
        className="shrink-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      />
      <div className="flex flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HELP_TABS.map((tab) => {
          const isActive =
            pathname === tab.path || pathname.startsWith(`${tab.path}/`);
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
  );
}
