import { useState, useRef, useEffect } from "react";
import { GeneralTab, AccountTab, SecurityTab } from "./tab/tabLlist";
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { mutate } from "swr";

const tabs = [
    { id: "general", label: "스타일", },
    { id: "account", label: "학생 관리", },
    // { id: "security", label: "테마", },
];
export default function SetModal({ classData, studentData}) {
    const [activeTab, setActiveTab] = useState("general");
    const containerRef = useRef(null);

    // const { setting } = classData;

    const [isLoading, setIsLoading] = useState(false);

    const setting = classData?.setting ?? { result: 0, color: "#fdba74" };



    const onSettingSave = () => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true);

            fetch("/api/editSetting", {
                method: "POST",
                body: JSON.stringify({ setting: setting }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {


                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {

                            return { ...prev, setting: setting }
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
                    document.getElementById("setModal").close();
                }
            })
        }
    }



    

    const onCancel = (e) => {
        e.preventDefault();
        document.getElementById("setModal").close();

    }








    return (
        <div>
            <dialog id="setModal" className="modal" >
                <div className="modal-box min-w-[1000px] relative pt-[56px] h-[640px] flex flex-col justify-between p-[40px] overflow-hidden">
                    <div onClick={onCancel} className="absolute top-[12px] right-[12px] cursor-pointer transition-all hover:scale-110 hover:bg-orange-200 rounded-full p-[4px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div className="flex">
                        <aside className="w-64 bg-white border-r border-gray-200 p-4">
                            <h2 className="text-lg font-semibold mb-4">설정</h2>
                            <nav className="flex flex-col gap-1">
                                {tabs.map(({ id, label, }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition
                                            ${activeTab === id
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {/* <Icon className="w-5 h-5" /> */}
                                        {label}
                                    </button>
                                ))}
                            </nav>
                        </aside>
                        <main ref={containerRef} className={`flex-1  p-8 h-[480px] overflow-scroll scrollbar`}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === "general" && <GeneralTab setting={setting} classData={classData}  />}
                                    {activeTab === "account" && <AccountTab studentData={studentData} classData={classData}/>}
                                    {/* {activeTab === "security" && <SecurityTab />} */}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                    <div className="flex justify-center mt-[16px]  print:hidden">
                        <button className="btn bg-orange-300 w-[240px]" onClick={onSettingSave}>저장</button>
                        {/* <button className="btn bg-red-500">취소</button> */}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCancel}>close</button>
                </form>
            </dialog>
        </div>
    )
}