export default function Profile() {
    return (
        <div className="flex p-[20px] min-[600px]:p-[40px] max-[601px]:w-[100%] justify-center">
            <div className="text-[1.1rem] ">
                <h1 className="text-[2rem] mb-[24px]">프로필</h1>
                <div className="avatar w-[100%] justify-center cursor-pointer">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                    </div>
                </div>
                <h2 className="mt-[24px]">프로필 별명</h2>
                <input className="border-2 w-[100%]" />
                <h2 className="mt-[24px]">프로필 상태 메시지</h2>
                <textarea className="border-2 w-[100%]" />
                <button className="btn bg-orange-500 text-white block border-0 mt-[24px] w-[100%]">확인</button>
            </div>

        </div>
    )
}