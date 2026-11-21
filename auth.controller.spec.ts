/// <reference types="jest" />
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RefreshJwtGuard } from "@/common/guard/refresh-jwt.guard";
import { AuthController } from "./auth.controller";

jest.mock("@/config/app.config", () => ({
  appConfig: { env: { JWT_BEARER_SECRET: "a", JWT_REFRESH_SECRET: "b" } },
}));

const guardsOf = (method: keyof AuthController) =>
  Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype[method]) ?? [];

describe("AuthController - authentication wiring", () => {
  it("login, registration and logout are public", () => {
    for (const method of ["login", "registerPatient", "logout"] as const) {
      expect(guardsOf(method)).toEqual([]);
    }
  });

  it("refresh is protected by RefreshJwtGuard", () => {
    expect(guardsOf("refresh")).toContain(RefreshJwtGuard);
  });

  it("me and change-password need an access token", () => {
    for (const method of ["getCurrentUser", "changePassword"] as const) {
      expect(guardsOf(method)).toContain(JwtGuard);
    }
  });
});
