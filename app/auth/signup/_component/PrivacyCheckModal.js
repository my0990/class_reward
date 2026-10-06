import Link from "next/link";

export default function PrivacyCheckModal({ setIsPrivacyChecked }) {
    const onCheck = (e) => {
        e.preventDefault();
        setIsPrivacyChecked(true);
        document.getElementById('privacyCheckModal').close();
    }

    return (
        <div>
            <dialog id="privacyCheckModal" className="modal">
                <div className="modal-box flex flex-col max-h-[90dvh] bg-white">

                    <h2 className="text-center text-[1.5rem] font-bold mb-[16px]">개인정보 수집 및 이용 동의</h2>
                    <div className="bg-white outline-none overflow-y-auto">
                        <p className="mb-[8px]">회원가입을 위해 아래와 같이 개인정보를 수집·이용합니다. 내용을 읽고 동의해 주세요.</p>

                        <h3>1. 수집하는 개인정보 항목</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">이메일 주소: 로그인 아이디, 본인 확인(인증 메일)</li>
                            <li className="list-disc list-inside ml-[8px]">비밀번호: 계정 보안 (암호화해 저장)</li>
                        </ul>

                        <h3>2. 개인정보의 수집 및 이용 목적</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">회원 가입 및 관리</li>
                            <li className="list-disc list-inside ml-[8px]">사이트 내 학급 관리 및 아이템/퀘스트 생성 기능 제공</li>
                            <li className="list-disc list-inside ml-[8px]">서비스 이용에 필요한 본인 인증 및 보안 유지</li>
                        </ul>

                        <h3>3. 개인정보의 보유 및 이용 기간</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">회원 가입 시부터 회원 탈퇴 시까지 보유하며, 탈퇴하면 즉시 삭제합니다.</li>
                            <li className="list-disc list-inside ml-[8px]">요청하시면 개인정보를 지체 없이 삭제합니다.</li>
                        </ul>

                        <h3>4. 제3자 제공 및 처리 위탁</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">개인정보를 제3자에게 제공하지 않습니다.</li>
                            <li className="list-disc list-inside ml-[8px]">서비스 운영을 위해 Vercel(호스팅), MongoDB Atlas(DB), Resend(인증 메일)에 처리를 위탁하며, 서버가 국외(미국 등)에 있습니다.</li>
                        </ul>

                        <h3>5. 동의 거부 권리</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">동의를 거부할 수 있으나, 거부하면 회원가입을 할 수 없습니다.</li>
                        </ul>

                        <p className="mt-[8px] text-sm">
                            자세한 내용은{" "}
                            <Link href="/privacy" target="_blank" className="text-orange-600 underline">개인정보처리방침</Link>
                            에서 확인할 수 있습니다.
                        </p>
                    </div>
                    <div className="h-[40px] text-[1.1rem] text-end mt-[8px] ">
                        <button onClick={onCheck} className="w-full mt-[8px] outline-none bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600" >확인</button>
                        {/* <button onClick={onClose} className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600" >취소</button> */}
                    </div>
                </div>
            </dialog>
        </div>
    )
}