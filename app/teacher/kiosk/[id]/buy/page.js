"use client";
// 아이템 구매: 아이템 선택 → 학생 선택(잔액 확인 + 비밀번호) → 결제
import { useState } from "react";
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import KioskHeader from "../_components/KioskHeader";
import StudentPicker, { notEnoughMessage } from "../_components/StudentPicker";
import { ItemGrid, ItemDetail } from "../_components/ItemCard";
import ConfirmBuy from "./ConfirmBuy";

export default function ItemBuyPage() {
  const { id: classId } = useParams();
  const [item, setItem] = useState(null);
  const [picked, setPicked] = useState(null); // { user, kioskToken }
  const { data: classData, isLoading, isError } = useFetchData(`/api/classData/${classId}`);

  if (isLoading) return <div className="p-8">불러오는 중...</div>;
  if (isError) return <div className="p-8">데이터 로드 실패</div>;
  const { itemList = [], currencyName } = classData;

  // 3) 결제
  if (item && picked) {
    return <ConfirmBuy classId={classId} item={item} user={picked.user} kioskToken={picked.kioskToken} />;
  }

  // 2) 학생 선택
  if (item) {
    return (
      <StudentPicker
        classId={classId}
        title="아이템 구매"
        guide="구매할 계정을 선택해주세요"
        onBack={() => setItem(null)}
        check={(user) => (user.money < item.itemPrice ? notEnoughMessage(currencyName) : null)}
        onPicked={setPicked}
      >
        <ItemDetail item={item} currencyName={currencyName} />
      </StudentPicker>
    );
  }

  // 1) 아이템 선택
  return (
    <div className="min-h-[100vh] bg-orange-100">
      <div className="mx-auto w-full max-w-[1136px] px-4 pb-8">
        <KioskHeader classId={classId} title="아이템 구매" showHome={false} />
        <div className="mt-[16px] text-[2rem] text-red-500">사고 싶은 아이템을 선택하세요</div>
        <ItemGrid items={itemList} currencyName={currencyName} showStock onPick={setItem} />
      </div>
    </div>
  );
}
