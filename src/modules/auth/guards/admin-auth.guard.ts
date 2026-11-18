
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { DataSource } from "typeorm";

interface AdminRequest extends Request {
  user?: { sub: string; role: string };
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Admin bearer token is required");
    }

    let payload: { sub: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token);
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired admin token");
    }

    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException("Invalid admin token");
    }

    if (payload.role.toUpperCase() !== "ADMIN") {
      throw new ForbiddenException("Only an admin can manage doctors");
    }

    const activeAdmins = (await this.dataSource.query(
      `SELECT "users"."id"
       FROM "users"
       INNER JOIN "admin_profiles" ON "admin_profiles"."user_id" = "users"."id"
       WHERE "users"."id" = $1
         AND "users"."role" = 'ADMIN'
         AND "users"."account_status" = 'ACTIVE'`,
      [payload.sub],
    )) as Array<{ id: string }>;

    if (activeAdmins.length === 0) {
      throw new UnauthorizedException(
        "Admin account is inactive or unavailable",
      );
    }

    request.user = payload;
    return true;
  }
}
