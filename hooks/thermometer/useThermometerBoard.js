"use client";

import { useState, useEffect } from "react";
import { useFetchData, LIVE_REFRESH } from "@/hooks/useFetchData";
import { toast } from "react-hot-toast";
import usePendingAction from "@/hooks/usePendingAction";
import { updateManualDegree, updateThermometerSetting } from "@/server-action/actions/thermometer/thermometer.action";

const DEFAULT_REWARD_OBJ = {
  10: "",
  20: "",
  30: "",
  40: "",
  50: "",
  60: "",
  70: "",
  80: "",
  90: "",
  100: "",
};

// teacher/dashboard의 학급 온도계 화면과 kiosk의 학급 온도계 화면이
// 완전히 동일한 데이터/상태/핸들러를 각자 복붙해서 쓰고 있던 것을
// 하나로 모은 공용 훅.
export function useThermometerBoard(classId) {
  const { runAction, isPending } = usePendingAction();

  const {
    data: thermometerData,
    isLoading,
    isError,
    mutate: mutateThermometerData,
  } = useFetchData(classId ? `/api/thermometer/${classId}` : null, LIVE_REFRESH);

  const [modalId, setModalId] = useState(null);
  const [rewardObj, setRewardObj] = useState({});
  const [requireCurrency, setRequireCurrency] = useState("");
  const [type, setType] = useState(null);

  // 설정 입력칸은 "설정 값(보상·1도당 쿠키 수)"이 바뀔 때만 다시 채운다.
  // 15초마다 새로고침되면서 기부로 온도만 바뀐 경우에는, 교사가 입력 중인 설정을 덮어쓰지 않는다.
  const settingsKey = thermometerData
    ? JSON.stringify([thermometerData.reward ?? null, thermometerData.requireCurrency ?? null])
    : null;

  useEffect(() => {
    if (!thermometerData) return;
    setRewardObj({
      ...DEFAULT_REWARD_OBJ,
      ...(thermometerData.reward ?? {}),
    });
    setRequireCurrency(thermometerData.requireCurrency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsKey]);

  const onRewardInputChange = (degree, value) => {
    setRewardObj((prev) => ({
      ...prev,
      [degree]: value,
    }));
  };

  const onUpdateTemperatureSetting = async () => {
    runAction("updateThermoSetting", async () => {
      const data = await updateThermometerSetting({ classId, rewardObj, requireCurrency });

      if (!data.result) {
        toast.error(data.message || "수정 실패");
        setModalId(null);
        return;
      }

      await mutateThermometerData?.();
      setModalId(null);
      toast.success("수정 완료");
    });
  };

  const onUpdateDegree = async ({ degreeChange, type: changeType }) => {
    runAction("updateDegree", async () => {
      const data = await updateManualDegree({ classId, type: changeType, degreeChange });

      if (!data.result) {
        toast.error(data.message || "수정 실패");
        setModalId(null);
        return;
      }

      await mutateThermometerData?.();
      setModalId(null);
      toast.success(changeType === "increase" ? "온도를 올렸습니다" : "온도를 내렸습니다");
    });
  };

  const onManageModalOpen = (nextType) => {
    setType(nextType);
    setModalId("HANDLE_TEMPERATURE");
  };

  // manualDegree/donators가 아직 없는 문서(생성 직후 등)에서도 크래시 없이 동작하도록 기본값 처리
  const classDegree = thermometerData?.manualDegree ?? 0;

  const ranking = Object.entries(thermometerData?.donators || {})
    .sort(([, a], [, b]) => b - a)
    .map(([userId, amount], index) => ({
      rank: index + 1,
      userId,
      amount,
    }));

  return {
    thermometerData,
    isLoading,
    isError,
    mutateThermometerData,
    modalId,
    setModalId,
    rewardObj,
    requireCurrency,
    setRequireCurrency,
    type,
    onRewardInputChange,
    onUpdateTemperatureSetting,
    onUpdateDegree,
    onManageModalOpen,
    classDegree,
    ranking,
    isPending,
  };
}
