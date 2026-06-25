import { useState } from "react";

export default function DonateAmountModal({ type, requestData, setRequestData }) {
  const [step, setStep] = useState("PASSWORD"); // PASSWORD | AMOUNT | CONFIRM
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");

  const student = requestData?.student;

  const onCloseModal = () => {
    setStep("PASSWORD");
    setPassword("");
    setAmount("");
    document.getElementById("my_modal_3").close();
  };

  const stepInfo = {
    PASSWORD: "1 / 3",
    AMOUNT: "2 / 3",
    CONFIRM: "3 / 3",
  };

  const addPasswordNumber = (num) => {
    setPassword((prev) => {
      if (prev.length >= 8) return prev;
      return prev + num;
    });
  };

  const addAmountNumber = (num) => {
    setAmount((prev) => {
      if (prev.length >= 4) return prev;
      if (prev === "" && num === "0") return prev;
      return prev + num;
    });
  };

  const Keypad = ({ onNumber, onClear, onDelete }) => (
    <div className="grid w-[150px] grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onNumber(String(num))}
          className="h-14 rounded-2xl bg-gray-100 text-xl font-extrabold text-gray-800 shadow active:scale-95"
        >
          {num}
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="h-14 rounded-2xl bg-gray-200 text-sm font-bold text-gray-700 active:scale-95"
      >
        초기화
      </button>

      <button
        type="button"
        onClick={() => onNumber("0")}
        className="h-14 rounded-2xl bg-gray-100 text-xl font-extrabold text-gray-800 shadow active:scale-95"
      >
        0
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="h-14 rounded-2xl bg-gray-200 text-sm font-bold flex justify-center items-center text-gray-700 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>

      </button>
    </div>
  );

  return (
    // <dialog id="my_modal_3" className="modal modal-middle">
    //   <div className="modal-box max-h-[92vh] max-w-[560px] overflow-hidden rounded-[28px] p-5 dark:bg-orange-200">
    <dialog id="my_modal_3" className="modal modal-middle">
      <div
        key={step}
        className="modal-box modal-step-change max-h-[92vh] max-w-[560px] overflow-hidden rounded-[28px] p-5 dark:bg-orange-200"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-orange-500">
              학급 온도계
            </div>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-800">
              쿠키 기부하기
            </h2>
          </div>

          <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-600">
            {stepInfo[step]}
          </div>
        </div>
        {step === "PASSWORD" && (
          <>
            <div className="flex gap-4">
              {/* 왼쪽: 프로필 + 비밀번호 표시 */}
              <div className="flex flex-1 flex-col items-center rounded-3xl bg-orange-50 p-5">
                <div className="mb-3 h-24 w-24 overflow-hidden rounded-full bg-orange-100">
                  {student?.profileUrl ? (
                    <img
                      src={student.profileUrl}
                      alt="학생 프로필"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      🍪
                    </div>
                  )}
                </div>

                <div className="text-lg font-extrabold text-gray-800">
                  {/* {student?.number}번 {student?.name} */}
                  1. 신난호랑이2
                </div>

                <div className="mt-5 w-full rounded-2xl bg-white p-4 text-center">
                  <div className="text-sm font-bold text-gray-500">
                    비밀번호 확인
                  </div>

                  <div className="mt-2 min-h-[48px] text-3xl font-extrabold tracking-[10px] text-gray-800">
                    {"●".repeat(password.length)}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 키패드 */}
              <Keypad
                onNumber={addPasswordNumber}
                onClear={() => setPassword("")}
                onDelete={() => setPassword((prev) => prev.slice(0, -1))}
              />
            </div>

            <button
              type="button"
              disabled={password.length < 4}
              onClick={() => setStep("AMOUNT")}
              className={`mt-4 w-full rounded-2xl py-3 text-lg font-extrabold text-white ${password.length < 4 ? "bg-gray-300" : "bg-orange-500"
                }`}
            >
              다음
            </button>
          </>
        )}
        {step === "AMOUNT" && (
          <>
            <div className="flex gap-4 ">
              {/* 왼쪽 */}
              <div className="flex flex-1 flex-col items-center rounded-3xl bg-orange-50 p-5">


                <div className="w-full flex justify-between">
                  <div className="text-lg font-extrabold text-gray-800">
                    {/* {student?.number}번 {student?.name} */}
                    1. 신난호랑이2
                  </div>
                  <div>4005쿠키</div>
                </div>
                <div className="mt-5 w-full  h-full flex items-center flex-col justify-center rounded-2xl bg-white p-4 text-center">
                  <div className="text-sm font-bold ">
                    얼마나 기부할까요?
                  </div>

                  <div className="mt-2 text-3xl font-extrabold text-orange-600">
                    {amount || 0}
                  </div>
                  <div className="text-gray-500">
                    1.3도 상승
                  </div>
                </div>
              </div>
              {/* <div className="mb-3 h-24 w-24 overflow-hidden rounded-full bg-orange-100">
                  {student?.profileUrl ? (
                    <img
                      src={student.profileUrl}
                      alt="학생 프로필"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      🍪
                    </div>
                  )}
                </div> */}

              {/* <div className="text-lg font-extrabold text-gray-800">
                  {student?.number}번 {student?.name}
                </div> */}




              {/* 오른쪽 */}
              <Keypad
                onNumber={addAmountNumber}
                onClear={() => setAmount("")}
                onDelete={() => setAmount((prev) => prev.slice(0, -1))}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("PASSWORD")}
                className="flex-1 rounded-2xl bg-gray-200 py-3 font-bold text-gray-700"
              >
                이전
              </button>

              <button
                type="button"
                disabled={Number(amount) <= 0}
                onClick={() => setStep("CONFIRM")}
                className={`flex-1 rounded-2xl py-3 font-bold text-white ${Number(amount) <= 0 ? "bg-gray-300" : "bg-orange-500"
                  }`}
              >
                다음
              </button>
            </div>
          </>
        )}
        {/* {step === "CONFIRM" && (
          <>
            <div className="mb-5 rounded-3xl bg-gray-50 p-5">
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-gray-500">학생</span>

                <span className="font-bold text-gray-800">
                  {student?.number}번 {student?.name}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">기부 쿠키</span>

                <span className="font-bold text-orange-600">
                  {Number(amount)}개
                </span>
              </div>
            </div>

            <div className="mb-5 rounded-2xl bg-orange-50 p-4 text-center text-sm font-semibold text-orange-700">
              위 내용으로 쿠키를 기부할까요?
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("AMOUNT")}
                className="flex-1 rounded-2xl bg-gray-200 py-4 font-bold text-gray-700"
              >
                이전
              </button>

              <button
                type="button"
                onClick={() => {
                  console.log({
                    type,
                    studentId: student?._id,
                    amount: Number(amount),
                    password,
                  });

                  onCloseModal();
                }}
                className="flex-1 rounded-2xl bg-orange-500 py-4 font-bold text-white active:scale-[0.98]"
              >
                최종 기부
              </button>
            </div>
          </>
        )} */}
        {step === "CONFIRM" && (
          <>
            <div className="mb-5 rounded-3xl bg-orange-50 p-5">
              <div className="flex flex-col items-center">
                <div className="mb-3 h-24 w-24 overflow-hidden rounded-full bg-orange-100">
                  {student?.profileUrl ? (
                    <img
                      src={student.profileUrl}
                      alt="학생 프로필"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      🍪
                    </div>
                  )}
                </div>

                <div className="text-lg font-extrabold text-gray-800">
                  {student?.number}번 {student?.name}
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-2xl bg-white p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">현재 소유 쿠키</span>
                  <span className="font-bold text-gray-800">
                    {student?.money ?? 0}개
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">기부 쿠키</span>
                  <span className="font-bold text-orange-600">
                    -{Number(amount)}개
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3" />

                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-700">기부 후 남은 쿠키</span>
                  <span className="font-extrabold text-orange-600">
                    {(student?.money ?? 0) - Number(amount)}개
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-5 rounded-2xl bg-orange-50 p-4 text-center text-sm font-semibold text-orange-700">
              위 내용으로 쿠키를 기부할까요?
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("AMOUNT")}
                className="flex-1 rounded-2xl bg-gray-200 py-4 font-bold text-gray-700"
              >
                이전
              </button>

              <button
                type="button"
                onClick={() => {
                  console.log({
                    type,
                    studentId: student?._id,
                    amount: Number(amount),
                    password,
                    beforeMoney: student?.money ?? 0,
                    afterMoney: (student?.money ?? 0) - Number(amount),
                  });

                  onCloseModal();
                }}
                className="flex-1 rounded-2xl bg-orange-500 py-4 font-bold text-white active:scale-[0.98]"
              >
                최종 기부
              </button>
            </div>
          </>
        )}
      </div>

      <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
        <button>close</button>
      </form>
    </dialog>
  );
}