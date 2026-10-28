"use client";
import useSWR from "swr";
import { countPendingRequests } from "@/server-action/actions/request/request.action";

// 승인 대기 건수는 페이지를 새로 고칠 때만 확인한다 (주기 확인·창 복귀 확인 없음)
const PENDING_REFRESH = { refreshInterval: 0, revalidateOnFocus: false, revalidateOnReconnect: false };

export const pendingApprovalsKey = (classId) => ["pending-approvals", String(classId)];

/** 교사 화면에서 이 학급의 승인 대기 건수. enabled가 false면 요청하지 않는다 */
export function usePendingApprovals(classId, enabled = true) {
  const { data } = useSWR(
    enabled && classId ? pendingApprovalsKey(classId) : null,
    ([, id]) => countPendingRequests({ classId: id }),
    PENDING_REFRESH
  );
  return data?.result ? data.count : 0;
}
