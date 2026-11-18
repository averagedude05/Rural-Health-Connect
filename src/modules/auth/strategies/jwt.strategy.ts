import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DataSource } from "typeorm";
import { appConfig } from "@/config/app.config";

interface JwtPayload {
  sub: string;
  role: string;
}

interface UserAuthRow {
  role: string;
  account_status: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly dataSource: DataSource) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.env.JWT_BEARER_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub || !payload.role) {
      throw new UnauthorizedException("Invalid access token");
    }

    const accounts = (await this.dataSource.query(
      `SELECT "role", "account_status" FROM "users" WHERE "id" = $1`,
      [payload.sub],
    )) as UserAuthRow[];
    const account = accounts[0];

    if (!account || account.account_status !== "ACTIVE") {
      throw new UnauthorizedException("Account is inactive or unavailable");
    }

    const role = account.role.toUpperCase();
    if (role !== payload.role.toUpperCase()) {
      throw new ForbiddenException("Token role no longer matches the account");
    }

    const normalizedRole = role.startsWith("ROLE_") ? role : `ROLE_${role}`;

    return {
      id: payload.sub,
      sub: payload.sub,
      role,
      roles: [normalizedRole],
    };
  }
}
