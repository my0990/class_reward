import { describe, it, expect } from "vitest";
import { smallImageUrl } from "./profileImage.js";

describe("프로필 사진 작은 파일", () => {
  const base = "https://cdn.pixabay.com/photo/2014/03/25/15/23/tangerine-296654";
  it("pixabay 사진은 표시 크기에 맞는 파일로", () => {
    expect(smallImageUrl(`${base}_1280.png`, 76)).toBe(`${base}_150.png`);
    expect(smallImageUrl(`${base}_1280.png`, 100)).toBe(`${base}_150.png`);
    expect(smallImageUrl(`${base}_1280.png`, 165)).toBe(`${base}_640.png`);
  });
  it("다른 주소·빈 값은 그대로", () => {
    expect(smallImageUrl("https://example.com/a.png", 100)).toBe("https://example.com/a.png");
    expect(smallImageUrl(undefined)).toBeUndefined();
  });
});
