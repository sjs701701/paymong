"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STACK_KEY = "paymong:navigation-stack";
const MAX_STACK_LENGTH = 40;

function getSessionStack(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STACK_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is string =>
        typeof value === "string" &&
        value.startsWith("/") &&
        !value.startsWith("//"),
    );
  } catch {
    return [];
  }
}

function setSessionStack(stack: string[]) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      STACK_KEY,
      JSON.stringify(stack.slice(-MAX_STACK_LENGTH)),
    );
  } catch {
    // If storage is unavailable, the button will fall back to its route.
  }
}

function getCurrentPath() {
  if (typeof window === "undefined") return null;
  return `${window.location.pathname}${window.location.search}`;
}

export function getPreviousInternalPath() {
  const currentPath = getCurrentPath();
  if (!currentPath) return null;

  const stack = getSessionStack();
  if (stack.at(-1) !== currentPath) return null;

  return stack.at(-2) ?? null;
}

export function popCurrentInternalPath() {
  const currentPath = getCurrentPath();
  if (!currentPath) return;

  const stack = getSessionStack();
  if (stack.at(-1) === currentPath) {
    setSessionStack(stack.slice(0, -1));
  }
}

export function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const currentPath = getCurrentPath();
    if (!currentPath) return;

    const stack = getSessionStack();
    if (stack.at(-1) === currentPath) return;

    if (stack.at(-2) === currentPath) {
      setSessionStack(stack.slice(0, -1));
      return;
    }

    setSessionStack([...stack, currentPath]);
  }, [pathname]);

  return null;
}
