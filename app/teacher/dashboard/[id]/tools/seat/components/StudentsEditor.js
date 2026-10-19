"use client";
// 학생: 자리 바꾸기에 넣을 학생 고르기 (전학·장기 결석 등은 빼기). 뺀 학생은 섞을 때 자리가 없다.
export default function StudentsEditor({ students, excluded, setExcluded }) {
  const out = new Set(excluded);
  const toggle = (u) => setExcluded(out.has(u) ? excluded.filter((x) => x !== u) : [...excluded, u]);
  const joined = students.length - students.filter((s) => out.has(s.userId)).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">이름을 눌러 자리 바꾸기에서 빼거나 다시 넣으세요.</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-orange-700">참여 {joined}명</span>
          <span className="text-gray-400">· 제외 {students.length - joined}명</span>
          {excluded.length > 0 && (
            <button type="button" className="ml-1 text-gray-400 underline hover:text-gray-600" onClick={() => setExcluded([])}>
              모두 참여
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {students.map((s) => {
          const isOut = out.has(s.userId);
          return (
            <button
              key={s.userId}
              type="button"
              aria-pressed={!isOut}
              onClick={() => toggle(s.userId)}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left transition ${
                isOut ? "border-dashed border-gray-200 bg-gray-50 text-gray-400" : "border-orange-300 bg-orange-50 text-gray-800"
              }`}
            >
              <span className={`text-sm ${isOut ? "" : "text-orange-500"}`}>{s.classNumber}번</span>
              <span className={`min-w-0 flex-1 truncate font-bold ${isOut ? "line-through" : ""}`}>{s.profileNickname}</span>
              <span className="text-xs">{isOut ? "제외" : "참여"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
