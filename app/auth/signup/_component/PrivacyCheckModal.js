export default function PrivacyCheckModal({ setIsPrivacyChecked }) {
    const onCheck = (e) => {
        e.preventDefault();
        setIsPrivacyChecked(true);
        document.getElementById('privacyCheckModal').close();
    }

    return (
        <div>
            <dialog id="privacyCheckModal" className="modal">
                <div className="modal-box  flex flex-col justify-center h-[520px] overflow-hidden bg-orange-200 bg-white">

                    <h2 className="text-center text-[1.5rem] font-bold mb-[16px]">개인정보 수집 및 이용 동의</h2>
                    <div className="bg-white   outline-none">
                        <p className="mb-[8px]">본 사이트는 회원가입을 위해 아이디와 비밀번호만을 수집합니다. <br></br>아래 내용을 읽고 동의해 주세요.</p>

                        <h3>1. 수집하는 개인정보 항목</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">아이디: 회원 식별을 위한 고유 정보</li>
                            <li className="list-disc list-inside ml-[8px]">비밀번호: 계정 보안을 위한 정보</li>
                        </ul>

                        <h3>2. 개인정보의 수집 및 이용 목적</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">회원 가입 및 관리</li>
                            <li className="list-disc list-inside ml-[8px]">사이트 내 학급 관리 및 아이템/퀘스트 생성 기능 제공</li>
                            <li className="list-disc list-inside ml-[8px]">서비스 이용에 필요한 본인 인증 및 보안 유지</li>
                        </ul>

                        <h3>3. 개인정보의 보유 및 이용 기간</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">개인정보는 회원 가입 시부터 회원 탈퇴 시까지 보유됩니다.</li>
                            <li className="list-disc list-inside ml-[8px]">사용자의 요청에 따라 개인정보를 즉시 삭제할 수 있습니다.</li>
                        </ul>

                        <h3>4. 개인정보 제3자 제공</h3>
                        <ul>
                            <li className="list-disc list-inside ml-[8px]">본 사이트는 개인정보를 제3자에게 제공하지 않습니다.</li>
                        </ul>
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