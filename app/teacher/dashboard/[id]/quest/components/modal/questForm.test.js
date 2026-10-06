import { describe, it, expect } from "vitest";
import { questToInput, inputToQuest, EMPTY_QUEST_INPUT } from "./questForm.js";

describe("퀘스트 입력값 변환", () => {
  it("서버 값 → 입력값: 0이나 없는 보상은 빈 칸", () => {
    expect(questToInput(null)).toEqual(EMPTY_QUEST_INPUT);
    expect(questToInput({ questName: "숙제", questGoal: "제출", questReward: 100, questExp: 0, questTitle: "" })).toEqual({
      questName: "숙제", questGoal: "제출", questReward: "100", questExp: "", questTitle: "",
    });
  });

  it("입력값 → 서버 값: 앞뒤 공백 정리, 빈 숫자는 0", () => {
    expect(inputToQuest({ questName: " 숙제 ", questGoal: "제출 ", questReward: "", questExp: "30", questTitle: " 성실왕 " })).toEqual({
      questName: "숙제", questGoal: "제출", questReward: 0, questExp: 30, questTitle: "성실왕",
    });
  });

  it("이름·목표가 비면 오류", () => {
    expect(inputToQuest({ ...EMPTY_QUEST_INPUT, questGoal: "x" }).error).toMatch(/이름/);
    expect(inputToQuest({ ...EMPTY_QUEST_INPUT, questName: "x" }).error).toMatch(/목표/);
  });
});
