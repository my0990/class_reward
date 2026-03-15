import { useState, useEffect, useMemo, useCallback } from "react";
import { mutate } from "swr";
import ModalTemplate from "@/components/ui/common/ModalTemplate";

export default function CreateModal({ modalId, setModalId, classData, classId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentArr, setStudentArr] = useState({});

  // 1~40 고정 렌더
  const nums = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), []);

  useEffect(() => {
    if (classData?.studentAccounts) {
      setStudentArr({ ...classData.studentAccounts });
    }
  }, [classData?.studentAccounts]);

  const onToggle = useCallback((num) => {
    setStudentArr((prev) => {
      // "생성됨"은 토글 불가
      if (prev[num] === "생성됨") return prev;
      return { ...prev, [num]: prev[num] === true ? false : true };
    });
  }, []);

  const onSubmit = useCallback(async (close) => {
    if (isLoading) return;

    const accountArr = nums.filter((n) => studentArr[n] === true);
    if (accountArr.length === 0) return; // 아무것도 선택 안 했으면 중단(원하면 메시지)

    const updatedStudentArr = Object.fromEntries(
      Object.entries(studentArr).map(([key, value]) => [
        key,
        value === true ? "생성됨" : value,
      ])
    );

    try {
      setIsLoading(true);

      const res = await fetch("/api/createStudentAccount", {
        method: "POST",
        body: JSON.stringify({
          accountArr,
          updatedStudentArr,
          uniqueNickname: classData?.uniqueNickname,
          classId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!data?.result) return;

      await Promise.all([
        mutate(`/api/classData/${classId}`),
        mutate(`/api/students/${classId}`),
      ]);

      close();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nums, studentArr, classData?.uniqueNickname, classId]);

  return (
    <ModalTemplate id="CREATE_ACCOUNT" modalId={modalId} setModalId={setModalId}>
      {({ close }) => (
        <div className="h-[720px] overflow-scroll p-[32px]">
          <div className="flex justify-between items-center flex-col">
            <h3 className="font-bold text-[1.5rem] mb-[16px]">
              계정은 1번부터 40번까지 만들 수 있습니다
            </h3>
            <h3 className="font-bold text-gray-400 text-[1rem] mb-[16px]">
              초기 비밀번호는 12345678입니다
            </h3>
          </div>

          <div className="grid grid-cols-5">
            {nums.map((num) => {
              const v = studentArr[num];

              const isCreated = v === "생성됨";
              const isPicked = v === true;

              return (
                <div key={num} className="text-center m-[8px]">
                  {isCreated ? (
                    <div className="text-[3rem] leading-none opacity-50">❤️</div>
                  ) : isPicked ? (
                    <button
                      type="button"
                      className="text-[3rem] leading-none cursor-pointer transition-all hover:scale-110"
                      onClick={() => onToggle(num)}
                      disabled={isLoading}
                    >
                      ❤️
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-[3rem] leading-none cursor-pointer transition-all hover:scale-110"
                      onClick={() => onToggle(num)}
                      disabled={isLoading}
                    >
                      😴
                    </button>
                  )}
                  <div>{num}번</div>
                </div>
              );
            })}
          </div>

          <button
            className="btn w-full bg-orange-300 hover:bg-orange-400 mt-[16px]"
            onClick={() => onSubmit(close)}
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "확인"}
          </button>
        </div>
      )}
    </ModalTemplate>
  );
}