'use client'

import { useRouter } from "next/navigation";
export default function NotificationTemplate({ data, userId }) {
    const router = useRouter();
    const onSubmit = (e, a) => {
        e.preventDefault();
        fetch("/api/deleteNotification  ", {
            method: "POST",
            body: JSON.stringify({ item: a }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            console.log(data)
            if (data.result === true) {
                router.refresh();
            }
        })
    }
    const onClearAll = (e) => {
        e.preventDefault();
        fetch("/api/deleteNotificationAll  ", {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                router.refresh();
            }
        })
    }
    return (
        <div className=" flex justify-center">
            <div className="overflow-x-auto w-[1024px]">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th className="max-[443px]:hidden"></th>
                            <th>아이템 <br></br>이름</th>
                            <th>사용자</th>
                            <th className="flex justify-center">
                                <button onClick={onClearAll} className="btn bg-red-500 text-white">모두 확인</button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((a, i) => {
                            return (
                                <tr className="hover" key={i}>
                                    <th className="max-[443px]:hidden">{i}</th>
                                    <th>{a.itemName}</th>
                                    <td>{a.userId}</td>
                                    <td className="flex justify-center">

                                        <form onSubmit={(e) => onSubmit(e, a)}>
                                            <button className="btn bg-red-500 text-white">확인</button>
                                        </form>

                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

            </div>
        </div>
    )
}