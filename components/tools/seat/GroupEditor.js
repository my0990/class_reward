"use client";
// 조건 > 그룹: 그룹을 만들고 → 학생을 넣고 → 그 그룹 학생이 앉을 수 있는 자리를 고른다.
// 한 학생이 여러 그룹에 들어갈 수 있다 (그때는 모든 그룹 자리가 겹치는 곳에만 앉음).
// 그룹 자리에 다른 학생이 앉는 건 막지 않는다.
import { GROUP_COLORS, groupLimits } from "@/util/seat/seatAlgorithm";
import GroupSeatPicker from "./GroupSeatPicker";

const GROUP_MAX = 20;

export default function GroupEditor({ groups, setGroups, layout, students, name }) {
  const update = (i, patch) => setGroups(groups.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  const remove = (i) => setGroups(groups.filter((_, j) => j !== i));
  const add = () => {
    const used = new Set(groups.map((g) => g.color));
    const color = GROUP_COLORS.findIndex((_, k) => !used.has(k));
    setGroups([
      ...groups,
      { id: `g${Date.now().toString(36)}`, name: `그룹 ${groups.length + 1}`, color: color < 0 ? groups.length % GROUP_COLORS.length : color, userIds: [], seats: [] },
    ]);
  };

  // 여러 그룹에 든 학생 중 겹치는 자리가 없는 학생 (바로 알려 준다)
  const limits = groupLimits(groups);
  const noOverlap = Object.entries(limits).filter(([, l]) => l.groups.length > 1 && l.seats.size === 0);

  return (
    <div className="space-y-3">
      {groups.length === 0 && <p className="text-sm text-gray-400">아직 그룹이 없습니다.</p>}
      {groups.map((g, i) => {
        const color = GROUP_COLORS[g.color] ?? GROUP_COLORS[0];
        const short = g.seats.length > 0 && g.userIds.length > g.seats.length;
        return (
          <div key={g.id} className="rounded-xl border-2 p-3" style={{ borderColor: color }}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: color }} />
              <input
                className="input input-bordered input-sm w-40 font-bold"
                value={g.name}
                maxLength={20}
                onChange={(e) => update(i, { name: e.target.value })}
                aria-label="그룹 이름"
              />
              <div className="flex gap-1">
                {GROUP_COLORS.map((c, k) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`색 ${k + 1}`}
                    onClick={() => update(i, { color: k })}
                    className={`h-5 w-5 rounded-full ${g.color === k ? "ring-2 ring-gray-700 ring-offset-1" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span className={`text-sm ${short ? "font-bold text-red-500" : "text-gray-500"}`}>
                학생 {g.userIds.length}명 · 자리 {g.seats.length}개
              </span>
              <button type="button" className="ml-auto text-sm text-gray-400 hover:text-red-500" onClick={() => remove(i)}>
                그룹 삭제
              </button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <p className="mb-1 text-sm text-gray-500">① 학생 (이름을 눌러 넣고 빼기)</p>
                <div className="flex flex-wrap gap-1">
                  {students.map((s) => {
                    const on = g.userIds.includes(s.userId);
                    return (
                      <button
                        key={s.userId}
                        type="button"
                        onClick={() => update(i, { userIds: on ? g.userIds.filter((u) => u !== s.userId) : [...g.userIds, s.userId] })}
                        className={`rounded-full px-2 py-1 text-sm ${on ? "text-white" : "bg-orange-50 text-gray-600"}`}
                        style={on ? { background: color } : undefined}
                      >
                        {name(s.userId)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">② 앉을 수 있는 자리 (누르거나 드래그, 위쪽이 칠판)</p>
                <GroupSeatPicker layout={layout} seats={g.seats} color={color} onChange={(seats) => update(i, { seats })} />
                {/* 자리를 고르면 글자만 숨긴다 (자리는 그대로 차지 → 아래 내용이 움직이지 않음) */}
                <p className={`mt-1 text-xs text-gray-400 ${g.seats.length ? "invisible" : ""}`}>자리를 고르기 전에는 조건으로 쓰지 않아요.</p>
              </div>
            </div>
          </div>
        );
      })}

      {noOverlap.length > 0 && (
        <p className="text-sm text-red-500">
          {noOverlap.map(([u, l]) => `${name(u)}(${l.groups.join(", ")})`).join(", ")}: 속한 그룹들의 자리가 겹치는 곳이 없어요.
        </p>
      )}

      <button type="button" className="btn btn-sm border-0 bg-orange-500 text-white" disabled={groups.length >= GROUP_MAX} onClick={add}>
        + 그룹 추가
      </button>
    </div>
  );
}
