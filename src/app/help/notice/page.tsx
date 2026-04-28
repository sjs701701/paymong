import { Megaphone } from "lucide-react";

export default function NoticePage() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Megaphone size={20} />
      </span>
      <p className="text-base font-semibold text-slate-800">준비 중이에요</p>
      <p className="text-sm leading-6 text-slate-500">
        공지사항 게시판은 곧 오픈될 예정이에요.
        <br />
        오픈 시 자주하는 질문 또는 알림으로 안내드릴게요.
      </p>
    </div>
  );
}
