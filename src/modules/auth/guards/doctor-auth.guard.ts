
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

interface DoctorRequest extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

@Injectable()
export class DoctorAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<DoctorRequest>();

    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedException("Doctor authentication required");
    }

    const token = authorization.substring(7);

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token);

      if (!payload.sub || payload.role !== "DOCTOR") {
        throw new UnauthorizedException("Doctor access only");
      }

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
