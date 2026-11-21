/// <reference types="jest" />
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";

jest.mock("@/config/app.config", () => ({
  appConfig: { env: {} },
}));

describe("UsersService", () => {
  let service: UsersService;
  let repo: Record<string, jest.Mock>;
  let patients: Record<string, jest.Mock>;
  let dataSource: { transaction: jest.Mock };
  let user: any;

  beforeEach(() => {
    user = {
      id: "u1",
      role: "ROLE_PATIENT",
      phone: "01711111111",
      accountStatus: "ACTIVE",
    };
    repo = {
      find: jest.fn().mockResolvedValue([user]),
      findOne: jest.fn().mockResolvedValue(user),
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockImplementation(async (u) => u),
      create: jest.fn().mockImplementation((u) => ({
        id: "new",
        createdAt: new Date(),
        ...u,
      })),
    };
    patients = {
      createForUser: jest.fn().mockResolvedValue({
        id: "p1",
        name: "Pat",
        dateOfBirth: null,
        address: null,
        emergencyContact: null,
      }),
    };
    dataSource = {
      transaction: jest.fn((cb) => cb({ getRepository: () => repo })),
    };
    service = new UsersService(
      repo as any,
      dataSource as any,
      patients as any,
    );
  });

  it("findById throws 404 for an unknown user", async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById("x")).rejects.toThrow(NotFoundException);
  });

  it("getUsers applies filters and paging", async () => {
    await service.getUsers({
      role: "ROLE_DOCTOR",
      accountStatus: "ACTIVE",
      limit: 10,
      offset: 5,
    } as any);
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: "ROLE_DOCTOR", accountStatus: "ACTIVE" },
        take: 10,
        skip: 5,
      }),
    );
  });

  describe("createAccount", () => {
    it("hashes the password and creates an ACTIVE account", async () => {
      const created = await service.createAccount({
        role: "ROLE_DOCTOR",
        phone: "01722222222",
        password: "Password1!",
      });
      expect(created.passwordHash).toMatch(/^\$argon2id\$/);
      expect(created.passwordHash).not.toContain("Password1!");
      expect(created.accountStatus).toBe("ACTIVE");
    });

    it("rejects a duplicate phone with 409", async () => {
      repo.exists.mockResolvedValue(true);
      await expect(
        service.createAccount({
          role: "ROLE_DOCTOR",
          phone: "01711111111",
          password: "Password1!",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("turns a database unique-violation race into 409", async () => {
      repo.save.mockRejectedValue({ driverError: { code: "23505" } });
      await expect(
        service.createAccount({
          role: "ROLE_DOCTOR",
          phone: "01733333333",
          password: "Password1!",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  it("createPatient never returns the password hash", async () => {
    const result = await service.createPatient({
      phone: "01744444444",
      password: "Password1!",
      name: "Pat",
    });
    expect(JSON.stringify(result)).not.toContain("passwordHash");
    expect(result.user.role).toBe("ROLE_PATIENT");
    expect(patients.createForUser).toHaveBeenCalled();
  });

  describe("updateUser", () => {
    it("requires at least one field", async () => {
      await expect(service.updateUser("u1", {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it("a password reset saves an Argon2 hash", async () => {
      await service.updateUser("u1", { password: "BrandNewPass1" });
      expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    });

    it("a phone-only change updates the phone", async () => {
      await service.updateUser("u1", { phone: "01755555555" });
      expect(user.phone).toBe("01755555555");
    });

    it("rejects a phone that belongs to someone else", async () => {
      repo.exists.mockResolvedValue(true);
      await expect(
        service.updateUser("u1", { phone: "01766666666" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("updateStatus / deleteUser", () => {
    it("suspending updates the account status", async () => {
      const saved = await service.updateStatus("u1", "SUSPENDED" as any);
      expect(saved.accountStatus).toBe("SUSPENDED");
    });

    it("the system administrator can never be suspended or deleted", async () => {
      user.role = "ROLE_ADMIN";
      await expect(
        service.updateStatus("u1", "SUSPENDED" as any),
      ).rejects.toThrow(BadRequestException);
      await expect(service.deleteUser("u1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("deleteUser is a soft delete", async () => {
      expect((await service.deleteUser("u1")).accountStatus).toBe("SUSPENDED");
    });
  });
});



