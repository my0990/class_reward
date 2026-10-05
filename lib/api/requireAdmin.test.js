import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
const { getServerSession } = await import("next-auth");
const { requireAdmin, requireTeacher, requireMember, ApiError } = await import("@/lib/api/routeHelpers");

const admin = (extra = {}) => ({
  user: { role: "admin", _id: "a".repeat(24), email: "boss@test.com", expiresAt: Date.now() + 60_000, ...extra },
});

beforeEach(() => vi.stubEnv("ADMIN_EMAILS", "boss@test.com"));
afterEach(() => vi.unstubAllEnvs());

describe("requireAdmin", () => {
  it("관리자 세션은 통과", async () => {
    getServerSession.mockResolvedValue(admin());
    await expect(requireAdmin()).resolves.toMatchObject({ adminEmail: "boss@test.com" });
  });

  it.each([
    ["교사", { role: "teacher" }],
    ["허용 목록에서 빠진 관리자", { email: "old@test.com" }],
    ["만료된 관리자 세션", { expiresAt: Date.now() - 1 }],
  ])("%s는 403", async (_, extra) => {
    getServerSession.mockResolvedValue(admin(extra));
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it("관리자는 교사/학생용 API를 쓸 수 없다", async () => {
    getServerSession.mockResolvedValue(admin());
    await expect(requireTeacher()).rejects.toBeInstanceOf(ApiError);
    await expect(requireMember()).rejects.toMatchObject({ status: 403 });
  });
});
