import { describe, it, expect, vi, beforeEach } from "vitest";

// 실제 DB 대신 연결 결과를 정할 수 있는 가짜 MongoClient
const connect = vi.fn();
vi.mock("mongodb", () => ({
  MongoClient: vi.fn().mockImplementation(function () {
    return { connect };
  }),
}));

beforeEach(() => {
  vi.resetModules();
  connect.mockReset();
});

describe("connectDB", () => {
  it("파일을 읽기만 해서는 연결하지 않는다", async () => {
    await import("./mongodb.js");
    expect(connect).not.toHaveBeenCalled();
  });

  it("연결에 실패하면 기억하지 않고 다음에 다시 연결한다", async () => {
    const client = { db: () => "db" };
    connect.mockRejectedValueOnce(Object.assign(new Error("timeout"), { name: "MongoServerSelectionError" })).mockResolvedValueOnce(client);
    const { connectDB } = await import("./mongodb.js");
    await expect((async () => await connectDB)()).rejects.toThrow("timeout");
    expect(await connectDB).toBe(client);
    expect(await connectDB).toBe(client); // 성공한 연결은 다시 씀
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
