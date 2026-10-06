"use client";
// 아이템 사용: 학생 선택(비밀번호) → 가진 아이템 선택 → 사용 확인
import { useState } from "react";
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import StudentPicker from "../_components/StudentPicker";
import KioskHeader from "../_components/KioskHeader";
import { ItemGrid } from "../_components/ItemCard";
import KioskConfirm from "../_components/KioskConfirm";
import useKioskItemUse from "../_components/useKioskItemUse";

export default function ItemUsePage() {
  const { id: classId } = useParams();
  const [picked, setPicked] = useState(null); // { user, kioskToken }
  const [item, setItem] = useState(null);
  const { data: classData } = useFetchData(`/api/classData/${classId}`);
  const { run, busy } = useKioskItemUse(classId);

  if (!picked) {
    return <StudentPicker classId={classId} title="아이템 사용" onPicked={setPicked} />;
  }

  const items = picked.user.itemList ?? [];
  return (
    <div className="min-h-[100vh] bg-orange-100">
     <div className="mx-auto w-full max-w-[1136px] px-4 pb-8">
      <KioskHeader classId={classId} title="아이템을 선택하세요" onBack={() => setPicked(null)} />
      {items.length === 0 ? (
        <div className="mt-16 text-center text-[1.6rem] text-gray-500">가지고 있는 아이템이 없습니다.</div>
      ) : (
        <ItemGrid items={items} currencyName={classData?.currencyName} onPick={setItem} />
      )}
      <KioskConfirm
        open={Boolean(item)}
        title="아이템을 사용하시겠습니까?"
        busy={busy}
        onConfirm={() => run({ user: picked.user, item, kioskToken: picked.kioskToken })}
        onCancel={() => setItem(null)}
      />
     </div>
    </div>
  );
}
