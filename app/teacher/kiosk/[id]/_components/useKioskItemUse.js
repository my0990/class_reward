"use client";
// 아이템 사용 → 결과 알림 → 첫 화면으로 (아이템 사용 화면, 구매 직후 "바로 사용" 공용)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useItem as applyItem } from "@/server-action/actions/item/item.action";
import { kioskHome } from "./KioskHeader";

export default function useKioskItemUse(classId) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async ({ user, item, kioskToken }) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await applyItem({ itemName: item.itemName, itemId: item.itemId, userId: user.userId, classId, kioskToken });
      alert(res?.result ? "아이템을 사용하였습니다" : res?.message || "아이템 사용에 실패했습니다.");
      mutate(`/api/students/${classId}`);
      router.push(kioskHome(classId));
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다.");
      setBusy(false);
    }
  };

  return { run, busy };
}
