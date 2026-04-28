"use client";

import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pin, Search, X } from "lucide-react";

import { HelpTabs } from "@/components/help/help-tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  NOTICE_ITEMS,
  formatNoticeDate,
  type NoticeItem,
} from "@/data/help-notice";

const PAGE_SIZE = 10;

function getTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, tokens: string[]): ReactNode {
  if (tokens.length === 0) return text;
  const pattern = tokens.map(escapeRegex).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="rounded bg-yellow-200 px-0.5 font-semibold text-slate-900"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function NoticePage() {
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [page, setPage] = useState(1);

  const tokens = useMemo(() => getTokens(committedSearch), [committedSearch]);

  const filtered = useMemo(() => {
    if (tokens.length === 0) return NOTICE_ITEMS;
    return NOTICE_ITEMS.filter((item) => {
      const lower = item.title.toLowerCase();
      return tokens.every((token) => lower.includes(token));
    });
  }, [tokens]);

  const pinned = useMemo(
    () => filtered.filter((item) => item.pinned),
    [filtered],
  );
  const regular = useMemo(
    () => filtered.filter((item) => !item.pinned),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = regular.slice(pageStart, pageStart + PAGE_SIZE);

  const tableRows: NoticeItem[] =
    currentPage === 1 ? [...pinned, ...pageItems] : pageItems;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommittedSearch(search);
    setPage(1);
  };

  const handleClear = () => {
    setSearch("");
    setCommittedSearch("");
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const max = 5;
    if (totalPages <= max) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(max / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  return (
    <div>
      <div
        className="sticky top-[var(--help-header-height)] z-20 bg-[#eef2fa] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: "translateY(var(--help-header-shift))",
        }}
      >
        <nav
          aria-label="게시판 탭"
          className="border-b border-slate-200 bg-white"
        >
          <HelpTabs />
        </nav>

        <div className="mx-auto w-full max-w-[920px] px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <form onSubmit={handleSubmit} className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="notice-search"
              type="text"
              value={search}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
              placeholder="제목으로 검색해보세요"
              className={cn(
                "h-auto rounded-xl border-slate-200 bg-white py-3 pl-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#00abff]",
                search ? "pr-11" : "pr-4",
              )}
            />
            {search ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="검색어 지우기"
                className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100">
                  <X size={14} />
                </span>
              </button>
            ) : null}
          </form>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[920px] space-y-4 px-4 pt-4 sm:px-6">
        {committedSearch.trim() ? (
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              “{committedSearch.trim()}”
            </span>{" "}
            검색 결과 {filtered.length.toLocaleString()}건
          </p>
        ) : null}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white sm:block">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-16 sm:w-20" />
            <col />
            <col className="w-24 sm:w-32" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
              <th scope="col" className="px-3 py-3 text-center sm:px-4">
                번호
              </th>
              <th scope="col" className="px-3 py-3 text-left sm:px-4">
                제목
              </th>
              <th scope="col" className="px-3 py-3 text-center sm:px-4">
                작성일
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-16 text-center text-sm text-slate-500"
                >
                  검색 결과가 없어요. 다른 키워드로 검색해보세요.
                </td>
              </tr>
            ) : (
              tableRows.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors duration-75 last:border-b-0 hover:bg-slate-50",
                    item.pinned && "bg-[#f3f6ff]/60",
                  )}
                >
                  <td className="px-3 py-3.5 text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
                    {item.pinned ? (
                      <span
                        aria-label="고정 공지"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0038F1]/10 text-[#0038F1]"
                      >
                        <Pin size={12} />
                      </span>
                    ) : (
                      item.id
                    )}
                  </td>
                  <td className="px-3 py-3.5 sm:px-4">
                    <Link
                      href={`/help/notice/${item.id}`}
                      className="block w-full truncate text-left text-sm font-medium text-slate-800 hover:text-[#0038F1] hover:underline"
                      title={item.title}
                    >
                      {highlight(item.title, tokens)}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
                    {formatNoticeDate(item.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 sm:hidden">
        {tableRows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
            검색 결과가 없어요. 다른 키워드로 검색해보세요.
          </li>
        ) : (
          tableRows.map((item) => (
            <li
              key={item.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white",
                item.pinned
                  ? "border-[#0145f2] bg-[#0145f2]"
                  : "border-slate-200",
              )}
            >
              <Link
                href={`/help/notice/${item.id}`}
                className={cn(
                  "flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors duration-75 focus-visible:outline-none",
                  item.pinned
                    ? "hover:bg-[#0138c9] focus-visible:bg-[#0138c9]"
                    : "hover:bg-slate-50 focus-visible:bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "line-clamp-2 min-h-[3rem] text-sm font-semibold leading-6",
                    item.pinned
                      ? "text-[#edf1f5]! visited:text-[#edf1f5]!"
                      : "text-slate-900",
                  )}
                >
                  {highlight(item.title, tokens)}
                </p>
                <div
                  className={cn(
                    "mt-auto flex items-center gap-2 border-t pt-2.5 text-xs",
                    item.pinned
                      ? "border-white/25 text-[#edf1f5]"
                      : "border-slate-100 text-slate-500",
                  )}
                >
                  {item.pinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-[#edf1f5]">
                      <Pin size={11} />
                      공지
                    </span>
                  ) : (
                    <span className="font-medium text-slate-400">
                      No. {item.id}
                    </span>
                  )}
                  <span className="ml-auto">
                    {formatNoticeDate(item.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

      {totalPages > 1 ? (
        <nav
          aria-label="페이지"
          className="flex items-center justify-center gap-1 pt-2"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          {pageNumbers.map((num) => {
            const isActive = num === currentPage;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-[#0038F1] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {num}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      ) : null}
      </div>
    </div>
  );
}
