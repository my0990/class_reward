export default function AddModal() {
    return (
        <dialog id="my_modal_2" className="modal sm:modal-bottom modal-middle">
            <div className="modal-box px-0">
            <div className=" flex justify-center p-0">
            <div className="overflow-x-auto w-[1024px]">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr >
                            <th className="">아이템 <br />이름</th>
                            <th className="">가격</th>
                            <th className="">수량</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>


                                <tr>
                                    <th><input className=""></input></th>
                                    <td><input className=""></input></td>
                                    <td><input className=""></input></td>

                                    <td className="flex justify-center flex-wrap">
                                        <button className="btn bg-orange-300">추가</button>
                                        {/* <button className="btn mr-0 min-[443px]:mr-1 min-[443px]:mb-2 bg-orange-300">수정</button>
                                    <button className="btn bg-red-300">삭제</button> */}
                                    </td>
                                </tr>
                            


                    </tbody>

                </table>


            </div>
        </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

    )
}