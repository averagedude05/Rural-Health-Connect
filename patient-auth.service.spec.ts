import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { PatientAuthService } from "../../src/modules/patient-auth/patient-auth.service";

jest.mock("argon2", () => ({ hash: jest.fn(), verify: jest.fn() }));

const argon2 = jest.requireMock("argon2") as { hash: jest.Mock; verify: jest.Mock };

describe("PatientAuthService", () => {
  const manager = { query: jest.fn() };
  const dataSource = { transaction: jest.fn(), query: jest.fn() };
  const jwtService = { signAsync: jest.fn() };
  let service: PatientAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation((callback: (value: typeof manager) => unknown) => callback(manager));
    service = new PatientAuthService(dataSource as never, jwtService as never);
  });

  it("registers a patient and returns an access token", async () => {
    argon2.hash.mockResolvedValue("stored-hash");
    manager.query.mockResolvedValueOnce([{ id: "user-1", phone: "+8801712345678", role: "PATIENT" }]).mockResolvedValueOnce([{ id: "patient-1", name: "Amina" }]);
    jwtService.signAsync.mockResolvedValue("token");
    const result = await service.register({ phone: "+8801712345678", password: "long-password", name: "Amina" });
    expect(result.accessToken).toBe("token");
    expect(manager.query).toHaveBeenCalledTimes(2);
    expect(argon2.hash).toHaveBeenCalledWith("long-password");
  });

  it("maps duplicate phone numbers to a conflict", async () => {
    dataSource.transaction.mockRejectedValue({ driverError: { code: "23505" } });
    await expect(service.register({ phone: "+8801712345678", password: "long-password", name: "Amina" })).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects invalid patient credentials", async () => {
    dataSource.query.mockResolvedValue([]);
    await expect(service.login({ phone: "+8801712345678", password: "wrong" })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("signs in an active patient", async () => {
    dataSource.query.mockResolvedValue([{ id: "user-1", phone: "+8801712345678", role: "PATIENT", password_hash: "stored-hash", account_status: "ACTIVE", profile_id: "patient-1", name: "Amina" }]);
    argon2.verify.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue("token");
    const result = await service.login({ phone: "+8801712345678", password: "long-password" });
    expect(result.accessToken).toBe("token");
    expect(argon2.verify).toHaveBeenCalledWith("stored-hash", "long-password");
  });
});
