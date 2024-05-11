export default function Password() {
    return (
        <div className="p-[40px] text-[1.1rem]">
            <h1 className="text-[2rem]">계정 관리</h1>
            <h2 className="mt-[24px]">현재 비밀번호</h2>
            <input type="password" className="border-2"/>
            <h2 className="mt-[24px]">새로운 비밀번호</h2>
            <input type="password" className="border-2"/>
            <h2 className="mt-[24px]">새로운 비밀번호 확인</h2>
            <input type="password" className="border-2"/>
            <button className="btn block w-[100%] mt-[24px] bg-orange-500 text-white">확인</button>
        </div>
    )
}