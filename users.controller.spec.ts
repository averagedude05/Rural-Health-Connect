/// <reference types="jest" />
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { ROLES_KEY } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { UsersController } from "./users.controller";

// app.config validates the whole .env on import - replace it for unit tests.
jest.mock("@/config/app.config", () => ({
  appConfig: { recommended_bycrypt_rounds: 4, env: {} },
}));

describe("UsersController - authorization wiring", () => {
  it("every route needs a valid token AND the ADMIN role", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, UsersController)).toEqual([
      JwtGuard,
      RolesGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, UsersController)).toEqual([
      Role.ADMIN,
    ]);
  });
});
