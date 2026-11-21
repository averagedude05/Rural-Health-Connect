import { appConfig } from "@/config/app.config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthSessionService } from "./auth-session.service";

interface RefreshJwtPayload {
  sub: string;
  role: string;
  exp: number;
}

/** What RefreshJwtGuard puts on `req.user` for POST /auth/refresh. */
export interface RefreshTokenUser {
  id: string;
  role: string;
  expiresAt: number;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  "refresh-jwt",
) {
  constructor(private readonly authSessionService: AuthSessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: appConfig.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: RefreshJwtPayload,
  ): Promise<RefreshTokenUser> {
    if (!payload.sub || !payload.role || !payload.exp) {
      throw new UnauthorizedException("Refresh token payload is invalid");
    }

    const token = ExtractJwt.fromBodyField("refreshToken")(req);
    if (token && (await this.authSessionService.isRefreshTokenBlacklisted(token))) {
      throw new UnauthorizedException("Refresh token has been revoked");
    }

    return {
      id: payload.sub,
      role: payload.role,
      expiresAt: payload.exp,
    };
  }
}
