import { NotFoundException } from "@nestjs/common";
import { ClinicAdminService } from "../../src/modules/clinic-admin/clinic-admin.service";

describe("ClinicAdminService", () => {
  const dataSource = { query: jest.fn() };
  let service: ClinicAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ClinicAdminService(dataSource as never);
  });

  it("returns clinic dashboard aggregates", async () => {
    dataSource.query.mockResolvedValueOnce([{ id: "clinic-1", name: "Rural Clinic" }]).mockResolvedValueOnce([{ total: 8, requested: 2, approved: 3, completed: 3 }]).mockResolvedValueOnce([{ total: 4 }]).mockResolvedValueOnce([{ total: 5, available: 4 }]);
    const result = await service.dashboard("clinic-1");
    expect(result.appointments.total).toBe(8);
    expect(result.doctors.total).toBe(4);
    expect(result.services.available).toBe(4);
  });

  it("rejects updates for unknown clinic services", async () => {
    dataSource.query.mockResolvedValue([]);
    await expect(service.updateService("clinic-1", "service-1", { availabilityStatus: "UNAVAILABLE" })).rejects.toBeInstanceOf(NotFoundException);
  });
});
