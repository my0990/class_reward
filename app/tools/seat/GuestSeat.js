"use client";
import SeatTool from "@/components/tools/seat/SeatTool";
import { useGuestSeatStore } from "@/components/tools/seat/useGuestSeatStore";

// 비회원 자리 바꾸기: 명단·배치·조건·기록은 이 브라우저에만
export default function GuestSeat() {
  const store = useGuestSeatStore();
  return <SeatTool store={store} />;
}
