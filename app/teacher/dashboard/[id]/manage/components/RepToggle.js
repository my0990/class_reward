"use client";
// 학생 관리: 학생 대표 지정 스위치 (대표는 친구에게 화폐 지급·회수를 '신청'할 수 있다 → 승인 센터)
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import { setRepresentative } from "@/server-action/actions/account/representative.action";

export default function RepToggle({ student, compact = false }) {
  const { id: classId } = useParams();
  const [on, setOn] = useState(Boolean(student.representative));
  const [busy, setBusy] = useState(false);
  // 목록이 새로 오면 값만 맞춘다 (스위치를 새로 만들지 않아 깜빡이지 않게)
  // (서버 값이 바뀌었을 때만 맞춤: 저장 직후 새 목록이 오기 전에 스위치가 되돌아가지 않게)
  useEffect(() => {
    setOn(Boolean(student.representative));
  }, [student.representative]);
  const name = student.profileNickname || student.userId;

  const change = async (next) => {
    if (busy) return;
    if (!next && !window.confirm(`${name} 학생의 대표를 해제할까요?\n기다리던 화폐 신청은 취소돼요.`)) return;
    setBusy(true);
    setOn(next);
    const r = await setRepresentative({ classId, userId: student.userId, on: next });
    setBusy(false);
    if (!r?.result) {
      setOn(!next);
      toast.error(r?.message || "처리하지 못했어요.");
      return;
    }
    toast.success(r.message);
    mutate(`/api/students/${classId}`);
  };

  return (
    <label className={`inline-flex cursor-pointer items-center gap-[6px] ${compact ? "text-[0.8rem]" : "text-[0.9rem]"}`} title="대표는 친구에게 화폐 지급·회수를 신청할 수 있어요 (승인 센터에서 확인)">
      <input
        type="checkbox"
        className="toggle toggle-warning toggle-sm"
        checked={on}
        disabled={busy}
        onChange={(e) => change(e.target.checked)}
        aria-label={`${name} 학생 대표`}
      />
      {compact && <span className={on ? "font-semibold text-orange-600" : "text-gray-500"}>⭐ 대표</span>}
    </label>
  );
}
