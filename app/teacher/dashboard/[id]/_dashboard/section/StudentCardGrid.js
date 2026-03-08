import StudentInfoCard from "../widget/StudentInfoCard"
export default function StudentCardGrid({studentsData, currencyEmoji, isStudentActive, toggleStudent, levelMap}) {
    return (
        <div className="flex flex-wrap">
            {studentsData.map((student) => {
                const level = levelMap?.[student.userId] ?? 1
                return (
                    <StudentInfoCard
                        key={student.userId}
                        data={student}
                        level={level}
                        currencyemoji={currencyEmoji}
                        isActive={isStudentActive(student)}
                        onClick={() => toggleStudent(student)}

                    />
                )
            })}
        </div>
    )
}