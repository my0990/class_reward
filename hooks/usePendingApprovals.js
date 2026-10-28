"use client";
import useSWR from "swr";
import { countPendingRequests } from "@/server-action/actions/request/request.action";

// 승인 대기 건수는 1분마다 + 창으로 돌아올 때 확인한다
const PENDING_REFRESH = { refreshInterval: 60_000, revalidateOnFocus: true, dedupingInterval: 10_000 };

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
