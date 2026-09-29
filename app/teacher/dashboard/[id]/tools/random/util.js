export default function homeUtils({setStudentArr, setIsSelectedAll, studentArr, setIsSend}) {



    const onClick = (a) => {
        setStudentArr((prev) => {
            return prev.map(obj =>
                obj._id === a._id ? { ...obj, isactive: !a.isactive } : obj
            );
        });
    }
    const selectAll = () => {
        setIsSelectedAll(true)
        setStudentArr((prev) => {
            return prev.map(obj =>
                ({ ...obj, isactive: true }))
        })
    }
    const clearAll = () => {
        setIsSelectedAll(false)
        setStudentArr((prev) => {
            return prev.map(obj =>
                ({ ...obj, isactive: false }))
        })
    }
    const onSend = () => {
        if (studentArr.filter((a) => a.isactive === true).length === 0) {
            alert('학생을 선택해주세요')
            return
        }
        setIsSend(true);
        document.getElementById('modal').showModal();
    }
    const onTake = () => {
        if (studentArr.filter((a) => a.isactive === true).length === 0) {
            alert('학생을 선택해주세요')
            return
        }
        setIsSend(false);
        document.getElementById('modal').showModal();
    }
    return { onClick, selectAll, clearAll, onSend, onTake }
}