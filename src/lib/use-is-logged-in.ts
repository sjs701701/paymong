"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "paymong-auth";
const CHANGE_EVENT = "paymong-auth-change";

function readFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Lightweight client-side login flag backed by localStorage.
 *
 * NOTE(paymong-auth): This is a stand-in for the real auth integration.
 * `LoginScreen`'s OTP success path calls `setLoggedIn(true)` and `UserMenu`'s
 * logout calls `setLoggedIn(false)`. Replace with the real session/cookie
 * mechanism when the auth backend is ready.
 */
export function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedInState] = useState(false);

  useEffect(() => {
    const sync = () => setIsLoggedInState(readFlag());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  return isLoggedIn;
}

export function setLoggedIn(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}
