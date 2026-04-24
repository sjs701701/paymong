"use client";

import Image from "next/image";
import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { UserMenu } from "./user-menu";

type DashboardHeaderProps = ComponentPropsWithoutRef<"header"> & {
  hidden?: boolean;
  innerClassName?: string;
  logoClassName?: string;
};

export const DashboardHeader = forwardRef<HTMLElement, DashboardHeaderProps>(
  function DashboardHeader(
    {
      hidden = false,
      className,
      innerClassName,
      logoClassName,
      ...props
    },
    ref,
  ) {
    return (
      <header
        ref={ref}
        className={cn(
          "absolute inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-sm md:px-5",
          "transition-transform duration-200 ease-out",
          hidden && "-translate-y-full",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between gap-4",
            innerClassName,
          )}
        >
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/paymong-header-logo.svg"
              alt="Paymong"
              width={148}
              height={32}
              priority
              className={cn("h-6 w-auto object-contain sm:h-8", logoClassName)}
            />
          </Link>

          <UserMenu />
        </div>
      </header>
    );
  },
);
