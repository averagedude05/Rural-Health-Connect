import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import { Request } from "express";

interface AdminRequest extends Request {
  user?: { sub: string; role: string };
  params: { clinicId?: string };
}

@Injectable()
export class ClinicAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) throw new UnauthorizedException("Bearer token is required");
    let payload: { sub: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
    if (!payload.sub || payload.role?.toUpperCase() !== "ADMIN") throw new ForbiddenException("Clinic administrator access required");
    const accounts = await this.dataSource.query(
      `SELECT "id" FROM "users" WHERE "id" = $1 AND "role" = 'ADMIN' AND "account_status" = 'ACTIVE' AND EXISTS (SELECT 1 FROM "admin_profiles" WHERE "user_id" = "users"."id")`,
      [payload.sub],
    ) as Array<{ id: string }>;
    if (!accounts.length) throw new UnauthorizedException("Admin account is inactive or unavailable");
    if (request.params.clinicId) {
      const assignments = await this.dataSource.query(
        `SELECT "id" FROM "clinic_admin_assignments" WHERE "user_id" = $1 AND "clinic_id" = $2`,
        [payload.sub, request.params.clinicId],
      ) as Array<{ id: string }>;
      if (!assignments.length) throw new ForbiddenException("You are not assigned to this clinic");
    }
    request.user = { sub: payload.sub, role: "ADMIN" };
    return true;
  }
}
