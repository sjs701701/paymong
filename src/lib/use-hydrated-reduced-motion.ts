"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const hasHydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  return hasHydrated ? Boolean(prefersReducedMotion) : false;
}
