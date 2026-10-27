import { profileImgProps } from "@/util/image/profileImage";
import { calculateLevel } from "@/util/level/level.utils";
import ClampText from "@/components/ui/common/ClampText";
import EditableText from "./EditableText";

// onEdit({ profileNickname } | { profileState }) → 성공하면 true. 주면 별명·자기소개를 눌러서 고칠 수 있다
export default function CardTemplate({ picked, startExp, commonDifference, onEdit }) {

    const level = picked
        ? calculateLevel({ exp: picked.exp, startExp, commonDifference })
        : null;

    return (
        <div className="w-[352px] max-w-full h-[500px] bg-orange-200 p-[16px] rounded-xl max-[480px]:h-auto">
            <div >
                <div className="flex items-center relative">
                    <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {level}</div>
                    {onEdit ? (
                        <EditableText
                            value={picked?.profileNickname ?? ""}
                            maxLength={20}
                            placeholder="별명"
                            onSave={(v) => onEdit({ profileNickname: v })}
                            className="h-[40px] max-w-[260px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[28px] font-bold flex items-center"
                        />
                    ) : (
                        <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">{picked?.profileNickname}</div>
                    )}
                </div>
            </div>
            <div className="flex justify-center flex-col items-center my-[16px]">
                <div className="w-[190px] h-[190px] max-[480px]:w-[150px] max-[480px]:h-[150px] border-[6px] border-white overflow-hidden rounded-full bg-white flex justify-center items-center mb-[12px]">
                    <img {...profileImgProps(picked?.profileUrl, 190)} width="170" height="170" alt="orange" className="rounded-full" />
                </div>
                <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">{picked?.profileTitle}</div>
            </div>
            {/* 자기소개: 4줄 넘으면 ... / 누르면 같은 자리에 덮어서 전체 보기 */}
            {onEdit ? (
                // 선생님 화면: 눌러서 고치기 (고칠 때는 전체 내용이 보임)
                <EditableText
                    multiline
                    value={picked?.profileState ?? ""}
                    maxLength={200}
                    placeholder="자기소개가 없어요. 눌러서 쓸 수 있어요."
                    onSave={(v) => onEdit({ profileState: v })}
                    className="w-full h-[134px] max-[480px]:h-auto max-[480px]:min-h-[60px] bg-white rounded-xl p-[8px]"
                    display={
                        picked?.profileState ? (
                            <div className="overflow-hidden whitespace-pre-wrap break-words" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 4 }}>
                                {picked.profileState}
                            </div>
                        ) : undefined
                    }
                />
            ) : (
                <ClampText lines={4} className="w-full h-[134px] max-[480px]:h-auto max-[480px]:min-h-[60px] bg-white rounded-xl p-[8px]">
                    {picked?.profileState}
                </ClampText>
            )}
        </div>
    )
}
