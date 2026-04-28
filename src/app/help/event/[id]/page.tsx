import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { List } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  EVENT_ITEMS,
  EVENT_STATUS_LABEL,
  formatEventPeriod,
  type EventContentBlock,
} from "@/data/help-event";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

function EventStatusBadge({
  status,
}: {
  status: (typeof EVENT_ITEMS)[number]["status"];
}) {
  return (
    <Badge
      className={cn(
        "h-auto rounded-full px-2.5 py-1 text-[11px] font-bold",
        status === "ongoing"
          ? "bg-[#0038F1] text-white"
          : "bg-slate-200 text-slate-600",
      )}
    >
      {EVENT_STATUS_LABEL[status]}
    </Badge>
  );
}

function renderBlock(block: EventContentBlock, index: number) {
  if (block.type === "image") {
    return (
      <figure key={index} className="my-6 first:mt-0 last:mb-0">
        <Image
          src={block.src}
          alt={block.alt}
          width={1280}
          height={560}
          className="block w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
        />
        {block.caption ? (
          <figcaption className="mt-2 text-center text-xs text-slate-500">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <p
      key={index}
      className="whitespace-pre-line text-sm leading-7 text-slate-700"
    >
      {block.value}
    </p>
  );
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const event = EVENT_ITEMS.find((item) => item.id === numericId);
  if (!event) notFound();

  const currentIndex = EVENT_ITEMS.findIndex((item) => item.id === event.id);
  const newer = currentIndex > 0 ? EVENT_ITEMS[currentIndex - 1] : null;
  const older =
    currentIndex >= 0 && currentIndex < EVENT_ITEMS.length - 1
      ? EVENT_ITEMS[currentIndex + 1]
      : null;

  return (
    <article className="flex min-h-[calc(100dvh-200px)] flex-col pt-4 sm:min-h-[calc(100dvh-220px)] sm:pt-5">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="space-y-3 border-b border-slate-200 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <EventStatusBadge status={event.status} />
            <span aria-hidden className="text-slate-300">
              ·
            </span>
            <span>{formatEventPeriod(event)}</span>
          </div>
          <h1 className="text-lg font-bold leading-7 text-slate-900 sm:text-xl">
            {event.title}
          </h1>
        </header>

        <div className="flex-1 space-y-4 px-5 py-6 sm:min-h-[320px] sm:px-6 sm:py-8">
          {event.content.length === 0 ? (
            <p className="text-sm text-slate-500">이벤트 내용이 없습니다.</p>
          ) : (
            event.content.map((block, index) => renderBlock(block, index))
          )}
        </div>

        <nav
          aria-label="이전/다음 이벤트"
          className="divide-y divide-slate-100 border-t border-slate-200 text-sm"
        >
          {newer ? (
            <Link
              href={`/help/event/${newer.id}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 sm:px-6"
            >
              <span className="shrink-0 text-xs font-semibold text-slate-400">
                다음 글
              </span>
              <span className="truncate text-slate-700">{newer.title}</span>
            </Link>
          ) : null}
          {older ? (
            <Link
              href={`/help/event/${older.id}`}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 sm:px-6"
            >
              <span className="shrink-0 text-xs font-semibold text-slate-400">
                이전 글
              </span>
              <span className="truncate text-slate-700">{older.title}</span>
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="flex justify-center pt-6 sm:pt-8">
        <Link
          href="/help/event"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0145f2] px-7 py-3.5 text-[15px] font-bold text-white! shadow-[0_10px_24px_rgba(1,69,242,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0138c9] hover:text-white! hover:shadow-[0_14px_28px_rgba(1,69,242,0.34)] visited:text-white!"
        >
          <List size={18} strokeWidth={2.5} />
          목록으로
        </Link>
      </div>
    </article>
  );
}
