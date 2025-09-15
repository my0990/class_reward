

function getGroupKey(groups) {
  return groups.slice().sort().join("|");
}

function isSubsetKey(studentKey, seatKey) {
  if (!studentKey) return true; // 그룹 없는 학생은 어디든 가능
  const studentGroups = studentKey.split("|");
  const seatGroups = seatKey.split("|");
  return studentGroups.every(g => seatGroups.includes(g));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isPossible(nextArr, groupCombFromStudent) {
  for (const [key, arr] of Object.entries(nextArr)) {
    if ((arr.length || 0) < groupCombFromStudent[key].length) {
      return false;
    }
  }
  return true;
}


export function getGroupCombFromGrid({ gridData }) {
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

export function getGroupCombFromStudent({ groupData, studentData }) {

  const studentGroupsMap = {};

  // 1. 학생마다 어떤 그룹에 속해있는지 정리
  for (const [groupKey, data] of Object.entries(groupData)) {
    for (const student of data.groupMember) {
      console.log(student)
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



// export function buildAvailableSeatsForStudents(studentsByKey, seatsByKey) {
export function buildAvailableSeatsForStudents({ groupCombFromStudent, groupCombFromGrid }) {


  const availableSeatsByKey = {};
  for (const studentKey in groupCombFromStudent) {
    const allSeats = [];

    for (const seatKey in groupCombFromGrid) {
      if (isSubsetKey(studentKey, seatKey)) {
        allSeats.push(...groupCombFromGrid[seatKey]);
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



export function combinationCount(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k); // 대칭성 이용
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - i + 1)) / i;
  }
  return Math.round(result);
}





export function* getSeatCombinations(arr, k) {
  const n = arr.length;
  let count = 0;
  function* helper(start, combo) {

    if (combo.length === k) {
      count++;
      yield [...combo];
      return;
    }
    const need = k - combo.length;

    for (let i = start; i <= n - need; i++) {
      combo.push(arr[i]);
      yield* helper(i + 1, combo);
      combo.pop();
    }
  }

  yield* helper(0, []);
}

export function seatChangeStart({ groupData, gridData, studentData, stopRef, setRunning, setTotal, genRef, setProgress, setResult, setIsStarted, setError }) {
  const assignments = {};
  // 1. 그룹 조합별 학생 및 자식 배열 생성하기
  if (!groupData) {
    groupData = [];
  }
  console.log(groupData);
  const groupCombFromStudent = getGroupCombFromStudent({ groupData, studentData });
  const total = Object.keys(groupCombFromStudent).length;
  const groupCombFromGrid = getGroupCombFromGrid({ gridData });
  const availableSeatsForStudents = buildAvailableSeatsForStudents({ groupCombFromStudent: groupCombFromStudent, groupCombFromGrid: groupCombFromGrid });


  //순서 가지치기
  const entries = Object.entries({ ...availableSeatsForStudents });
  const sortedGroupCombFromStudent = entries.sort(([, a], [, b]) => a.length - b.length);
  const groupKeys = sortedGroupCombFromStudent.map((a) => a[0])
  const CHUNK_SIZE = 50; // 한 번에 처리할 조합 개수
  const run = () => {
    if (!genRef.current || stopRef.current) {
      setRunning(false);
      return;
    }

    for (let i = 0; i < CHUNK_SIZE; i++) {
      const next = genRef.current.next();
      if (next.done) {
        setRunning(false);
        return;
      }

    }

    setTimeout(run, 0); // UI 반응 유지
  };

  run();

  function backtrack(idx, seatArr) {


    if (idx === total) return true;
    const key = groupKeys[idx]
    const k = groupCombFromStudent[key].length


    stopRef.current = false;
    setRunning(true);
    setTotal(combinationCount(seatArr[key].length, k));
    genRef.current = getSeatCombinations(shuffle(seatArr[key]), k, (count) => setProgress(count));




    for (const chosenSeatArr of genRef.current) {

      if (stopRef.current) {
        console.log("사용자 요청으로 중단됨!");
        break;
      }
      const valuesToRemove = new Set(chosenSeatArr);
      const nextArr = {}
      Object.entries(seatArr).forEach(([key, arr]) => {
        nextArr[key] = arr.filter(v => !valuesToRemove.has(v));
      });
      delete nextArr[key]
      assignments[key] = chosenSeatArr;
      if (isPossible(nextArr, groupCombFromStudent) &&
        backtrack(idx + 1, nextArr)) {
        return true;
      }
      delete assignments[key];
    }



  }
  if (backtrack(0, availableSeatsForStudents)) {
    const maxX = gridData[0].length - 1;
    const maxY = gridData.length - 1;
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
    setResult(grid);
    setIsStarted(true);
  } else {
    setError('가능한 조합이 없습니다!')
  }

}

export const stop = (stopRef) => {
  stopRef.current = true;
};
