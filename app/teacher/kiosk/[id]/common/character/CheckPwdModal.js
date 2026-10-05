import KioskPasswordDialog from "@/components/kiosk/KioskPasswordDialog";

// 구매·아이템 사용(·온도계) 공용 비밀번호 확인 → 키패드 창
// 비밀번호가 맞으면 서버가 준 학생 전용 결제 토큰(kioskToken, 3분 유효)을 들고 다음 단계로 간다.
export default function CheckPwdModal({ type, requestData, setRequestData }) {
    const nextStep = type === "buy" ? "confirmItemBuy" : type === "use" ? "confirmItemUse" : "confirmThermometer";

    return (
        <KioskPasswordDialog
            userData={requestData?.userData}
            onSuccess={(kioskToken) => setRequestData((prev) => ({ ...prev, kioskToken, step: nextStep }))}
        />
    );
}
