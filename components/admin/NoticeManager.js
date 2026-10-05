"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  createNoticeAction,
  updateNoticeAction,
  setNoticePinnedAction,
  deleteNoticeAction,
} from "@/server-action/admin/notice.action";

const TITLE_MAX = 100;
const CONTENT_MAX = 10000;
const EMPTY = { title: "", content: "", pinned: false };

const fmtDate = (iso) =>
  iso ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric" }).format(new Date(iso)) : "";

export default function NoticeManager({ notices }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState(null); // null = 새 공지
  const [form, setForm] = useState(EMPTY);

  function run(action, { onOk } = {}) {
    startTransition(async () => {
      const res = await action();
      if (res?.result) {
        toast.success(res.message);
        onOk?.();
        router.refresh();
      } else {
        toast.error(res?.message ?? "실패했습니다.");
      }
    });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
  }

  function onSubmit(e) {
    e.preventDefault();
    const payload = { title: form.title, content: form.content };
    run(
      () => (editingId ? updateNoticeAction({ noticeId: editingId, ...payload }) : createNoticeAction({ ...payload, pinned: form.pinned })),
      { onOk: reset }
    );
  }

  function startEdit(n) {
    setEditingId(n._id);
    setForm({ title: n.title, content: n.content, pinned: n.pinned });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(n) {
    if (!window.confirm(`"${n.title}" 공지를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    run(() => deleteNoticeAction({ noticeId: n._id }), { onOk: () => editingId === n._id && reset() });
  }

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />
      <h1 className="text-2xl font-bold">공지사항</h1>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{editingId ? "공지 수정" : "새 공지"}</h2>
          {editingId && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
              취소
            </button>
          )}
        </div>
        <input
          className="input input-bordered w-full"
          placeholder="제목"
          maxLength={TITLE_MAX}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="textarea textarea-bordered w-full min-h-[200px] text-base"
          placeholder="내용 (줄바꿈이 그대로 보입니다)"
          maxLength={CONTENT_MAX}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="flex flex-wrap items-center gap-3">
          {!editingId && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />
              맨 위에 고정
            </label>
          )}
          <span className="text-xs text-slate-400">
            {form.content.length.toLocaleString()} / {CONTENT_MAX.toLocaleString()}자
          </span>
          <button type="submit" disabled={pending} className="btn btn-sm ml-auto bg-slate-900 text-white hover:bg-slate-700">
            {editingId ? "수정 저장" : "등록"}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white">
        {notices.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">등록된 공지가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notices.map((n) => (
              <li key={n._id} className={`flex flex-wrap items-center gap-2 p-3 ${editingId === n._id ? "bg-amber-50" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {n.pinned && <span className="badge badge-sm border-0 bg-orange-100 text-orange-700">📌 고정</span>}
                    <span className="truncate font-medium">{n.title}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {fmtDate(n.createdAt)}
                    {n.updatedAt && n.updatedAt !== n.createdAt && ` · 수정 ${fmtDate(n.updatedAt)}`}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={pending}
                    className="btn btn-xs btn-ghost"
                    onClick={() => run(() => setNoticePinnedAction({ noticeId: n._id, pinned: !n.pinned }))}
                  >
                    {n.pinned ? "고정 해제" : "고정"}
                  </button>
                  <button type="button" disabled={pending} className="btn btn-xs btn-ghost" onClick={() => startEdit(n)}>
                    수정
                  </button>
                  <button type="button" disabled={pending} className="btn btn-xs btn-ghost text-red-600" onClick={() => onDelete(n)}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
