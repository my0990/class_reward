import { describe, it, expect } from "vitest";
import { orderedProfileImgIds } from "./profileImgOrder.js";

const storage = { a: {}, b: {}, c: {}, d: {} };

describe("orderedProfileImgIds", () => {
  it("정한 순서대로, 순서에 없는 것은 뒤에 원래 순서대로", () => {
    expect(orderedProfileImgIds(storage, ["c", "a"])).toEqual(["c", "a", "b", "d"]);
  });
  it("이미 지워진 이미지 id, 중복 id는 무시", () => {
    expect(orderedProfileImgIds(storage, ["x", "b", "b", "a"])).toEqual(["b", "a", "c", "d"]);
  });
  it("순서가 없으면 원래 순서", () => {
    expect(orderedProfileImgIds(storage, undefined)).toEqual(["a", "b", "c", "d"]);
    expect(orderedProfileImgIds(undefined, ["a"])).toEqual([]);
  });
});
