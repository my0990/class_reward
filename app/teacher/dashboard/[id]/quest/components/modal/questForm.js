// 퀘스트 입력값 ↔ 서버 값 변환 (QuestFormModal에서 사용, 테스트하기 쉽게 분리)
import { normalizeRepeat } from "@/util/quest/questRepeat";

export const EMPTY_QUEST_INPUT = { questName: "", questGoal: "", questReward: "", questExp: "", questTitle: "", repeat: "none" };

/** 서버 데이터(퀘스트) → 입력값 */
export function questToInput(quest) {
  if (!quest) return EMPTY_QUEST_INPUT;
  const num = (v) => (Number(v) > 0 ? String(Number(v)) : "");
  return {
    questName: quest.questName ?? "",
    questGoal: quest.questGoal ?? "",
    questReward: num(quest.questReward),
    questExp: num(quest.questExp),
    questTitle: quest.questTitle ?? "",
    repeat: normalizeRepeat(quest.repeat),
  };
}

/** 입력값 → 서버로 보낼 값 (검사 실패면 { error }) */
export function inputToQuest(input) {
  const questName = input.questName.trim();
  const questGoal = input.questGoal.trim();
  if (!questName) return { error: "퀘스트 이름을 입력해 주세요." };
  if (!questGoal) return { error: "퀘스트 목표를 입력해 주세요." };
  return {
    questName,
    questGoal,
    questReward: input.questReward === "" ? 0 : Number(input.questReward),
    questExp: input.questExp === "" ? 0 : Number(input.questExp),
    repeat: normalizeRepeat(input.repeat),
    // 일일·주간 퀘스트는 칭호를 줄 수 없다
    questTitle: normalizeRepeat(input.repeat) === "none" ? input.questTitle.trim() : "",
  };
}
