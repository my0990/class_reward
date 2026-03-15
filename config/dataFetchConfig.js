export function dataFetchConfig({ classId, types = [] }) {

    const configMap = {
      classData: { key: "classData", url: `/api/classData/${classId}` },
      studentsData: { key: "studentsData", url: `/api/students/${classId}` },
      userData: { key: "userData", url: `/api/user` },
      questsData: { key: "questsData", url: `/api/fetchQuestList/${classId}` },
      attendanceData: { key: "attendanceData", url: `/api/attendance/${classId}` },
    };
  
    return types
      .filter((key) => configMap[key])
      .map((key) => configMap[key]);
  }