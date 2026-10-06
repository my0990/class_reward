'use client'

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
                <div className="w-[80px] text-right overflow-hidden whitespace-nowrap">
                    {currencyemoji} {data.money}
                </div>
            </div>

            <div className="flex overflow-hidden border-4 border-white justify-center items-center w-[110px] h-[110px] mb-[8px] mx-auto bg-white rounded-full">
                {data.profileUrl && (
                    <img
                        src={data.profileUrl}
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

            <h1 className="text-[1rem] font-bold text-center overflow-hidden">
                {data.classNumber}. {data.profileNickname}
            </h1>

            <div className="bg-white rounded-lg flex items-center justify-center">
                {data.profileTitle}
            </div>
        </div>
    );
}
