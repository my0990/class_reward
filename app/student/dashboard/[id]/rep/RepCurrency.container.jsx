"use client";
// 학생 대표: 친구를 골라 화폐 지급·회수를 '신청'한다. 선생님이 승인 센터에서 승인하면 반영된다.
// - 자기 자신은 목록에 없다 / 금액 한도 없음
// - 아래 '내 신청'에서 대기·승인·반려를 보고, 대기 중이면 취소할 수 있다
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import LoadError from "@/components/ui/common/LoadError";
import { profileImgProps } from "@/util/image/profileImage";
import { formatHistoryDateParts } from "@/app/teacher/dashboard/[id]/manage/utils/historyDate";
import {
  listRepClassmates,
  createCurrencyRequest,
  listMyCurrencyRequests,
  cancelMyCurrencyRequest,
} from "@/server-action/actions/request/repCurrency.action";

const STATUS = {
  pending: { label: "기다리는 중", cls: "bg-amber-100 text-amber-800" },
  approved: { label: "승인", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "반려", cls: "bg-rose-100 text-rose-700" },
  canceled: { label: "취소함", cls: "bg-gray-100 text-gray-500" },
};

export default function RepCurrencyContainer() {
  const { id: classId } = useParams();
  const { data: classData } = useFetchData(classId ? `/api/classData/${classId}` : null);
  const currency = classData?.currencyName || "화폐";
  const emoji = classData?.currencyEmoji ?? "";

  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);
  const [mine, setMine] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [isSend, setIsSend] = useState(true);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState(""); // 신청 이유 (선택)
  const [busy, setBusy] = useState(false);

  const loadMine = useCallback(async () => {
    const r = await listMyCurrencyRequests();
    if (r?.result) setMine(r.data.groups);
  }, []);

  useEffect(() => {
    listRepClassmates().then((r) => {
      if (!r?.result) {
        setError(r?.message || "불러오지 못했어요.");
        return;
      }
      setStudents(r.data.students);
    });
    loadMine();
  }, [loadMine]);

  const toggle = (userId) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  const allOn = students?.length > 0 && selected.size === students.length;

  const selectedLabels = useMemo(
    () => (students ?? []).filter((s) => selected.has(s.userId)).map((s) => `${s.classNumber}번 ${s.profileNickname || s.userId}`),
    [students, selected]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const n = Number(amount);
    if (!Number.isInteger(n) || n < 1) return toast.error("금액을 1 이상의 숫자로 입력해 주세요.");
    if (selected.size === 0) return toast.error("친구를 골라 주세요.");
    setBusy(true);
    const r = await createCurrencyRequest({ targetUserIds: [...selected], amount: n, isSend, memo });
    setBusy(false);
    if (!r?.result) return toast.error(r?.message || "신청하지 못했어요.");
    toast.success(`${r.data.count}명에게 ${isSend ? "지급" : "회수"} 신청했어요. 선생님이 확인하면 반영돼요.`);
    setSelected(new Set());
    setAmount("");
    setMemo("");
    loadMine();
  };

  const cancel = async (batchId) => {
    if (!window.confirm("이 신청을 취소할까요?")) return;
    const r = await cancelMyCurrencyRequest({ batchId });
    if (!r?.result) toast.error(r?.message || "취소하지 못했어요.");
    else toast.success("취소했어요.");
    loadMine();
  };

  if (error) return <LoadError message={error} onRetry={() => window.location.reload()} />;
  if (!students) return <div className="p-6 text-center text-gray-500">불러오는 중...</div>;

  return (
    <div className="mx-auto max-w-[900px] space-y-5 p-4">
      <div>
        <h1 className="text-2xl font-bold">⭐ 화폐 신청</h1>
        <p className="mt-1 text-gray-600">
          학생 대표만 쓸 수 있어요. 친구를 골라 신청하면 <b>선생님이 확인한 뒤에</b> {currency}이(가) 오가요.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-orange-50 p-4">
        {/* 지급 / 회수 */}
        <div className="inline-flex rounded-xl bg-white p-1" role="radiogroup" aria-label="지급 또는 회수">
          {[
            [true, "주기", "bg-emerald-500"],
            [false, "가져가기", "bg-rose-500"],
          ].map(([v, label, on]) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={isSend === v}
              onClick={() => setIsSend(v)}
              className={`rounded-lg px-5 py-2 font-semibold ${isSend === v ? `${on} text-white` : "text-gray-600"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 친구 고르기 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">친구 고르기 {selected.size > 0 && <span className="text-orange-600">({selected.size}명)</span>}</span>
            <button
              type="button"
              onClick={() => setSelected(allOn ? new Set() : new Set(students.map((s) => s.userId)))}
              className="text-sm text-gray-600 underline"
            >
              {allOn ? "모두 해제" : "모두 선택"}
            </button>
          </div>
          {students.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-center text-gray-500">우리 반 친구가 없어요.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {students.map((s) => {
                const on = selected.has(s.userId);
                return (
                  <li key={s.userId}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(s.userId)}
                      className={`flex w-full flex-col items-center rounded-xl p-2 transition ${on ? "bg-orange-500 text-white" : "bg-white hover:bg-orange-100"}`}
                    >
                      <span className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-orange-100">
                        <img {...profileImgProps(s.profileUrl, 60)} width="48" height="48" alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="mt-1 w-full truncate text-center text-sm font-semibold">
                        {s.classNumber}. {s.profileNickname || s.userId}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 이유 (선택) */}
        <label className="block">
          <span className="mb-1 block font-semibold">이유 <span className="text-sm font-normal text-gray-500">(선택, 선생님이 볼 수 있어요)</span></span>
          <input
            type="text"
            value={memo}
            maxLength={50}
            onChange={(e) => setMemo(e.target.value)}
            placeholder={isSend ? "예: 청소를 열심히 했어요" : "예: 약속을 지키지 않았어요"}
            className="w-full rounded-xl bg-white px-3 py-2 outline-none ring-orange-300 focus:ring-2"
          />
        </label>

        {/* 금액 + 신청 */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
            <span className="text-gray-600">{isSend ? "줄" : "가져갈"} {currency}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 text-right text-lg font-bold outline-none"
              placeholder="0"
            />
            <span>{emoji}</span>
          </label>
          <button
            type="submit"
            disabled={busy || selected.size === 0 || !amount}
            className={`rounded-xl px-6 py-3 font-bold text-white disabled:opacity-40 ${isSend ? "bg-emerald-500" : "bg-rose-500"}`}
          >
            {busy ? "신청 중..." : "선생님께 신청"}
          </button>
        </div>
        {selectedLabels.length > 0 && amount && (
          <p className="text-sm text-gray-600">
            {selectedLabels.length > 3 ? `${selectedLabels.slice(0, 3).join(", ")} 외 ${selectedLabels.length - 3}명` : selectedLabels.join(", ")}
            {isSend ? "에게 " : "에게서 "}
            {emoji}
            {Number(amount) || 0} {isSend ? "주기" : "가져가기"}
          </p>
        )}
      </form>

      {/* 내 신청 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">내 신청 (최근 30일)</h2>
          <button type="button" onClick={loadMine} className="text-sm text-gray-600 underline">
            ↻ 새로고침
          </button>
        </div>
        {mine.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-center text-gray-500">아직 신청한 게 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((g) => {
              const pending = g.items.filter((i) => i.status === "pending").length;
              const { day, time } = formatHistoryDateParts(g.createdAt);
              return (
                <li key={g.batchId} className="rounded-xl bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {day} {time}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${g.isSend ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {g.isSend ? "주기" : "가져가기"} {emoji}
                      {g.amount}
                    </span>
                    <span className="text-sm text-gray-600">{g.items.length}명</span>
                    {g.memo && <span className="min-w-0 truncate text-sm text-gray-600">💬 {g.memo}</span>}
                    {pending > 0 && (
                      <button type="button" onClick={() => cancel(g.batchId)} className="ml-auto text-sm text-gray-500 underline">
                        신청 취소
                      </button>
                    )}
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {g.items.map((i) => (
                      <li key={i.userId} className={`rounded-lg px-2 py-0.5 text-sm ${STATUS[i.status]?.cls ?? "bg-gray-100"}`} title={i.reason || undefined}>
                        {i.label} · {STATUS[i.status]?.label ?? i.status}
                        {i.status === "rejected" && i.reason ? ` (${i.reason})` : ""}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
