"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type CustomScrollAreaProps = {
  children: ReactNode;
  className?: string;
  thumbClassName?: string;
  minThumbHeight?: number;
};

const DEFAULT_THUMB_CLASS = "bg-slate-300 hover:bg-slate-400";

export function CustomScrollArea({
  children,
  className,
  thumbClassName,
  minThumbHeight = 32,
}: CustomScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startY: number;
    startScrollTop: number;
    trackUsable: number;
    maxScroll: number;
    pointerId: number;
  } | null>(null);

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateThumb = useCallback(() => {
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!scrollEl || !trackEl) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    const trackHeight = trackEl.clientHeight;
    const scrollable = scrollHeight > clientHeight + 1;

    setIsScrollable(scrollable);

    if (!scrollable || trackHeight <= 0) {
      setThumbHeight(0);
      setThumbTop(0);
      return;
    }

    const nextThumbHeight = Math.max(
      minThumbHeight,
      (clientHeight / scrollHeight) * trackHeight,
    );
    const maxScroll = scrollHeight - clientHeight;
    const nextThumbTop =
      maxScroll > 0
        ? (scrollTop / maxScroll) * (trackHeight - nextThumbHeight)
        : 0;

    setThumbHeight(nextThumbHeight);
    setThumbTop(nextThumbTop);
  }, [minThumbHeight]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl || !contentEl) return;

    updateThumb();

    const resizeObserver = new ResizeObserver(() => updateThumb());
    resizeObserver.observe(scrollEl);
    resizeObserver.observe(contentEl);

    return () => resizeObserver.disconnect();
  }, [updateThumb]);

  const handleThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    const thumbEl = event.currentTarget;
    if (!scrollEl || !trackEl) return;

    event.preventDefault();
    thumbEl.setPointerCapture(event.pointerId);

    dragStateRef.current = {
      startY: event.clientY,
      startScrollTop: scrollEl.scrollTop,
      trackUsable: trackEl.clientHeight - thumbEl.clientHeight,
      maxScroll: scrollEl.scrollHeight - scrollEl.clientHeight,
      pointerId: event.pointerId,
    };
  };

  const handleThumbPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const scrollEl = scrollRef.current;
    if (!drag || !scrollEl || drag.pointerId !== event.pointerId) return;
    if (drag.trackUsable <= 0 || drag.maxScroll <= 0) return;

    const deltaY = event.clientY - drag.startY;
    const nextScrollTop =
      drag.startScrollTop + (deltaY / drag.trackUsable) * drag.maxScroll;
    scrollEl.scrollTop = Math.max(
      0,
      Math.min(drag.maxScroll, nextScrollTop),
    );
  };

  const handleThumbPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStateRef.current = null;
  };

  return (
    <div className={`relative ${className ?? ""}`.trim()}>
      <div
        ref={scrollRef}
        onScroll={updateThumb}
        className="h-full w-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={contentRef}>{children}</div>
      </div>

      <div
        ref={trackRef}
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-1 right-1 top-1 hidden w-1.5 transition-opacity duration-200 md:block ${
          isScrollable ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          onPointerDown={handleThumbPointerDown}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerEnd}
          onPointerCancel={handleThumbPointerEnd}
          className={`pointer-events-auto absolute inset-x-0 cursor-grab touch-none rounded-full transition-colors active:cursor-grabbing ${
            thumbClassName ?? DEFAULT_THUMB_CLASS
          }`}
          style={{ height: thumbHeight, top: thumbTop }}
        />
      </div>
    </div>
  );
}
