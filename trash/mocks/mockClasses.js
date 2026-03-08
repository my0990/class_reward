export const mockClasses = [
    {
      _id: "class_1",
      className: "1학년 1반",
      grade: 1,
      teacherId: "teacher_1",
  
      students: [
        { _id: "stu_1", name: "김민준", point: 120 },
        { _id: "stu_2", name: "이서연", point: 95 },
        { _id: "stu_3", name: "박지훈", point: 70 },
      ],
  
      seating: {
        rows: 3,
        cols: 4,
        layout: [
          ["stu_1", null, "stu_2", null],
          [null, "stu_3", null, null],
          [null, null, null, null],
        ],
      },
  
      createdAt: new Date(),
    },
  
    {
      _id: "class_2",
      className: "2학년 3반",
      grade: 2,
      teacherId: "teacher_1",
  
      students: [
        { _id: "stu_4", name: "최유진", point: 200 },
        { _id: "stu_5", name: "정우성", point: 150 },
      ],
  
      seating: {
        rows: 4,
        cols: 5,
        layout: [
          ["stu_4", null, null, null, null],
          [null, "stu_5", null, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
        ],
      },
  
      createdAt: new Date(),
    },
  
    {
      _id: "class_3",
      className: "3학년 2반",
      grade: 3,
      teacherId: "teacher_1",
  
      students: [
        { _id: "stu_6", name: "한지민", point: 60 },
        { _id: "stu_7", name: "오지훈", point: 80 },
      ],
  
      seating: {
        rows: 2,
        cols: 3,
        layout: [
          ["stu_6", null, "stu_7"],
          [null, null, null],
        ],
      },
  
      createdAt: new Date(),
    },
  ];