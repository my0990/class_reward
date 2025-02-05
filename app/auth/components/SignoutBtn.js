'use client'
export default function SignoutBtn() {
    return (
        <div>
            <button className="rounded-[20px] border-2 py-[4px] px-[8px] text-gray-500 border-gray-300 flex" onClick={() => signOut()}>다시 클릭하기
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="ml-[4px] text-gray-500">
                    <path d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
            </button>
        </div>
    )
}