"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FixedHeader } from "@/components/landing/fixed-header";
import { HeroStory } from "@/components/landing/hero-story";
import { LenisProvider } from "@/lib/lenis-provider";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

export function LandingShell() {
  const reducedMotion = useHydratedReducedMotion();
  const [isHeaderAutoHideEnabled, setIsHeaderAutoHideEnabled] = useState(false);

  return (
    <LenisProvider>
      <main className="main-page-font relative isolate min-h-screen overflow-x-clip">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <FixedHeader autoHideEnabled={isHeaderAutoHideEnabled} />
        </motion.div>
        <HeroStory onLastKeywordStateChange={setIsHeaderAutoHideEnabled} />
      </main>
    </LenisProvider>
  );
}
