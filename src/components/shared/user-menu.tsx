"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  FilePlus,
  Gift,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Newspaper,
  Receipt,
  Sparkles,
  UserRoundCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
      <path d="m16.64 9.19 2.88 1.62c.86.48.86 1.9 0 2.38l-2.88 1.62L14.34 12l2.3-2.81Z" fill="#FF3D00" />
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

type UserMenuItemKey =
  | "faq"
  | "notice"
  | "event"
  | "magazine"
  | "guide"
  | "review"
  | "mileage"
  | "contracts"
  | "contract-register"
  | "tax"
  | "sns-login";

const USER_MENU_SECTIONS: Array<{
  title: string;
  items: Array<{
    key: UserMenuItemKey;
    label: string;
    icon: typeof CircleHelp;
  }>;
}> = [
  {
    title: "계약 · 정산",
    items: [
      { key: "contracts", label: "계약리스트", icon: ClipboardList },
      { key: "contract-register", label: "계약등록하기", icon: FilePlus },
      { key: "mileage", label: "마일리지샵", icon: Sparkles },
      { key: "tax", label: "세금계산서/부가세 신고", icon: Receipt },
    ],
  },
  {
    title: "게시판",
    items: [
      { key: "faq", label: "자주하는 질문", icon: CircleHelp },
      { key: "notice", label: "공지사항", icon: Megaphone },
      { key: "event", label: "이벤트", icon: Gift },
      { key: "magazine", label: "페이몽 매거진", icon: Newspaper },
      { key: "guide", label: "이용가이드", icon: BookOpen },
      { key: "review", label: "이용후기", icon: MessageCircle },
    ],
  },
  {
    title: "계정",
    items: [
      { key: "sns-login", label: "sns 간편로그인 연결", icon: UserRoundCheck },
    ],
  },
];

type UserMenuProps = {
  trigger?: "badge" | "icon";
  className?: string;
};

export function UserMenu({ trigger = "badge", className }: UserMenuProps = {}) {
  return (
    <Suspense
      fallback={
        <UserMenuTriggerFallback trigger={trigger} className={className} />
      }
    >
      <UserMenuInner trigger={trigger} className={className} />
    </Suspense>
  );
}

function UserMenuTriggerFallback({
  trigger,
  className,
}: UserMenuProps & { trigger: NonNullable<UserMenuProps["trigger"]> }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm",
        trigger === "icon"
          ? "h-9 w-9 overflow-hidden rounded-full text-transparent"
          : "h-9 min-w-28 gap-2 rounded-xl px-4 sm:h-10 sm:min-w-32 sm:px-5",
        className,
      )}
    >
      <span>홍길동 님</span>
    </div>
  );
}

function UserMenuInner({
  trigger,
  className,
}: UserMenuProps & { trigger: NonNullable<UserMenuProps["trigger"]> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [prepLabel, setPrepLabel] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const isOnContractsPage = pathname === "/mypage-v2";
  const isOnContractListHome =
    isOnContractsPage && searchParams.toString() === "";
  const isOnContractRegister = pathname === "/contracts/new";
  const isOnFaq = pathname === "/help/faq";

  const closeMenu = useCallback(
    (onAfterClose?: () => void) => {
      if (isExiting) return;
      const isMobile =
        typeof window !== "undefined" &&
        !window.matchMedia("(min-width: 640px)").matches;
      if (!isMobile) {
        setIsOpen(false);
        onAfterClose?.();
        return;
      }
      setIsExiting(true);
      window.setTimeout(() => {
        setIsOpen(false);
        setIsExiting(false);
        onAfterClose?.();
      }, 200);
    },
    [isExiting],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !userMenuRef.current?.contains(target) &&
        !menuPanelRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  const handleMenuItemClick = (item: {
    key: UserMenuItemKey;
    label: string;
  }) => {
    closeMenu(() => {
      if (item.key === "contracts") {
        if (!isOnContractListHome) {
          router.push("/mypage-v2");
        }
        return;
      }
      if (item.key === "contract-register") {
        if (!isOnContractRegister) {
          router.push("/contracts/new");
        }
        return;
      }
      if (item.key === "faq") {
        if (!isOnFaq) {
          router.push("/help/faq");
        }
        return;
      }
      setPrepLabel(item.label);
    });
  };

  const handleAppDownloadClick = (label: string) => {
    setIsAppDownloadOpen(false);
    closeMenu(() => setPrepLabel(label));
  };

  const handleLogout = () => {
    closeMenu(() => router.push("/login"));
  };

  return (
    <>
      <div ref={userMenuRef} className={cn("relative", className)}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="사용자 메뉴 열기"
          onClick={() => (isOpen ? closeMenu() : setIsOpen(true))}
          className={cn(
            "inline-flex items-center justify-center border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50",
            trigger === "icon"
              ? "h-9 w-9 rounded-full [&>span:first-child]:hidden"
              : "h-9 min-w-28 gap-2 rounded-xl px-4 sm:h-10 sm:min-w-32 sm:px-5",
          )}
        >
          <span>홍길동 님</span>
          <span
            aria-hidden
            className="relative flex h-4 w-4 items-center justify-center"
          >
            <Menu
              size={16}
              strokeWidth={2.25}
              className={cn(
                "absolute text-slate-700 transition-all duration-200 ease-out",
                isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
              )}
            />
            <X
              size={16}
              strokeWidth={2.25}
              className={cn(
                "absolute text-slate-700 transition-all duration-200 ease-out",
                isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
              )}
            />
          </span>
        </button>

        {isOpen && typeof document !== "undefined"
          ? createPortal(
              <>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  onClick={() => closeMenu()}
                  className="fixed inset-0 z-[90] hidden cursor-default bg-slate-950/10 sm:block"
                />
                <div
                  ref={menuPanelRef}
                  role="menu"
                  className={cn(
                    "fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-white duration-200 ease-out sm:inset-auto sm:right-5 sm:top-20 sm:h-auto sm:w-[min(calc(100vw-2rem),22rem)] sm:rounded-[1.75rem] sm:border sm:border-slate-200 sm:shadow-[0_24px_70px_rgba(15,23,42,0.18)]",
                    isExiting
                      ? "animate-out slide-out-to-right fill-mode-forwards sm:fade-out-0 sm:slide-out-to-right-0 sm:slide-out-to-top-2"
                      : "animate-in slide-in-from-right sm:fade-in-0 sm:slide-in-from-right-0 sm:slide-in-from-top-2",
                  )}
                >
                  <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)] sm:flex-none sm:overflow-visible sm:pb-0">
                    <div className="p-3">
                      <div className="mb-2 flex items-center justify-between sm:hidden">
                        <button
                          type="button"
                          aria-label="메인 페이지로 이동"
                          onClick={() =>
                            closeMenu(() => router.push("/"))
                          }
                          className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0038F1]/40"
                        >
                          <Image
                            src="/brand/paymong-header-logo.svg"
                            alt="Paymong"
                            width={148}
                            height={32}
                            priority
                            className="h-6 w-auto object-contain"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => closeMenu()}
                          aria-label="메뉴 닫기"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors duration-75 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <ChevronRight size={22} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-4">
                        <p className="text-base font-bold text-slate-950">
                          홍길동
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          010-1234-5678
                        </p>
                      </div>

                      <div className="mt-3 space-y-4 sm:space-y-2.5">
                        {USER_MENU_SECTIONS.map((section, sectionIndex) => (
                          <div key={section.title}>
                            <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:pb-1">
                              {section.title}
                            </p>
                            <div className="space-y-0.5">
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                const isCurrent =
                                  (item.key === "contracts" &&
                                    isOnContractsPage) ||
                                  (item.key === "contract-register" &&
                                    isOnContractRegister) ||
                                  (item.key === "faq" && isOnFaq);
                                return (
                                  <button
                                    key={item.key}
                                    type="button"
                                    role="menuitem"
                                    aria-current={
                                      isCurrent ? "page" : undefined
                                    }
                                    onClick={() => handleMenuItemClick(item)}
                                    className={cn(
                                      "flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-semibold focus-visible:outline-none sm:py-2",
                                      isCurrent
                                        ? "bg-[#0038F1]/10 text-[#0038F1]"
                                        : "text-slate-800 hover:bg-slate-100 focus-visible:bg-slate-100",
                                    )}
                                  >
                                    <Icon
                                      size={18}
                                      className={cn(
                                        "shrink-0",
                                        isCurrent
                                          ? "text-[#0038F1]"
                                          : "text-slate-700",
                                      )}
                                    />
                                    <span className="min-w-0 flex-1">
                                      {item.label}
                                    </span>
                                    {isCurrent ? (
                                      <span className="text-[11px] font-semibold text-[#0038F1]">
                                        현재
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                            {sectionIndex < USER_MENU_SECTIONS.length - 1 ? (
                              <div className="mt-3 border-t border-slate-100" />
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <Collapsible
                          open={isAppDownloadOpen}
                          onOpenChange={setIsAppDownloadOpen}
                        >
                          <CollapsibleTrigger
                            render={
                              <button
                                type="button"
                                className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none sm:py-2"
                              />
                            }
                          >
                            <Download
                              size={18}
                              className="shrink-0 text-slate-700"
                            />
                            <span className="min-w-0 flex-1">앱 다운로드</span>
                            <ChevronDown
                              size={16}
                              className={cn(
                                "shrink-0 text-slate-400 transition-transform duration-200",
                                isAppDownloadOpen && "rotate-180",
                              )}
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-2 px-1 pt-2 pb-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAppDownloadClick("Android 앱 다운로드")
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                              >
                                <GooglePlayLogo className="h-4 w-4 shrink-0" />
                                Android
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAppDownloadClick("iOS 앱 다운로드")
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                              >
                                <AppleLogo className="h-4 w-4 shrink-0 text-slate-950" />
                                Apple
                              </button>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="mt-0.5 flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 focus-visible:bg-rose-50 focus-visible:outline-none sm:py-2"
                        >
                          <LogOut size={18} className="shrink-0 text-rose-500" />
                          <span className="min-w-0 flex-1">로그아웃</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>,
              document.body,
            )
          : null}
      </div>

      <Dialog
        open={prepLabel != null}
        onOpenChange={(open) => {
          if (!open) setPrepLabel(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]">
              <Sparkles size={18} />
            </div>
            <DialogTitle>{prepLabel ?? "준비 중"}</DialogTitle>
            <DialogDescription>
              해당 기능은 현재 준비 중이에요. 오픈되면 빠르게 알려드릴게요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              size="lg"
              onClick={() => setPrepLabel(null)}
              className="h-auto rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0]"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
