/// <reference types="jest" />
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ClinicAdminService } from "./clinic-admin.service";

describe("ClinicAdminService", () => {
  let service: ClinicAdminService;
  let clinics: Record<string, jest.Mock>;
  let services: Record<string, jest.Mock>;
  let clinic: any;

  beforeEach(() => {
    clinic = {
      id: "c1",
      name: "A",
      address: "x",
      location: null,
      contactNumber: "017",
      description: null,
      status: "ACTIVE",
    };
    clinics = {
      find: jest.fn().mockResolvedValue([clinic]),
      findOne: jest.fn().mockResolvedValue(clinic),
      save: jest.fn().mockImplementation(async (c) => c),
      create: jest.fn().mockImplementation((c) => ({ id: "new", ...c })),
    };
    services = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({
        id: "s1",
        clinicId: "c1",
        serviceName: "X-Ray",
        availabilityStatus: "AVAILABLE",
      }),
      save: jest.fn().mockImplementation(async (s) => s),
      create: jest.fn().mockImplementation((s) => ({ id: "s-new", ...s })),
      remove: jest.fn(),
    };
    service = new ClinicAdminService(clinics as any, services as any);
  });

  it("creates clinics as ACTIVE", async () => {
    const created = await service.createClinic({
      name: "B",
      address: "y",
      contactNumber: "018",
    });
    expect(created.status).toBe("ACTIVE");
    expect(created.location).toBeNull();
  });

  it("returns 404 for a missing clinic", async () => {
    clinics.findOne.mockResolvedValue(null);
    await expect(service.getClinic("nope")).rejects.toThrow(NotFoundException);
  });

  it("refuses an empty clinic update", async () => {
    await expect(service.updateClinic("c1", {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it("delete is a soft delete (INACTIVE)", async () => {
    expect((await service.deleteClinic("c1")).status).toBe("INACTIVE");
  });

  it("services are always looked up inside their own clinic", async () => {
    await service.getServiceForClinic("c1", "s1");
    expect(services.findOne).toHaveBeenCalledWith({
      where: { id: "s1", clinicId: "c1" },
    });
  });

  it("deleting a service removes it for real", async () => {
    await service.deleteServiceForClinic("c1", "s1");
    expect(services.remove).toHaveBeenCalled();
  });
});


