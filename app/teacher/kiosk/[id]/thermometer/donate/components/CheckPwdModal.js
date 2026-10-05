import KioskPasswordDialog from "@/components/kiosk/KioskPasswordDialog";

// 기부용 비밀번호 확인 → 키패드 창 (성공하면 기부 수량 입력 단계로)
export default function CheckPwdModal({ type, requestData, setRequestData }) {
    const nextStep = type === "buy" ? "confirmItemBuy" : type === "use" ? "confirmItemUse" : "SELECT_AMOUNT";

    return (
        <KioskPasswordDialog
            userData={requestData?.userData}
            onSuccess={(kioskToken) => setRequestData((prev) => ({ ...prev, kioskToken, step: nextStep }))}
        />
    );
}
