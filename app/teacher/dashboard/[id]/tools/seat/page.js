"use client";
// 도구 > 자리 바꾸기 (선생님): 우리 반 학생, 서버에 저장. 화면은 비회원 도구(/tools/seat)와 같은 SeatTool
import { useParams } from "next/navigation";
import SeatTool from "@/components/tools/seat/SeatTool";
import { useClassSeatStore } from "@/components/tools/seat/useClassSeatStore";

export default function SeatPage() {
  const { id } = useParams();
  const store = useClassSeatStore(id);
  return <SeatTool store={store} />;
}
