export default function Password() {
    return (
        <div className="flex m-[20px] min-[600px]:p-[20px]  w-[280px] justify-center flex-col">
            <h1 className="text-[2rem]">계정 관리</h1>
            <div>
                <h2 className="mt-[24px]">현재 비밀번호</h2>
                <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" />
            </div>
            <div>
                <h2 className="mt-[24px]">새로운 비밀번호</h2>
                <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" />
            </div>
            <div>
                <h2 className="mt-[24px]">새로운 비밀번호 확인</h2>
                <input type="password" className="border-2 focus:outline-orange-500 w-[100%]" />
            </div>
            <button className="btn block w-[100%] mt-[24px] bg-orange-500 text-white">확인</button>
        </div>
    )
}