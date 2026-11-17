import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import { Request } from "express";

interface TokenRequest extends Request {
  user?: { sub: string; role: string };
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TokenRequest>();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) throw new UnauthorizedException("Bearer token is required");
    let payload: { sub: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
    if (!payload.sub || !payload.role) throw new UnauthorizedException("Invalid access token");
    const rows = await this.dataSource.query(`SELECT "role", "account_status" FROM "users" WHERE "id" = $1`, [payload.sub]) as Array<{ role: string; account_status: string }>;
    const user = rows[0];
    if (!user || user.account_status !== "ACTIVE") throw new UnauthorizedException("Account is inactive or unavailable");
    if (user.role.toUpperCase() !== payload.role.toUpperCase()) throw new ForbiddenException("Token role no longer matches the account");
    request.user = { sub: payload.sub, role: user.role.toUpperCase() };
    return true;
  }
}
