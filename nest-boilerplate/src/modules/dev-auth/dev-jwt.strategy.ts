import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface PatientTokenPayload {
  id?: string;
  roles?: string[];
}

@Injectable()
export class DevJwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    const secret = process.env.JWT_BEARER_SECRET;

    if (!secret) {
      throw new Error("JWT_BEARER_SECRET is not configured");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: PatientTokenPayload) {
    if (!payload.id) {
      throw new UnauthorizedException("Invalid token");
    }

    return {
      id: payload.id,
      roles: payload.roles ?? [],
    };
  }
}