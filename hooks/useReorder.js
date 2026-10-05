"use client";

// 드래그로 바꾼 순서를 화면에 먼저 반영하고(낙관적 업데이트) 서버에 저장한다.
// 저장에 실패하면 원래 순서로 되돌리고 안내한다.
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

/**
 * @param {any[]} items        서버에서 받은 목록
 * @param {(item) => string} getId
 * @param {(orderedIds: string[]) => Promise<{result: boolean, message?: string}>} save
 * @param {() => Promise<any>} [refresh]  저장 후 다시 불러오기 (SWR mutate)
 */
export default function useReorder(items, getId, save, refresh) {
  const [pendingOrder, setPendingOrder] = useState(null); // 저장 중인 순서 (id 배열)
  const [isSaving, setIsSaving] = useState(false);

  const ordered = useMemo(() => {
    const list = items ?? [];
    if (!pendingOrder) return list;
    const byId = new Map(list.map((it) => [String(getId(it)), it]));
    const head = pendingOrder.map((id) => byId.get(id)).filter(Boolean);
    const rest = list.filter((it) => !pendingOrder.includes(String(getId(it))));
    return [...head, ...rest];
  }, [items, pendingOrder, getId]);

  const onReorder = async (orderedIds) => {
    setPendingOrder(orderedIds);
    setIsSaving(true);
    try {
      const res = await save(orderedIds);
      if (!res?.result) throw new Error(res?.message || "순서를 저장하지 못했습니다.");
      await refresh?.();
    } catch (error) {
      toast.error(error?.message || "순서를 저장하지 못했습니다.");
    } finally {
      setPendingOrder(null);
      setIsSaving(false);
    }
  };

  return { ordered, onReorder, isSaving };
}
