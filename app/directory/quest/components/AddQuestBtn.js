'use client'
export default function AddQuestBtn() {
    return (
        <div className="p-[16px] w-[100%] border-4 border-orange-500 rounded-xl mt-[24px] border-dashed cursor-pointer" onClick={() => document.getElementById('my_modal_2').showModal()}>
            <div className="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24">
                    <path style={{ fill: "rgb(249 115 22)" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
                </svg>
            </div>
        </div>


    )
}