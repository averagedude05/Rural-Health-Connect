import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import * as bcrypt from "bcrypt";
import { appConfig } from "@/config/app.config";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { User } from "@/modules/users/entities/user.entity";
import { UsersService } from "@/modules/users/users.service";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AuthSessionService,
  REFRESH_TOKEN_TTL_SECONDS,
} from "./auth-session.service";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterPatientDto,
} from "./dto/auth.dto";
import { RefreshTokenUser } from "./refresh-jwt.strategy";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const INVALID_CREDENTIALS = "Phone number or password is incorrect";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async registerPatient(dto: RegisterPatientDto) {
    return this.usersService.createPatient(dto);
  }

  async signIn(dto: LoginDto) {
    const user = await this.checkUserByPhone(dto.phone);
    const authenticatedUser = await this.validateUser(user, dto.password);
    const tokens = await this.signTokens(authenticatedUser);

    return {
      ...tokens,
      user: {
        id: authenticatedUser.id,
        role: authenticatedUser.role,
        phone: authenticatedUser.phone,
        accountStatus: authenticatedUser.accountStatus,
      },
    };
  }

  async checkUserByPhone(phone: string): Promise<User | null> {
    return this.usersService.findByPhoneWithPassword(phone);
  }

  /** Verifies Argon2 hashes and upgrades valid legacy bcrypt hashes. */
  async validateUser(user: User | null, password: string): Promise<User> {
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const passwordMatches = await this.verifyPassword(password, user.passwordHash);
    if (!passwordMatches || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (/^\$2[aby]\$/.test(user.passwordHash)) {
      await this.usersService.updateUser(user.id, { password });
    }

    return user;
  }

  private async verifyPassword(password: string, passwordHash: string) {
    if (/^\$2[aby]\$/.test(passwordHash)) {
      return bcrypt.compare(password, passwordHash);
    }

    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  async signTokens(user: Pick<User, "id" | "role">): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: appConfig.env.JWT_BEARER_SECRET,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: appConfig.env.JWT_REFRESH_SECRET,
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async refresh(
    current: RefreshTokenUser,
    refreshToken: string,
  ): Promise<TokenPair> {
    const user = await this.usersService.findOneById(current.id);
    if (
      !user ||
      user.accountStatus !== AccountStatus.ACTIVE ||
      user.role !== current.role
    ) {
      throw new UnauthorizedException(
        "Account is inactive or token is no longer valid",
      );
    }

    await this.authSessionService.blacklistRefreshToken(
      refreshToken,
      current.expiresAt,
    );
    return this.signTokens(user);
  }

  async logout(refreshToken: string, accessToken?: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ exp: number }>(
        refreshToken,
        { secret: appConfig.env.JWT_REFRESH_SECRET },
      );
      await this.authSessionService.blacklistRefreshToken(
        refreshToken,
        payload.exp,
      );
    } catch {
      // Expired or malformed tokens need no blacklist entry.
    }

    if (accessToken) {
      try {
        const payload = await this.jwtService.verifyAsync<{ exp: number }>(
          accessToken,
          { secret: appConfig.env.JWT_BEARER_SECRET },
        );
        await this.authSessionService.blacklistAccessToken(
          accessToken,
          payload.exp,
        );
      } catch {
        // Expired or malformed tokens need no blacklist entry.
      }
    }

    return { message: "Logged out successfully" };
  }

  async changePassword(user: AuthUser, dto: ChangePasswordDto) {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        "New password must be different from the current password",
      );
    }

    const account = await this.usersService.findByIdWithPassword(user.id);
    const currentMatches = account
      ? await this.verifyPassword(dto.currentPassword, account.passwordHash)
      : false;
    if (!account || !currentMatches) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // The changed password is saved as Argon2; existing tokens remain valid until expiry.
    await this.usersService.updateUser(user.id, { password: dto.newPassword });
    return { message: "Password changed successfully" };
  }

  async verifyAuthToken(token: string): Promise<AuthUser | null> {
    let payload: { sub?: string; role?: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: appConfig.env.JWT_BEARER_SECRET,
      });
    } catch {
      return null;
    }
    if (!payload.sub || !payload.role) return null;

    const user = await this.usersService.findOneById(payload.sub);
    if (
      !user ||
      user.accountStatus !== AccountStatus.ACTIVE ||
      user.role !== payload.role
    ) {
      return null;
    }

    return { id: user.id, role: user.role, roles: [user.role] };
  }
}
