/// <reference types="jest" />
import {
  ClinicAdminController,
  ClinicDoctorsController,
  ClinicOperationsController,
  ClinicReportsController,
} from "./clinic-admin.controller";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { ROLES_KEY } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";

// app.config validates the whole .env on import - replace it for unit tests.
jest.mock("@/config/app.config", () => ({
  appConfig: { recommended_bycrypt_rounds: 4, env: {} },
}));

describe("Admin controllers - authorization wiring", () => {
  it.each([
    ClinicAdminController,
    ClinicDoctorsController,
    ClinicOperationsController,
    ClinicReportsController,
  ])("%p is locked to authenticated ADMIN users", (controller) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, controller)).toEqual([
      JwtGuard,
      RolesGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller)).toEqual([Role.ADMIN]);
  });
});





