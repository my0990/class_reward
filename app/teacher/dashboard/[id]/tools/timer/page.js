"use client";
// 도구 > 타이머 (선생님). 화면은 비회원 도구(/tools/timer)와 같은 TimerTool
import { useParams } from "next/navigation";
import TimerTool from "@/components/tools/timer/TimerTool";

export default function TimerPage() {
  const { id } = useParams();
  return <TimerTool classId={id} />;
}
