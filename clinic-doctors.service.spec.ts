/// <reference types="jest" />
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { ClinicDoctorsService } from "./clinic-doctors.service";

// app.config validates the whole .env on import - replace it for unit tests.
jest.mock("@/config/app.config", () => ({
  appConfig: { recommended_bycrypt_rounds: 4, env: {} },
}));

describe("ClinicDoctorsService", () => {
  let service: ClinicDoctorsService;
  let doctors: Record<string, jest.Mock>;
  let slots: Record<string, jest.Mock>;
  let users: Record<string, jest.Mock>;
  let overlap: boolean;
  let slot: any;

  beforeEach(() => {
    overlap = false;
    slot = {
      id: "a1",
      doctorId: "d1",
      availableDate: "2026-12-01",
      startTime: "09:00:00",
      endTime: "10:00:00",
      slotStatus: "AVAILABLE",
    };
    doctors = {
      findOne: jest.fn().mockResolvedValue({
        id: "d1",
        userId: "u1",
        clinicId: "c1",
        name: "Dr",
        specialization: "GP",
        user: { phone: "017", accountStatus: "ACTIVE" },
      }),
      save: jest.fn().mockImplementation(async (d) => d),
    };
    slots = {
      findOne: jest.fn().mockResolvedValue(slot),
      save: jest.fn().mockImplementation(async (s) => s),
      create: jest.fn().mockImplementation((s) => ({
        id: "new",
        slotStatus: "AVAILABLE",
        ...s,
      })),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => {
        const qb: any = {
          where: () => qb,
          andWhere: () => qb,
          getExists: async () => overlap,
        };
        return qb;
      }),
    };
    users = {
      updateStatus: jest
        .fn()
        .mockResolvedValue({ id: "u1", accountStatus: "SUSPENDED" }),
    };
    service = new ClinicDoctorsService(
      doctors as any,
      slots as any,
      {} as any,
      users as any,
      { getClinicById: jest.fn() } as any,
    );
  });

  it("a doctor from another clinic is a 404", async () => {
    doctors.findOne.mockResolvedValue(null);
    await expect(service.getDoctor("other", "d1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("deleting a doctor suspends the account (soft delete)", async () => {
    const result = await service.deleteDoctor("c1", "d1");
    expect(users.updateStatus).toHaveBeenCalledWith("u1", "SUSPENDED");
    expect(result.accountStatus).toBe("SUSPENDED");
  });

  describe("availability", () => {
    it("rejects a start time that is not before the end time", async () => {
      await expect(
        service.createDoctorAvailability("c1", "d1", {
          availableDate: "2026-12-01",
          startTime: "10:00",
          endTime: "09:00",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("rejects overlapping slots", async () => {
      overlap = true;
      await expect(
        service.createDoctorAvailability("c1", "d1", {
          availableDate: "2026-12-01",
          startTime: "09:30",
          endTime: "10:30",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("stores and returns times as HH:MM:SS", async () => {
      const created = await service.createDoctorAvailability("c1", "d1", {
        availableDate: "2026-12-01",
        startTime: "11:00",
        endTime: "12:00",
      });
      expect(created.startTime).toBe("11:00:00");
      expect(created.endTime).toBe("12:00:00");
    });

    it("a booked (TAKEN) slot can be neither changed nor deleted", async () => {
      slot.slotStatus = "TAKEN";
      await expect(
        service.updateDoctorAvailability("c1", "d1", "a1", {
          slotStatus: "UNAVAILABLE" as any,
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.deleteDoctorAvailability("c1", "d1", "a1"),
      ).rejects.toThrow(ConflictException);
      expect(slots.remove).not.toHaveBeenCalled();
    });

    it("requires at least one field to update", async () => {
      await expect(
        service.updateDoctorAvailability("c1", "d1", "a1", {}),
      ).rejects.toThrow(BadRequestException);
    });
  });
});


