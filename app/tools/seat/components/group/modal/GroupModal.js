
import EditGrouop from "./EditGroup";
import GroupModalList from "./GroupModalList";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function GroupModal({ isModalOpen }) {
    const [isListPage, setIsListPage] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState({groupKey: null, selectedGroup: {}});
    const onCancel = (e) => {
        e.preventDefault();
        isModalOpen.current = false;
        setIsListPage(true);
        document.getElementById('groupModal').close()
    }



    return (
        <div>
            <dialog id="groupModal" className="modal">

                <div className="modal-box min-w-[1000px] bg-gray-100 min-h-[600px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                        {isListPage ? (
                            <motion.div
                                key="b"
                                initial={{ opacity: 0, filter: "brightness(0.8)" }}
                                animate={{ opacity: 1, filter: "brightness(1)" }}
                                exit={{ opacity: 0, filter: "brightness(0.8)" }}
                                transition={{ duration: 0.2 }}
                            // style={boxStyle("#2ecc71")}
                            >
                                <GroupModalList setIsListPage={setIsListPage} setSelectedGroup={setSelectedGroup}/>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="a"
                                initial={{ opacity: 0, filter: "brightness(0.8)" }}
                                animate={{ opacity: 1, filter: "brightness(1)" }}
                                exit={{ opacity: 0, filter: "brightness(0.8)" }}
                                transition={{ duration: 0.2 }}
                            // style={boxStyle("#e74c3c")}
                            >
                                <EditGrouop setIsListPage={setIsListPage} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* {isListPage ? <GroupModalList setIsListPage={setIsListPage} /> : <EditGrouop setIsListPage={setIsListPage} />} */}

                    {/* <div className="flex justify-center mt-[16px]">
                        <form >
                            <button className="btn bg-red-500 text-white mr-[8px]">확인</button>
                        </form>
                        <form>
                            <button className="btn" onClick={onCancel}>취소</button>
                        </form>
                    </div> */}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCancel}>close</button>
                </form>
            </dialog>
        </div>
    )
}