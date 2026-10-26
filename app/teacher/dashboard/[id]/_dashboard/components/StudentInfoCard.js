'use client'

import { profileImgProps } from "@/util/image/profileImage";
import TruncText from "@/components/ui/common/TruncText";
export default function StudentInfoCard({
    data,
    level,
    currencyemoji,
    isActive,
    onClick,
    ...rest
}) {

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(e);
        }
    };

    return (
        <div
            {...rest}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={`w-[160px] p-[16px] rounded-xl cursor-pointer
                        ${isActive ? "bg-orange-500" : "bg-orange-200"}
                        ${rest.className ?? ""}`}
        >
            <div className="flex justify-between mb-[8px]">
                <div className="font-semibold">LV. {level}</div>
                {/* 잔액이 마이너스면 빨간색 (선택된 진한 주황 바탕에서는 더 진한 빨강) */}
                <TruncText
                    className={`w-[80px] text-right ${
                        Number(data.money) < 0 ? `font-bold ${isActive ? "text-red-800" : "text-red-600"}` : ""
                    }`}
                >
                    {currencyemoji} {data.money}
                </TruncText>
            </div>

            <div className="flex overflow-hidden border-4 border-white justify-center items-center w-[110px] h-[110px] mb-[8px] mx-auto bg-white rounded-full">
                {data.profileUrl && (
                    <img
                        {...profileImgProps(data.profileUrl, 100)}
                        width="100"
                        height="100"
                        alt="characther"
                        className="rounded-full"
                        // 프로필 이미지가 없거나 깨진 링크면 깨진 아이콘 대신 빈 흰색 원(부모 배경)만 보이게 함
                        onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                        }}
                    />
                )}
            </div>

            {/* 넘치면 ... 으로 자르고, 클릭하면 전체 글자를 말풍선으로 */}
            <TruncText as="h1" className="text-[1rem] font-bold text-center">
                {data.classNumber}. {data.profileNickname}
            </TruncText>

            <TruncText className="bg-white rounded-lg px-[6px] text-center">
                {data.profileTitle}
            </TruncText>
        </div>
    );
}
