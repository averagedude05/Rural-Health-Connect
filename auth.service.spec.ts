/// <reference types="jest" />
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

jest.mock("@/config/app.config", () => ({
  appConfig: {
    env: {
      JWT_BEARER_SECRET: "bearer-secret",
      JWT_REFRESH_SECRET: "refresh-secret",
    },
  },
}));

describe("AuthService", () => {
  let service: AuthService;
  let usersService: Record<string, jest.Mock>;
  let sessions: Record<string, jest.Mock>;
  let jwt: JwtService;
  let activeUser: any;

  beforeEach(async () => {
    activeUser = {
      id: "u1",
      role: "ROLE_PATIENT",
      phone: "01711111111",
      accountStatus: "ACTIVE",
      passwordHash: await argon2.hash("Password1!", { type: argon2.argon2id }),
    };
    usersService = {
      createPatient: jest.fn(),
      findByPhoneWithPassword: jest.fn().mockResolvedValue(activeUser),
      findByIdWithPassword: jest.fn().mockResolvedValue(activeUser),
      findOneById: jest.fn().mockResolvedValue(activeUser),
      updateUser: jest.fn(),
    };
    sessions = {
      blacklistAccessToken: jest.fn(),
      isAccessTokenBlacklisted: jest.fn().mockResolvedValue(false),
      blacklistRefreshToken: jest.fn(),
      isRefreshTokenBlacklisted: jest.fn().mockResolvedValue(false),
    };
    jwt = new JwtService();
    service = new AuthService(usersService as any, jwt, sessions as any);
  });

  it("signs in with Argon2 and does not add jti or sv claims", async () => {
    const result = await service.signIn({
      phone: "01711111111",
      password: "Password1!",
    });
    const accessPayload = jwt.decode(result.access_token) as Record<string, unknown>;
    const refreshPayload = jwt.decode(result.refresh_token) as Record<string, unknown>;

    expect(result.expires_in).toBe(900);
    expect(result.user.id).toBe("u1");
    expect(accessPayload).not.toHaveProperty("jti");
    expect(accessPayload).not.toHaveProperty("sv");
    expect(refreshPayload).not.toHaveProperty("jti");
    expect(refreshPayload).not.toHaveProperty("sv");
  });

  it("upgrades a valid legacy bcrypt hash after login", async () => {
    activeUser.passwordHash = await bcrypt.hash("Password1!", 4);
    await service.signIn({ phone: activeUser.phone, password: "Password1!" });
    expect(usersService.updateUser).toHaveBeenCalledWith("u1", {
      password: "Password1!",
    });
  });

  it("rejects an unknown phone with the normal credentials error", async () => {
    usersService.findByPhoneWithPassword.mockResolvedValue(null);
    await expect(
      service.signIn({ phone: "01799999999", password: "Password1!" }),
    ).rejects.toThrow("Phone number or password is incorrect");
  });

  it("rejects a suspended account", async () => {
    activeUser.accountStatus = "SUSPENDED";
    await expect(
      service.signIn({ phone: activeUser.phone, password: "Password1!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  describe("refresh", () => {
    const current = {
      id: "u1",
      role: "ROLE_PATIENT",
      expiresAt: Math.floor(Date.now() / 1000) + 60,
    };

    it("blacklists the used refresh token and issues another pair", async () => {
      const result = await service.refresh(current, "previous-refresh-token");
      expect(sessions.blacklistRefreshToken).toHaveBeenCalledWith(
        "previous-refresh-token",
        current.expiresAt,
      );
      expect(result.refresh_token).toBeDefined();
    });

    it("rejects an inactive account or changed role", async () => {
      activeUser.accountStatus = "SUSPENDED";
      await expect(
        service.refresh(current, "previous-refresh-token"),
      ).rejects.toThrow(UnauthorizedException);
      activeUser.accountStatus = "ACTIVE";
      activeUser.role = "ROLE_DOCTOR";
      await expect(
        service.refresh(current, "previous-refresh-token"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  it("logout blacklists verified refresh and access tokens", async () => {
    const tokens = await service.signTokens(activeUser);
    const refreshExp = (jwt.decode(tokens.refresh_token) as any).exp;
    const accessExp = (jwt.decode(tokens.access_token) as any).exp;
    await service.logout(tokens.refresh_token, tokens.access_token);

    expect(sessions.blacklistRefreshToken).toHaveBeenCalledWith(
      tokens.refresh_token,
      refreshExp,
    );
    expect(sessions.blacklistAccessToken).toHaveBeenCalledWith(
      tokens.access_token,
      accessExp,
    );
  });

  it("does not blacklist unverified tokens", async () => {
    await expect(
      service.logout("bad-refresh-token", "bad-access-token"),
    ).resolves.toEqual({ message: "Logged out successfully" });
    expect(sessions.blacklistRefreshToken).not.toHaveBeenCalled();
    expect(sessions.blacklistAccessToken).not.toHaveBeenCalled();
  });

  it("checks the current password before changing it", async () => {
    const user = { id: "u1", role: "ROLE_PATIENT", roles: ["ROLE_PATIENT"] };
    await expect(
      service.changePassword(user, {
        currentPassword: "incorrect-password",
        newPassword: "NewPassword1",
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(usersService.updateUser).not.toHaveBeenCalled();
  });

  it("rejects reusing the current password", async () => {
    const user = { id: "u1", role: "ROLE_PATIENT", roles: ["ROLE_PATIENT"] };
    await expect(
      service.changePassword(user, {
        currentPassword: "Password1!",
        newPassword: "Password1!",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("verifies active users without a session-version claim", async () => {
    const { access_token } = await service.signTokens(activeUser);
    await expect(service.verifyAuthToken(access_token)).resolves.toMatchObject({
      id: "u1",
      roles: ["ROLE_PATIENT"],
    });
    activeUser.accountStatus = "SUSPENDED";
    await expect(service.verifyAuthToken(access_token)).resolves.toBeNull();
  });
});
