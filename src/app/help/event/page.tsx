"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  EVENT_ITEMS,
  EVENT_STATUS_LABEL,
  formatEventPeriod,
  type EventItem,
} from "@/data/help-event";

const PAGE_SIZE = 6;

function EventStatusBadge({ status }: { status: EventItem["status"] }) {
  return (
    <Badge
      className={cn(
        "h-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
        status === "ongoing"
          ? "bg-[#0038F1] text-white"
          : "bg-slate-200 text-slate-600",
      )}
    >
      {EVENT_STATUS_LABEL[status]}
    </Badge>
  );
}

export default function EventPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isEndedDialogOpen, setIsEndedDialogOpen] = useState(false);
  const [endedEventTitle, setEndedEventTitle] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleEvents = useMemo(
    () => EVENT_ITEMS.slice(0, visibleCount),
    [visibleCount],
  );
  const hasMore = visibleCount < EVENT_ITEMS.length;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((current) =>
          Math.min(EVENT_ITEMS.length, current + PAGE_SIZE),
        );
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="space-y-4 pt-4 sm:pt-5">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleEvents.map((event) => {
          const isEnded = event.status === "ended";
          const cardContent = (
            <>
              <div className="relative aspect-[16/7] overflow-hidden bg-slate-100">
                <Image
                  src={event.thumbnail}
                  alt={event.thumbnailAlt}
                  fill
                  sizes="(min-width: 640px) 440px, 100vw"
                  className={cn(
                    "object-cover transition-transform duration-300 group-hover:scale-[1.03]",
                    isEnded && "grayscale opacity-60",
                  )}
                />
                <span className="absolute right-3 top-3">
                  <EventStatusBadge status={event.status} />
                </span>
              </div>

              <div className="space-y-3 px-4 py-4">
                <p
                  className={cn(
                    "truncate text-xs font-medium",
                    isEnded ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {formatEventPeriod(event)}
                </p>
                <h2
                  className={cn(
                    "line-clamp-2 min-h-[3rem] text-base font-bold leading-6 tracking-[-0.01em]",
                    isEnded ? "text-slate-500" : "text-slate-900",
                  )}
                >
                  {event.title}
                </h2>
              </div>
            </>
          );

          return (
            <li key={event.id}>
              {isEnded ? (
                <button
                  type="button"
                  onClick={() => {
                    setEndedEventTitle(event.title);
                    setIsEndedDialogOpen(true);
                  }}
                  className="group block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left opacity-85 transition duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00abff]"
                >
                  {cardContent}
                </button>
              ) : (
                <Link
                  href={`/help/event/${event.id}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00abff]"
                >
                  {cardContent}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex h-16 items-center justify-center text-xs text-slate-400"
        >
          이벤트를 불러오는 중
        </div>
      ) : null}

      <Dialog
        open={isEndedDialogOpen}
        onOpenChange={setIsEndedDialogOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>종료된 이벤트입니다</DialogTitle>
            <DialogDescription>
              선택하신 이벤트는 종료되어 상세 내용을 확인할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <p className="min-h-11 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {endedEventTitle}
          </p>
          <DialogFooter>
            <Button
              type="button"
              size="lg"
              onClick={() => setIsEndedDialogOpen(false)}
              className="h-auto w-full rounded-xl bg-[#0038F1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002fd0]"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
