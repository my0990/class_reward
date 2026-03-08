


import ManageContainer from "./Manage.container";
export default async function Page() {


    return (
        <div className="flex justify-center  p-[32px]">

            <div className=" bg-orange-100 p-[32px] rounded-xl">
                <h1 className="text-[2.5rem] font-bold">학생 계정 관리😊</h1>
                {/* <ManageStudentAccount classId={id}/>  */}
                <ManageContainer />
            </div>
        </div>
    )
}