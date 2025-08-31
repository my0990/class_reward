function getGroupKey(groups) {
  return groups.slice().sort().join("|");
}





function getGroupCombFromGrid({ gridData }) {
  const map = {};
  for (let row = 0; row < gridData.length; row++) {
    for (let col = 0; col < gridData[row].length; col++) {
      const desk = gridData[row][col];
      const deskGroups = desk.groups;

      // 해당 책상에 학생이 이미 앉아있으면 제외
      if (!desk.isOpen) continue;
      const key = getGroupKey(desk.group);
      if (!map[key]) map[key] = [];
      map[key].push([row, col]);
    }
  }
  return map;
}

function getGroupCombFromStudent({ groupData, studentData }) {

  const studentGroupsMap = {};

  // 1. 학생마다 어떤 그룹에 속해있는지 정리
  for (const [groupKey, data] of Object.entries(groupData)) {
    for (const student of data.groupMember) {
      if (!studentGroupsMap[student.userId]) {
        studentGroupsMap[student.userId] = new Set();
      }
      studentGroupsMap[student.userId].add(groupKey);
    }
  }
  // 2. 그룹 조합별로 학생 정리
  const combinationMap = {};

  for (const [student, groups] of Object.entries(studentGroupsMap)) {
    const sortedGroups = [...groups].sort(); // 항상 동일한 순서로
    const key = sortedGroups.join('|');

    if (!combinationMap[key]) {
      combinationMap[key] = [];
    }
    combinationMap[key].push(student);
  }


  const assignedIds = new Set(
    Object.values(combinationMap).flat() // 2차원 → 1차원
  );

  // 2. 그룹에 속하지 않은 학생 찾기

  const ungrouped = studentData
    .map(s => s.userId)
    .filter(id => !assignedIds.has(id));

  // 3. "" 키에 추가
  if (!combinationMap[""]) combinationMap[""] = [];
  combinationMap[""].push(...ungrouped);
  return combinationMap;
}

function isSubsetKey(studentKey, seatKey) {
  if (!studentKey) return true; // 그룹 없는 학생은 어디든 가능
  const studentGroups = studentKey.split("|");
  const seatGroups = seatKey.split("|");
  return studentGroups.every(g => seatGroups.includes(g));
}



function buildAvailableSeatsForStudents(studentsByKey, seatsByKey) {
  const availableSeatsByKey = {};
  for (const studentKey in studentsByKey) {
    const allSeats = [];

    for (const seatKey in seatsByKey) {
      if (isSubsetKey(studentKey, seatKey)) {
        allSeats.push(...seatsByKey[seatKey]);
      }
    }

    // 중복 제거
    const seen = new Set();
    availableSeatsByKey[studentKey] = allSeats.filter(seat => {
      const s = seat.toString();
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  }

  return availableSeatsByKey;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getSeatCombinations(seatArr, k) {
  console.log(seatArr, k)
  const results = [];
  const arr = [...seatArr]
  function helper(start, combo) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return shuffle(results);
}







function assignSeatsByGroupKey(groupCombFromStudent, groupCombFromGrid) {
  const assignments = {};
  const total = Object.keys(groupCombFromStudent).length;

  const availableSeatsForStudents = buildAvailableSeatsForStudents(groupCombFromStudent, groupCombFromGrid)




  //순서
  const entries = Object.entries({ ...availableSeatsForStudents });
  const sortedGroupCombFromStudent = entries.sort(([, a], [, b]) => a.length - b.length);
  const groupKeys = sortedGroupCombFromStudent.map((a) => a[0])

  function isPossible(nextArr) {
    for (const [key, arr] of Object.entries(nextArr)) {
      if ((arr.length || 0) < groupCombFromStudent[key].length) {
        return false;
      }
    }
    return true;
  }

  // idx로 단계 판단하기
  function backtrack(idx, seatArr) {
    console.log(idx)
    if (idx === total) return true;
    const key = groupKeys[idx]
    const combinations = getSeatCombinations(seatArr[key], groupCombFromStudent[key].length)
      .sort(() => Math.random() - 0.5);

    console.log(combinations)
    for (const chosenSeatArr of combinations) {
      const valuesToRemove = new Set(chosenSeatArr);
      const nextArr = {}
      Object.entries(seatArr).forEach(([key, arr]) => {
        nextArr[key] = arr.filter(v => !valuesToRemove.has(v));
      });
      delete nextArr[key]
      assignments[key] = chosenSeatArr;

      if (isPossible(nextArr) &&
        backtrack(idx + 1, nextArr)) {
        return true;
      }
      delete assignments[key];
    }

    // return false;
  }
  if (backtrack(0, availableSeatsForStudents)) {
    return assignments
  }

}

export function seatChangeStart({ groupData, gridData, studentData, setAssignments }) {
  const groupCombFromStudent = getGroupCombFromStudent({ groupData, studentData })
  const assignments = assignSeatsByGroupKey(
    groupCombFromStudent,
    getGroupCombFromGrid({ gridData }),
  );



  const maxX = gridData[0].length-1;
  const maxY = gridData.length-1;
  // 2️⃣ 빈 2D 배열 생성
  const grid = Array.from({ length: maxY + 1 }, () => Array(maxX + 1).fill(null));

  // 3️⃣ 그룹별로 학생 랜덤 배치
  Object.keys(assignments).forEach(key => {
    const coords = assignments[key];
    const students = [...groupCombFromStudent[key]];

    // 그룹 내부에서만 랜덤 섞기
    for (let i = students.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [students[i], students[j]] = [students[j], students[i]];
    }

    // 그룹 좌표에만 배치
    coords.forEach(([x, y], i) => {
      if (students[i]) grid[x][y] = students[i];
    });
  });
  setAssignments(grid);
  return grid;
}
































// 유틸 함수: 가능한 자리를 캐시합니다.
function getValidPositionsForStudent(student, gridData, studentGroups, cache) {
  const key = student.userId;
  if (cache[key]) return cache[key];

  const positions = [];
  for (let row = 0; row < gridData.length; row++) {
    for (let col = 0; col < gridData[row].length; col++) {
      const seat = gridData[row][col];
      if (!seat.isOpen) continue;

      const seatGroups = seat.group || [];
      const studentGroupKeys = studentGroups[student.userId] || [];

      if (studentGroupKeys.length === 0) {
        // 그룹 없는 학생은 어떤 자리든 가능
        positions.push({ row, col });
      } else if (
        seatGroups.length >= studentGroupKeys.length &&
        studentGroupKeys.every(g => seatGroups.includes(g))
      ) {
        // 자리에 학생이 속한 모든 그룹이 포함되어야 함
        positions.push({ row, col });
      }
    }
  }

  cache[key] = positions;
  return positions;
}

// 예시: s1 학생이 가능한 자리 출력
// console.log(getValidPositionsForStudent({userId:'s1'}, gridData, studentGroups, {}));


// 학생별 그룹 매핑 추출
function extractStudentGroups(groupData) {
  const result = {};
  for (const groupKey in groupData) {
    const members = groupData[groupKey].groupMember || [];
    members.forEach(({ userId }) => {
      if (!result[userId]) result[userId] = [];
      result[userId].push(groupKey);
    });
  }
  return result;
}

// 예시: studentGroups['s1'] → ['g1', 'g2']


// 우선순위 큐 정렬용: 제약 강도 측정
function sortStudentsByConstraints(studentData, gridData, studentGroups) {
  const cache = {};
  return [...studentData].map(student => {
    const valid = getValidPositionsForStudent(student, gridData, studentGroups, cache);
    return { ...student, constraints: valid.length };
  }).sort((a, b) => a.constraints - b.constraints || Math.random() - 0.5); // 랜덤성 포함
}


// 자리 수 부족 사전 확인
function isAssignable(studentData, gridData, studentGroups) {
  const cache = {};
  const seatMap = Array(gridData.length).fill(null).map(() => Array(gridData[0].length).fill(false));
  let totalAvailable = 0;

  for (const student of studentData) {
    const validPositions = getValidPositionsForStudent(student, gridData, studentGroups, cache);
    if (validPositions.length === 0) return false;
    totalAvailable += validPositions.length;
  }

  return totalAvailable >= studentData.length;
}


// 메인 백트래킹 함수
export function assignSeatsWithPriorityQueue(gridData, studentData, groupData) {
  const studentGroups = extractStudentGroups(groupData);
  const students = sortStudentsByConstraints(studentData, gridData, studentGroups);
  const result = Array(gridData.length).fill(null).map(() => Array(gridData[0].length).fill(null));
  const used = new Set();
  const cache = {};

  function backtrack(index) {
    if (index === students.length) return true;

    const student = students[index];
    const validPositions = getValidPositionsForStudent(student, gridData, studentGroups, cache)
      .filter(pos => !used.has(`${pos.row}-${pos.col}`));

    // 랜덤 셔플
    for (let i = validPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validPositions[i], validPositions[j]] = [validPositions[j], validPositions[i]];
    }

    for (const { row, col } of validPositions) {
      used.add(`${row}-${col}`);
      result[row][col] = student;

      if (backtrack(index + 1)) return true;

      used.delete(`${row}-${col}`);
      result[row][col] = null;
    }

    return false;
  }

  if (!isAssignable(studentData, gridData, studentGroups)) {
    console.warn("조건상 자리가 부족하거나 충돌 발생");
    return null;
  }

  const success = backtrack(0);
  return success ? result : null;

}


// ✅ 사용 예시
/*
const assigned = assignSeatsWithPriorityQueue(gridData, studentData, groupData);
console.log(assigned);
*/

