"use server";
import { authorizeTeacherClass, getTeacherId } from "@/lib/auth/actionAuth";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  createQuestService,
  editQuestService,
  deleteQuestService,
  resetQuestService,
  finishQuestService,
  reorderQuestsService,
} from "@/server-action/service/quest/quest.service";


export async function createQuest({
  classId,
  questName,
  questGoal,
  questReward,
  questExp,
  questTitle,
}) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) {
    return { result: false, message: auth.message };
  }
  const teacher_id = auth.teacher_id;

  try {
    return await createQuestService({
      teacher_id,
      classId,
      questName,
      questGoal,
      questReward,
      questExp,
      questTitle,
    });
  } catch (err) {
    return { result: false, message: err?.message || "퀘스트 추가에 실패했습니다." };
  }
}

export async function editQuest({
  classId,
  questId,
  questName,
  questGoal,
  questReward,
  questExp,
  questTitle,
}) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) {
    return { result: false, message: auth.message };
  }
  const teacher_id = auth.teacher_id;

  try {
    return await editQuestService({
      teacher_id,
      classId,
      questId,
      questName,
      questGoal,
      questReward,
      questExp,
      questTitle,
    });
  } catch (err) {
    return { result: false, message: err?.message || "퀘스트 수정에 실패했습니다." };
  }
}

export async function deleteQuest({ classId, questId }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) {
    return { result: false, message: auth.message };
  }
  const teacher_id = auth.teacher_id;

  try {
    return await deleteQuestService({ teacher_id, classId, questId });
  } catch (err) {
    return { result: false, message: err?.message || "퀘스트 삭제에 실패했습니다." };
  }
}

export async function resetQuest({ classId, questId }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) {
    return { result: false, message: auth.message };
  }
  const teacher_id = auth.teacher_id;

  try {
    return await resetQuestService({ teacher_id, classId, questId });
  } catch (err) {
    return { result: false, message: err?.message || "퀘스트 초기화에 실패했습니다." };
  }
}

export async function finishQuest({ classId, questData, rewarded }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) {
    return { result: false, message: auth.message };
  }
  const teacher_id = auth.teacher_id;

  try {
    return await finishQuestService({ teacher_id, classId, questData, rewarded });
  } catch (err) {
    return { result: false, message: err?.message || "지급에 실패했습니다." };
  }
}

// 퀘스트 순서 바꾸기 (드래그)
export async function reorderQuests({ classId, orderedIds }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) {
    return { result: false, message: auth.message };
  }
  try {
    await reorderQuestsService({ teacher_id: auth.teacher_id, classId, orderedIds });
    return { result: true, message: "순서를 바꿨습니다." };
  } catch (err) {
    return { result: false, message: err?.message || "순서를 저장하지 못했습니다." };
  }
}
