"use client";
import { useEffect, useRef } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { useLiveInterval } from "@/hooks/useLiveInterval";

/**
 * 다른 기기에서 바뀐 학생 잔액을 반영하는 학생 목록 (키오스크용)
 * - 15초마다(쉬면 1분) 작은 '버전' 값만 확인하고, 바뀌었을 때만 학생 목록 전체를 다시 불러온다
 * - 혹시 놓친 변경(이름·프로필 등)을 위해 학생 목록은 5분마다 한 번 새로 불러온다
 */
export function useLiveStudents(classId) {
  const studentsKey = classId ? `/api/students/${classId}` : null;
  const interval = useLiveInterval();

  const students = useFetchData(studentsKey, { refreshInterval: 5 * 60_000, revalidateOnFocus: true, revalidateOnReconnect: true });
  const { data: version } = useFetchData(classId ? `/api/students/${classId}/version` : null, {
    refreshInterval: interval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const lastV = useRef(null);
  const { mutate } = students;
  useEffect(() => {
    const v = version?.v;
    if (!v) return;
    if (lastV.current !== null && lastV.current !== v) mutate();
    lastV.current = v;
  }, [version?.v, mutate]);

  return { ...students, studentsKey };
}
