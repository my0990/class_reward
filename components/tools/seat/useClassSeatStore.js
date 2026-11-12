"use client";
// 선생님 자리 바꾸기 저장소: 우리 반 학생 + 서버(class_data.seatPlan)에 저장
import { useCallback } from "react";
import { mutate } from "swr";
import { useFetchData } from "@/hooks/useFetchData";
import { saveSeatSetup, confirmSeats, deleteSeatRecord } from "@/server-action/actions/seat/seat.action";

export function useClassSeatStore(classId) {
  const planKey = `/api/seat/${classId}`;
  const { data: plan, isLoading: l1, isError: e1 } = useFetchData(planKey);
  const { data: studentList, isLoading: l2, isError: e2 } = useFetchData(`/api/students/${classId}`);
  const refresh = useCallback(() => mutate(planKey), [planKey]);
  return {
    guest: false,
    plan,
    students: studentList ? studentList.filter((s) => s.role !== "teacher") : undefined,
    isLoading: l1 || l2,
    isError: e1 || e2,
    refresh,
    saveSetup: ({ layout, rules }) => saveSeatSetup({ classId, layout, rules }),
    confirm: (assignment) => confirmSeats({ classId, assignment }),
    deleteRecord: (at) => deleteSeatRecord({ classId, at }),
  };
}
