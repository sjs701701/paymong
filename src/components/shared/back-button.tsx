"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = Omit<
  ComponentPropsWithoutRef<typeof Button>,
  "children" | "onClick"
> & {
  children?: ReactNode;
  fallbackHref?: string;
  onFallback?: () => void;
  iconClassName?: string;
  delayMs?: number;
  onBeforeNavigate?: () => boolean | number | void;
};

export function BackButton({
  children,
  fallbackHref,
  onFallback,
  iconClassName,
  delayMs = 0,
  onBeforeNavigate,
  "aria-label": ariaLabel = "뒤로가기",
  className,
  ...props
}: BackButtonProps) {
  const router = useRouter();

  const navigateBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (onFallback) {
      onFallback();
      return;
    }

    if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  const handleClick = () => {
    const beforeNavigate = onBeforeNavigate?.();
    if (beforeNavigate === false) return;

    const effectiveDelayMs =
      typeof beforeNavigate === "number" ? beforeNavigate : delayMs;

    if (effectiveDelayMs > 0) {
      window.setTimeout(navigateBack, effectiveDelayMs);
      return;
    }

    navigateBack();
  };

  return (
    <Button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={className}
      {...props}
    >
      <ChevronLeft className={cn("h-4 w-4", iconClassName)} />
      {children}
    </Button>
  );
}
