import { appConfig } from "@/config/app.config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { UsersService } from "@/modules/users/users.service";
import { AuthSessionService } from "./auth-session.service";

interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly usersService: UsersService,
    private readonly authSessionService: AuthSessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.env.JWT_BEARER_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException("Invalid access token");
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (
      token &&
      (await this.authSessionService.isAccessTokenBlacklisted(token))
    ) {
      throw new UnauthorizedException(
        "Session expired or logged out. Please login again.",
      );
    }

    const user = await this.usersService.findOneById(payload.sub);
    if (
      !user ||
      user.accountStatus !== AccountStatus.ACTIVE ||
      user.role !== payload.role
    ) {
      throw new UnauthorizedException(
        "Account is inactive or token is no longer valid",
      );
    }

    return { id: user.id, role: user.role, roles: [user.role] };
  }
}
