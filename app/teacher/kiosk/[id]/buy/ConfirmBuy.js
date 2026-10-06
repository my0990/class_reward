"use client";
// 구매 결제 화면: 고른 아이템 · 보유/결제/잔액 → 결제하기 → "바로 사용 / 다음에"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import { buyItem } from "@/server-action/actions/market/market.action";
import KioskHeader, { kioskHome } from "../_components/KioskHeader";
import { ItemDetail } from "../_components/ItemCard";
import KioskConfirm from "../_components/KioskConfirm";
import useKioskItemUse from "../_components/useKioskItemUse";

export default function ConfirmBuy({ classId, item, user, kioskToken }) {
  const router = useRouter();
  const { data: classData, mutate: mutateClassData } = useFetchData(`/api/classData/${classId}`);
  const { mutate: mutateStudents } = useFetchData(`/api/students/${classId}`);
  const [buying, setBuying] = useState(false);
  const [boughtItemId, setBoughtItemId] = useState(null); // 구매 후 학생 아이템 id (바로 사용할 때 필요)
  const itemUse = useKioskItemUse(classId);
  const currencyName = classData?.currencyName ?? "";

  const onPay = async () => {
    if (buying) return;
    setBuying(true);
    try {
      const res = await buyItem({ itemId: item.itemId, userId: user.userId, classId, kioskToken });
      mutateClassData();
      mutateStudents();
      if (res?.result) {
        setBoughtItemId(res.itemId);
      } else {
        alert(res?.message || "구매에 실패했습니다.");
        router.push(kioskHome(classId));
      }
    } catch {
      alert("구매 처리 중 오류가 발생했습니다.");
    } finally {
      setBuying(false);
    }
  };

  const row = "flex justify-between";
  return (
    <div className="mx-auto flex min-h-[100vh] w-[800px] max-w-[90%] flex-col py-[16px]">
      <KioskHeader classId={classId} title="결제" onBack={() => router.push(kioskHome(classId))} showHome={false} />
      <div className="text-[2rem] text-orange-400">
        {user.profileNickname} ({user.userId})
      </div>
      <ItemDetail item={item} currencyName={currencyName} />

      <div className="mt-[48px] text-[1.8rem]">
        <div className={`${row} mb-[16px]`}>
          <div>보유 금액</div>
          <div>{user.money} {currencyName}</div>
        </div>
        <div className={`${row} mb-[24px] border-b-2 border-gray-300 pb-[8px]`}>
          <div>결제 금액</div>
          <div>- {item.itemPrice} {currencyName}</div>
        </div>
        <div className={`${row} items-center`}>
          <div>잔액</div>
          <div className="text-[3rem] text-orange-500">{user.money - item.itemPrice} {currencyName}</div>
        </div>
      </div>

      <button
        type="button"
        onPointerUp={onPay}
        disabled={buying || boughtItemId}
        className="mt-[48px] w-full rounded-full bg-red-500 py-[16px] text-[1.8rem] text-white transition-all hover:scale-105 disabled:opacity-50"
      >
        {buying ? "결제 중..." : "결제하기"}
      </button>

      <KioskConfirm
        open={Boolean(boughtItemId)}
        title={<><span className="font-bold text-red-500">{item.itemName}</span> 아이템을 구입하였습니다</>}
        confirmLabel="지금 바로 사용할래요"
        cancelLabel="다음에 사용할래요"
        busy={itemUse.busy}
        onConfirm={() => itemUse.run({ user, item: { ...item, itemId: boughtItemId }, kioskToken })}
        onCancel={() => router.push(kioskHome(classId))}
      />
    </div>
  );
}
