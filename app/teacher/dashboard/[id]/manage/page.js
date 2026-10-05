import ManageContainer from "./Manage.container";

export default async function Page() {
    return (
        <div className="flex justify-center p-[12px] sm:p-[32px]">
            {/* min-w-0: 안쪽 표가 넓어도 화면 밖으로 밀려나지 않게 */}
            <div className="w-full max-w-[1000px] min-w-0 rounded-xl bg-orange-100 p-[16px] sm:p-[32px]">
                <h1 className="mb-[8px] text-[1.6rem] font-bold sm:text-[2.5rem]">학생 계정 관리😊</h1>
                <ManageContainer />
            </div>
        </div>
    )
}
