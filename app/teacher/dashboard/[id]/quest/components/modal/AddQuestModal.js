

// 'use client';

// import { useState } from "react";
// import { mutate } from "swr";
// import ModalTemplate from "@/components/modal/ModalTemplate";

// const makeInitialInput = (classId) => ({
//   questName: "",
//   questGoal: "",
//   questReward: "",
//   questExp: "",
//   questTitle: "",
//   rewardEnabled: false,
//   expEnabled: false,
//   titleEnabled: false,
//   classId,
// });

// export default function AddQuestModal({
//   currencyEmoji,
//   currencyName,
//   classId,
//   modalId,
//   setModalId,
// }) {
//   const [input, setInput] = useState(() =>
//     makeInitialInput(classId)
//   );

//   const syncEnabled = (next) => ({
//     ...next,
//     rewardEnabled: next.questReward.trim() !== "",
//     expEnabled: next.questExp.trim() !== "",
//     titleEnabled: next.questTitle.trim() !== "",
//   });

//   const onAddModalInputChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "questName" || name === "questGoal") {
//       setInput((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//       return;
//     }

//     if (name === "questTitle") {
//       setInput((prev) =>
//         syncEnabled({
//           ...prev,
//           questTitle: value,
//         })
//       );
//       return;
//     }

//     if (name === "questReward" || name === "questExp") {
//       if (!/^\d*$/.test(value)) return;

//       const normalizedValue =
//         value === "" ? "" : String(Number(value));

//       setInput((prev) =>
//         syncEnabled({
//           ...prev,
//           [name]: normalizedValue,
//         })
//       );
//     }
//   };

//   const resetInput = () => {
//     setInput(makeInitialInput(classId));
//   };

//   const onCloseModal = () => {
//     setModalId(null);

//     setTimeout(() => {
//       resetInput();
//     }, 200);
//   };

//   const onCreateQuest = async (e) => {
//     e.preventDefault();

//     if (
//       input.questName.trim() === "" ||
//       input.questGoal.trim() === ""
//     ) {
//       alert("퀘스트 이름과 목표를 입력해 주세요.");
//       return;
//     }

//     const payload = {
//       questName: input.questName.trim(),
//       questGoal: input.questGoal.trim(),
//       questReward:
//         input.questReward.trim() !== ""
//           ? Number(input.questReward)
//           : 0,
//       questExp:
//         input.questExp.trim() !== ""
//           ? Number(input.questExp)
//           : 0,
//       questTitle:
//         input.questTitle.trim() !== ""
//           ? input.questTitle.trim()
//           : "",
//       classId,
//     };

//     try {
//       const res = await fetch("/api/addQuest", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const response = await res.json();

//       if (!res.ok || !response.result) {
//         alert(response?.message ?? "퀘스트 등록 실패");
//         return;
//       }

//       await mutate(`/api/fetchQuestList/${classId}`);

//       setModalId(null);
//       resetInput();
//     } catch (error) {
//       console.error(error);
//       alert("퀘스트 등록 중 오류가 발생했습니다.");
//     }
//   };

//   return (
//     <ModalTemplate
//       id="ADD_QUEST"
//       modalId={modalId}
//       setModalId={setModalId}
//       onClose={onCloseModal}
//       className="w-[calc(100%-32px)] max-w-[600px]"
//     >
//       {({ close }) => (
//         <div className="relative max-w-[600px] p-[24px] text-[1.2rem] text-red-900 min-[600px]:p-[32px]">
//           <button
//             type="button"
//             onClick={onCloseModal}
//             className="
//               absolute right-3 top-3 flex h-[34px] w-[34px]
//               items-center justify-center rounded-full text-[1.2rem]
//               leading-none hover:bg-gray-200
//             "
//           >
//             ×
//           </button>

//           <form
//             onSubmit={onCreateQuest}
//             className="flex flex-col justify-center"
//           >
//             <h1 className="mb-[16px] text-center text-[2rem] font-bold text-red-900">
//               퀘스트 등록하기
//             </h1>

//             <label
//               htmlFor="questName"
//               className="font-bold"
//             >
//               퀘스트 이름
//             </label>

//             <input
//               id="questName"
//               name="questName"
//               value={input.questName}
//               onChange={onAddModalInputChange}
//               className="
//                 mb-[16px] border-2 p-[8px]
//                 focus:outline-orange-500
//               "
//             />

//             <label
//               htmlFor="questGoal"
//               className="font-bold"
//             >
//               퀘스트 목표
//             </label>

//             <input
//               id="questGoal"
//               name="questGoal"
//               value={input.questGoal}
//               onChange={onAddModalInputChange}
//               className="
//                 mb-[16px] border-2 p-[8px]
//                 focus:outline-orange-500
//               "
//             />

//             <h2 className="font-bold">퀘스트 보상</h2>

//             <div className="mb-[8px]">
//               <div className="mb-[8px] flex min-h-[32px] justify-between gap-[16px]">
//                 <div className="flex cursor-default items-center">
//                   <input
//                     id="rewardEnabled"
//                     type="checkbox"
//                     checked={input.rewardEnabled}
//                     readOnly
//                     tabIndex={-1}
//                     className="
//                       checkbox checkbox-warning mr-[8px]
//                       cursor-default
//                     "
//                   />

//                   <label
//                     htmlFor="rewardEnabled"
//                     className="cursor-default"
//                   >
//                     {currencyName}
//                   </label>
//                 </div>

//                 <div className="flex">
//                   <div className="border-b-4 border-orange-400">
//                     {currencyEmoji}
//                   </div>

//                   <input
//                     name="questReward"
//                     inputMode="numeric"
//                     placeholder="숫자만 입력"
//                     value={input.questReward}
//                     onChange={onAddModalInputChange}
//                     className="
//                       w-[160px] border-b-4 border-orange-400
//                       text-right outline-none
//                       placeholder:text-center
//                     "
//                   />
//                 </div>
//               </div>

//               <div className="mb-[8px] flex min-h-[32px] justify-between gap-[16px]">
//                 <div className="flex cursor-default items-center">
//                   <input
//                     id="expEnabled"
//                     type="checkbox"
//                     checked={input.expEnabled}
//                     readOnly
//                     tabIndex={-1}
//                     className="
//                       checkbox checkbox-warning mr-[8px]
//                       cursor-default
//                     "
//                   />

//                   <label
//                     htmlFor="expEnabled"
//                     className="cursor-default"
//                   >
//                     경험치
//                   </label>
//                 </div>

//                 <div className="flex">
//                   <div className="border-b-4 border-orange-400">
//                     🆙
//                   </div>

//                   <input
//                     name="questExp"
//                     inputMode="numeric"
//                     placeholder="숫자만 입력"
//                     value={input.questExp}
//                     onChange={onAddModalInputChange}
//                     className="
//                       w-[160px] border-b-4 border-orange-400
//                       text-right outline-none
//                       placeholder:text-center
//                     "
//                   />
//                 </div>
//               </div>

//               <div className="mb-[8px] flex min-h-[32px] justify-between gap-[16px]">
//                 <div className="flex cursor-default items-center">
//                   <input
//                     id="titleEnabled"
//                     type="checkbox"
//                     checked={input.titleEnabled}
//                     readOnly
//                     tabIndex={-1}
//                     className="
//                       checkbox checkbox-warning mr-[8px]
//                       cursor-default
//                     "
//                   />

//                   <label
//                     htmlFor="titleEnabled"
//                     className="cursor-default"
//                   >
//                     칭호
//                   </label>
//                 </div>

//                 <div className="flex">
//                   <div className="border-b-4 border-orange-400">
//                     🍊
//                   </div>

//                   <input
//                     name="questTitle"
//                     value={input.questTitle}
//                     onChange={onAddModalInputChange}
//                     className="
//                       w-[160px] border-b-4 border-orange-400
//                       text-right outline-none
//                     "
//                   />
//                 </div>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="
//                 btn mt-[16px] w-full border-0
//                 bg-orange-500 text-[1.2rem] text-white
//                 focus:outline-none
//               "
//             >
//               확인
//             </button>

//             <button
//               type="button"
//               onClick={onCloseModal}
//               className="
//                 btn mt-[16px] w-full border-0 bg-white
//                 text-[1.2rem] text-orange-500 shadow-transparent
//                 hover:bg-orange-500 hover:text-white
//                 focus:outline-none
//               "
//             >
//               취소
//             </button>
//           </form>
//         </div>
//       )}
//     </ModalTemplate>
//   );
// }

'use client';

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import usePendingAction from "@/hooks/usePendingAction";

const INITIAL_INPUT = {
    questName: "",
    questGoal: "",
    questReward: "",
    questExp: "",
    questTitle: "",
};

export default function AddQuestModal({
    classId,
    currency,
    modalId,
    setModalId,
}) {
    const [input, setInput] = useState(INITIAL_INPUT);

    const {
        runAction,
        isPending,
    } = usePendingAction();

    const isCreating = isPending("createQuest");

    const rewardEnabled =
        input.questReward !== "";

    const expEnabled =
        input.questExp !== "";

    const titleEnabled =
        input.questTitle.trim() !== "";

    const resetInput = () => {
        setInput(INITIAL_INPUT);
    };

    const onChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        if (
            name === "questName" ||
            name === "questGoal" ||
            name === "questTitle"
        ) {
            setInput((prev) => ({
                ...prev,
                [name]: value,
            }));

            return;
        }

        if (
            name === "questReward" ||
            name === "questExp"
        ) {
            const numberValue = value
                .replace(/,/g, "")
                .replace(/\D/g, "");

            setInput((prev) => ({
                ...prev,
                [name]:
                    numberValue === ""
                        ? ""
                        : String(Number(numberValue)),
            }));
        }
    };

    const onClose = () => {
        if (isCreating) return;

        setModalId(null);

        setTimeout(() => {
            resetInput();
        }, 200);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const questName =
            input.questName.trim();

        const questGoal =
            input.questGoal.trim();

        const questTitle =
            input.questTitle.trim();

        if (!questName) {
            toast.error(
                "퀘스트 이름을 입력해 주세요."
            );
            return;
        }

        if (!questGoal) {
            toast.error(
                "퀘스트 목표를 입력해 주세요."
            );
            return;
        }

        runAction(
            "createQuest",
            async () => {
                const payload = {
                    questName,
                    questGoal,
                    questReward:
                        input.questReward === ""
                            ? 0
                            : Number(input.questReward),
                    questExp:
                        input.questExp === ""
                            ? 0
                            : Number(input.questExp),
                    questTitle,
                    classId,
                };

                const response = await fetch(
                    "/api/addQuest",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const result = await response
                    .json()
                    .catch(() => null);

                if (
                    !response.ok ||
                    !result?.result
                ) {
                    throw new Error(
                        result?.message ||
                        "퀘스트 등록에 실패했습니다."
                    );
                }

                await mutate(
                    `/api/fetchQuestList/${classId}`
                );

                return result;
            },
            {
                onSuccess: () => {
                    setModalId(null);
                    resetInput();

                    toast.success(
                        "퀘스트를 등록했습니다."
                    );
                },

                onError: (error) => {
                    console.error(error);

                    toast.error(
                        error instanceof Error
                            ? error.message
                            : "퀘스트 등록 중 오류가 발생했습니다."
                    );
                },
            }
        ).catch(() => {});
    };

    return (
        <ModalTemplate
            id="ADD_QUEST"
            modalId={modalId}
            setModalId={setModalId}
            onClose={onClose}
            className="
                w-[calc(100%-32px)]
                max-w-[600px]
            "
        >
            {() => (
                <div
                    className="
                        relative max-w-[600px]
                        p-[24px] text-[1.2rem]
                        text-red-900
                        min-[600px]:p-[32px]
                    "
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCreating}
                        aria-label="모달 닫기"
                        className="
                            absolute right-3 top-3
                            flex h-[34px] w-[34px]
                            items-center justify-center
                            rounded-full
                            hover:bg-gray-200
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        ×
                    </button>

                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col"
                    >
                        <h1
                            className="
                                mb-[16px] text-center
                                text-[2rem] font-bold
                            "
                        >
                            퀘스트 등록하기
                        </h1>

                        <label
                            htmlFor="questName"
                            className="font-bold"
                        >
                            퀘스트 이름
                        </label>

                        <input
                            id="questName"
                            name="questName"
                            value={input.questName}
                            onChange={onChange}
                            disabled={isCreating}
                            className="
                                mb-[16px] border-2
                                p-[8px]
                                focus:outline-orange-500
                            "
                        />

                        <label
                            htmlFor="questGoal"
                            className="font-bold"
                        >
                            퀘스트 목표
                        </label>

                        <input
                            id="questGoal"
                            name="questGoal"
                            value={input.questGoal}
                            onChange={onChange}
                            disabled={isCreating}
                            className="
                                mb-[16px] border-2
                                p-[8px]
                                focus:outline-orange-500
                            "
                        />

                        <h2 className="font-bold">
                            퀘스트 보상
                        </h2>

                        <div className="mb-[8px]">
                            <RewardInput
                                id="rewardEnabled"
                                label={currency.name}
                                icon={currency.emoji}
                                name="questReward"
                                value={input.questReward}
                                checked={rewardEnabled}
                                placeholder="숫자만 입력"
                                inputMode="numeric"
                                disabled={isCreating}
                                onChange={onChange}
                            />

                            <RewardInput
                                id="expEnabled"
                                label="경험치"
                                icon="🆙"
                                name="questExp"
                                value={input.questExp}
                                checked={expEnabled}
                                placeholder="숫자만 입력"
                                inputMode="numeric"
                                disabled={isCreating}
                                onChange={onChange}
                            />

                            <RewardInput
                                id="titleEnabled"
                                label="칭호"
                                icon="🍊"
                                name="questTitle"
                                value={input.questTitle}
                                checked={titleEnabled}
                                disabled={isCreating}
                                onChange={onChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="
                                btn mt-[16px] w-full
                                border-0 bg-orange-500
                                text-[1.2rem] text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {isCreating
                                ? "등록 중..."
                                : "확인"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="
                                btn mt-[16px] w-full
                                border-0 bg-white
                                text-[1.2rem]
                                text-orange-500
                                shadow-transparent
                                hover:bg-orange-500
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            취소
                        </button>
                    </form>
                </div>
            )}
        </ModalTemplate>
    );
}

function RewardInput({
    id,
    label,
    icon,
    name,
    value,
    checked,
    placeholder,
    inputMode,
    disabled,
    onChange,
}) {
    return (
        <div
            className="
                mb-[8px] flex min-h-[32px]
                justify-between gap-[16px]
            "
        >
            <div className="flex items-center">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    readOnly
                    tabIndex={-1}
                    className="
                        checkbox checkbox-warning
                        mr-[8px] cursor-default
                    "
                />

                <label
                    htmlFor={id}
                    className="cursor-default"
                >
                    {label}
                </label>
            </div>

            <div className="flex">
                <div
                    className="
                        border-b-4
                        border-orange-400
                    "
                >
                    {icon}
                </div>

                <input
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    inputMode={inputMode}
                    disabled={disabled}
                    onChange={onChange}
                    className="
                        w-[160px] border-b-4
                        border-orange-400
                        text-right outline-none
                        placeholder:text-center
                        disabled:cursor-not-allowed
                        disabled:bg-gray-100
                    "
                />
            </div>
        </div>
    );
}